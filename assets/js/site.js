/* WVU RAIL — site behaviour for the Design System build.
   Vanilla, no dependencies, no framework. */
(function () {
   "use strict";

   // Progressive enhancement flag. The publications filter is hidden by
   // default and only revealed once this runs, so a visitor without
   // JavaScript is never shown a control that cannot work.
   document.documentElement.classList.add("js");

   /* --- Print buttons ----------------------------------------------------
      Any <button data-action="print" hidden> is revealed here and wired to
      window.print(). Kept out of the markup so no page carries an inline
      onclick= handler; hidden until this runs so a visitor without JavaScript
      is never offered a button that does nothing (Ctrl+P still works). */
   [].slice.call(document.querySelectorAll('[data-action="print"]')).forEach(function (btn) {
      btn.hidden = false;
      btn.addEventListener("click", function () { window.print(); });
   });

   var disclosures = [].slice.call(document.querySelectorAll(".pub-section"));
   var revealSection = function (hash) {
      var section = document.getElementById(hash.replace(/^#/, ""));
      var disclosure = section && section.querySelector(".pub-section");
      if (disclosure) disclosure.open = true;
   };
   document.querySelectorAll('nav[aria-label="Publication types"] a').forEach(function (link) {
      link.addEventListener("click", function () { revealSection(link.hash); });
   });
   window.addEventListener("hashchange", function () { revealSection(window.location.hash); });
   revealSection(window.location.hash);
   var printState;
   window.addEventListener("beforeprint", function () {
      printState = disclosures.map(function (item) { return item.open; });
      disclosures.forEach(function (item) { item.open = true; });
   });
   window.addEventListener("afterprint", function () {
      disclosures.forEach(function (item, i) { item.open = printState[i]; });
   });

   /* --- Publications filter ---------------------------------------------
      Ported unchanged in behaviour from the previous site. On a 69-item page
      this is the difference between scanning and hunting. */
   var search = document.getElementById("pub-search");
   if (search) {
      var entries = [].slice.call(document.querySelectorAll(".pub"));
      var counter = document.querySelector(".pub-filter-count");
      var bands = [].slice.call(document.querySelectorAll(".pub-year"));

      // Index once. Re-reading 69 entries from the DOM on every keystroke is
      // wasteful, and textContent forces layout.
      entries.forEach(function (el) {
         el._haystack = (el.textContent || "").toLowerCase().replace(/\s+/g, " ");
      });

      // The type-level wrappers (#journal, #proceedings, #other) each carry an
      // eyebrow, an h2 and an intro paragraph above their year bands. When a
      // query empties a whole type that header should go too — the previous
      // site's section[id] rule. Found from the papers upward rather than by
      // naming ids, so a new type section is covered without touching this.
      var sections = [];
      entries.forEach(function (el) {
         var section = el.closest("[id]");
         if (section && sections.indexOf(section) === -1) { sections.push(section); }
      });

      var previousQuery = "";
      var openState = [];
      var apply = function () {
         var q = search.value.trim().toLowerCase();
         var hits = 0;
         if (q && !previousQuery) {
            openState = disclosures.map(function (item) { return item.open; });
         }
         disclosures.forEach(function (item, i) {
            if (q) item.open = true;
            else if (previousQuery) item.open = openState[i];
         });
         previousQuery = q;

         entries.forEach(function (el) {
            var show = !q || el._haystack.indexOf(q) !== -1;
            el.hidden = !show;
            if (show) { hits++; }
         });

         // A year band whose papers have all been filtered out should go too,
         // otherwise the page fills with empty headings. Each band is followed
         // by the <ul> holding that year's papers.
         bands.forEach(function (band) {
            var list = band.nextElementSibling;
            if (!list) { return; }
            var visible = list.querySelector(".pub:not([hidden])");
            band.hidden = q ? !visible : false;
            list.hidden = q ? !visible : false;
         });

         // Same again one level up: a type section with no visible paper left
         // loses its eyebrow, heading and intro until the query is cleared.
         sections.forEach(function (section) {
            var visible = section.querySelector(".pub:not([hidden])");
            section.hidden = q ? !visible : false;
         });

         if (counter) {
            counter.textContent = q
               ? hits + (hits === 1 ? " match" : " matches")
               : "";
         }
      };

      var t;
      search.addEventListener("input", function () {
         clearTimeout(t);
         t = setTimeout(apply, 120);
      });
      search.addEventListener("keydown", function (e) {
         if (e.key === "Escape") { search.value = ""; apply(); }
      });
   }
})();
