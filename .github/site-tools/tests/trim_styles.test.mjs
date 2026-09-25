import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { trimStyles } from "../scripts/trim_styles.mjs";

test("retains script-created classes and menu states in both stylesheets", async t => {
  const site = await mkdtemp(join(tmpdir(), "preview-css-"));
  t.after(() => rm(site, { recursive: true, force: true }));
  await writeFile(join(site, "index.html"), '<style>.unused{color:red}</style><nav class="menu">Menu</nav>');
  await writeFile(join(site, "site.js"), 'element.className = "dynamic-label";');
  const paths = ["assets/wvu-design-system", "dspira/assets/wvu-design-system"];
  for (const path of paths) {
    await mkdir(join(site, path), { recursive: true });
    await writeFile(join(site, path, "site.min.css"), ".menu.is-opened{display:block}.dynamic-label{color:blue}.unused{color:red}");
  }
  await trimStyles(site);
  for (const path of paths) {
    const css = await readFile(join(site, path, "site.min.css"), "utf8");
    assert.match(css, /\.menu\.is-opened/);
    assert.match(css, /\.dynamic-label/);
    assert.doesNotMatch(css, /\.unused/);
  }
});

test("rejects an empty build", async t => {
  const site = await mkdtemp(join(tmpdir(), "preview-css-"));
  t.after(() => rm(site, { recursive: true, force: true }));
  await assert.rejects(trimStyles(site), /No built HTML pages/);
});


test("trims a standalone production site", async t => {
  const site = await mkdtemp(join(tmpdir(), "production-css-"));
  t.after(() => rm(site, { recursive: true, force: true }));
  await writeFile(join(site, "index.html"), '<nav class="menu">Menu</nav>');
  await writeFile(join(site, "style.css"), ".menu{display:block}.unused{color:red}");
  await trimStyles(site, ["style.css"]);
  const css = await readFile(join(site, "style.css"), "utf8");
  assert.match(css, /\.menu/);
  assert.doesNotMatch(css, /\.unused/);
  await assert.rejects(trimStyles(site, ["missing.css"]), /ENOENT/);
});
