/* WVU RAIL — behaviour for the small astronomy web apps under /tools/.

   Depends on astro.js (pure computation; loaded first). One file serves all
   three pages: each block wires itself up only when its page's elements are
   present, keyed off element ids, so no page carries an inline handler or an
   inline <script>. That keeps the tools working under any plausible
   Content-Security-Policy on *.wvu.edu.

   Accessibility notes, carried over from the previous site:

     * The reading regions are rewritten once a second, so they cannot carry
       aria-live -- a screen reader would announce them continuously. Pages
       that announce do so ONLY from an explicit button press, into a separate
       visually-hidden role="status" node; the tick never touches that node.
     * WCAG 2.2.2: a reading that re-ticks every second must be stoppable, so
       every page has a Pause/Resume button (aria-pressed) that clears the
       interval.
     * The buttons ship disabled in the HTML so a visitor without JavaScript is
       never offered a control that cannot work; they are enabled here. */
(function () {
   "use strict";

   var GREEN_BANK = -79.8318;   // degrees, east-positive
   var MORGANTOWN = -79.9559;

   function byId(id) { return document.getElementById(id); }
   function hide(el) { if (el) { el.hidden = true; } }

   /* Start the once-a-second tick and wire the Pause/Resume toggle to it. */
   function startTicking(update, pauseBtn) {
      var timer = setInterval(update, 1000);
      if (!pauseBtn) { return; }
      pauseBtn.disabled = false;
      pauseBtn.addEventListener("click", function () {
         if (timer) {
            clearInterval(timer);
            timer = null;
            pauseBtn.textContent = "Resume updating";
            pauseBtn.setAttribute("aria-pressed", "true");
         } else {
            timer = setInterval(update, 1000);
            pauseBtn.textContent = "Pause updating";
            pauseBtn.setAttribute("aria-pressed", "false");
         }
      });
   }

   /* Enable a button and run `action` on click -- and on Enter inside any of
      the text `fields`, since there is no <form> to submit. */
   function onActivate(btn, fields, action) {
      if (!btn) { return; }
      btn.disabled = false;
      btn.addEventListener("click", action);
      fields.forEach(function (field) {
         field.addEventListener("keydown", function (e) {
            if (e.key === "Enter") { e.preventDefault(); action(); }
         });
      });
   }

   /* --- /tools/ : sidereal clocks ----------------------------------------- */
   function initClock() {
      var utc = byId("clock-utc");
      if (!utc) { return; }
      var gst = byId("clock-gst");
      var gb  = byId("clock-greenbank");
      var mtn = byId("clock-morgantown");

      function tick() {
         var now = new Date();
         utc.textContent = pad2(now.getUTCHours()) + ":" + pad2(now.getUTCMinutes()) + ":" + pad2(now.getUTCSeconds());
         gst.textContent = hmsFromHours(lstNow(now, 0));
         gb.textContent  = hmsFromHours(lstNow(now, GREEN_BANK));
         mtn.textContent = hmsFromHours(lstNow(now, MORGANTOWN));
      }

      hide(byId("clock-nojs"));
      tick();
      startTicking(tick, byId("clock-pause"));
   }

   /* --- /tools/lst/ : Local Sidereal Time for a longitude ------------------ */
   function initLst() {
      var time = byId("lst-time");
      if (!time) { return; }
      var forEl    = byId("lst-for");
      var lonIn    = byId("lst-long");
      var hemi     = byId("lst-hemi");
      var announce = byId("lst-announce");

      function currentLongitude() {
         var v = Math.abs(parseFloat(lonIn.value) || 0);
         if (v > 180) { v = 180; }
         var sign = hemi.value === "W" ? -1 : 1;
         return sign * v;
      }
      function update() {
         var lon = currentLongitude();
         time.textContent  = hmsFromHours(lstNow(new Date(), lon));
         forEl.textContent = "for longitude " + lon.toFixed(4) + "°";
      }
      // Announce only what an explicit Update press produced. The two spans
      // are joined with a comma so the reading is spoken as two phrases.
      function announceLst() {
         update();
         announce.textContent = "Local sidereal time " + time.textContent + ", " + forEl.textContent;
      }

      hide(byId("lst-nojs"));
      onActivate(byId("lst-update"), [lonIn], announceLst);
      update();
      startTicking(update, byId("lst-pause"));
   }

   /* --- /tools/coord/ : horizontal -> equatorial -------------------------- */
   function initCoord() {
      var readings = byId("coord-readings");
      if (!readings) { return; }
      var lstEl    = byId("coord-lst");
      var raEl     = byId("coord-ra");
      var decEl    = byId("coord-dec");
      var err      = byId("coord-error");
      var lonIn    = byId("coord-long");
      var lonHemi  = byId("coord-lon-hemi");
      var latIn    = byId("coord-lat");
      var latHemi  = byId("coord-lat-hemi");
      var azIn     = byId("coord-az");
      var altIn    = byId("coord-alt");
      var announce = byId("coord-announce");

      function signedVal(input, sel, posCode) {
         var v = Math.abs(parseFloat(input.value) || 0);
         var sign = sel.value === posCode ? 1 : -1;
         return sign * v;
      }
      function update() {
         var lon = signedVal(lonIn, lonHemi, "E");
         var lat = signedVal(latIn, latHemi, "N");
         var az  = parseFloat(azIn.value)  || 0;
         var alt = parseFloat(altIn.value) || 0;

         if (Math.abs(lon) > 180 || Math.abs(lat) > 90) {
            err.textContent = "Longitude must be 0–180 and latitude 0–90.";
            err.hidden = false;
            readings.hidden = true;
            return;
         }
         var lst = lstNow(new Date(), lon);
         var eq  = horizontalToEquatorial(az, alt, lat, lst);
         lstEl.textContent = hmsFromHours(lst);
         raEl.textContent  = hmsFromHours(eq.raHours);
         decEl.textContent = dmsFromDeg(eq.decDeg);
         err.hidden = true;
         readings.hidden = false;
      }
      // Announce only what an explicit Convert press produced.
      function announceCoords() {
         update();
         announce.textContent = err.hidden
            ? "Local Sidereal Time " + lstEl.textContent +
              ", Right Ascension " + raEl.textContent +
              ", Declination " + decEl.textContent
            : err.textContent;
      }

      hide(byId("coord-nojs"));
      onActivate(byId("coord-convert"), [lonIn, latIn, azIn, altIn], announceCoords);
      update();
      startTicking(update, byId("coord-pause"));
   }

   function init() {
      // astro.js supplies the maths. If it did not load, leave the pages in
      // their no-JavaScript state rather than throwing on the first tick.
      if (typeof lstNow !== "function") { return; }
      initClock();
      initLst();
      initCoord();
   }

   if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
   } else {
      init();
   }
})();
