"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "../..");

function page(kind) {
  const ids = kind === "lst"
    ? ["time", "for", "long", "hemi", "announce", "readings", "error", "nojs", "update", "pause"]
    : ["readings", "lst", "ra", "dec", "error", "long", "lon-hemi", "lat", "lat-hemi", "az", "alt", "announce", "nojs", "convert", "pause"];
  const elements = {};
  for (const id of ids) {
    elements[`${kind}-${id}`] = {
      value: "0", textContent: "", hidden: false, disabled: true, listeners: {},
      addEventListener(type, handler) { this.listeners[type] = handler; },
      setAttribute(name, value) { this[name] = value; }
    };
  }
  const el = id => elements[`${kind}-${id}`];
  if (kind === "lst") el("hemi").value = "E";
  else { el("lon-hemi").value = "E"; el("lat-hemi").value = "N"; }
  let tick;
  const context = vm.createContext({
    document: { readyState: "complete", getElementById: id => elements[id] || null },
    setInterval: fn => { tick = fn; return 1; }, clearInterval() {}
  });
  for (const file of ["astro.js", "tools.js"]) {
    vm.runInContext(fs.readFileSync(path.join(root, "assets/js", file), "utf8"), context);
  }
  return {
    el, tick: () => tick(),
    activate: () => el(kind === "lst" ? "update" : "convert").listeners.click()
  };
}

for (const kind of ["lst", "coord"]) {
  test(`${kind} rejects missing, partial, nondecimal, and nonfinite input and recovers`, () => {
    const p = page(kind);
    const fields = kind === "lst" ? ["long"] : ["long", "lat", "az", "alt"];
    for (const field of fields) {
      for (const value of ["", "  ", "garbage", "12abc", "Infinity", "NaN", "1e999", "0x10"]) {
        p.el(field).value = value;
        p.activate();
        assert.equal(p.el("error").hidden, false, `${field}: ${value}`);
        assert.equal(p.el("readings").hidden, true);
        assert.equal(p.el("announce").textContent, p.el("error").textContent);
        p.el(field).value = "0";
        p.activate();
        assert.equal(p.el("error").hidden, true);
        assert.equal(p.el("readings").hidden, false);
      }
    }
  });
  test(`${kind} timer updates do not repeatedly announce errors`, () => {
    const p = page(kind);
    p.el("long").value = "bad";
    p.tick();
    assert.equal(p.el("error").hidden, false);
    assert.equal(p.el("announce").textContent, "");
    p.activate();
    assert.match(p.el("announce").textContent, /numeric/);
  });
}

test("longitude and latitude limits are enforced without clamping", () => {
  for (const kind of ["lst", "coord"]) {
    const p = page(kind);
    for (const [field, limit] of kind === "lst" ? [["long", 180]] : [["long", 180], ["lat", 90]]) {
      for (const value of [String(limit + 1), String(-limit - 1)]) {
        p.el(field).value = value; p.activate();
        assert.equal(p.el("error").hidden, false, `${kind} ${field} ${value}`);
      }
      for (const value of ["0", String(limit), String(-limit)]) {
        p.el(field).value = value; p.activate();
        assert.equal(p.el("error").hidden, true, `${kind} ${field} ${value}`);
      }
      p.el(field).value = "0";
    }
  }
});

test("horizontal coordinates enforce altitude and azimuth limits", () => {
  const p = page("coord");
  for (const [field, invalid, valid] of [
    ["az", ["-1", "361", "400"], ["0", "360", "180.25"]],
    ["alt", ["-91", "91", "100"], ["-90", "0", "90"]]
  ]) {
    for (const value of invalid) {
      p.el(field).value = value; p.activate();
      assert.equal(p.el("error").hidden, false, `${field}: ${value}`);
    }
    for (const value of valid) {
      p.el(field).value = value; p.activate();
      assert.equal(p.el("error").hidden, true, `${field}: ${value}`);
    }
    p.el(field).value = "0";
  }
});

test("valid zenith coordinates retain declination equal to latitude and RA equal to LST", () => {
  const p = page("coord");
  p.el("lat").value = " 45.0 "; p.el("alt").value = "9e1"; p.activate();
  assert.equal(p.el("error").hidden, true);
  assert.equal(p.el("ra").textContent, p.el("lst").textContent);
  assert.match(p.el("dec").textContent, /45/);
  assert.doesNotMatch(p.el("dec").textContent, /NaN/);
});
