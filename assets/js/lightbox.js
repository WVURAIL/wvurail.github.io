/* WVU RAIL — gallery lightbox, for the DSPIRA archive pages.

   Ported from the previous site's site.js. A gallery is any element carrying
   data-lightbox; the thumbnails inside it are

     <a href="/images/full-size.jpg"><img src="..." alt="..."></a>

   optionally wrapped in a <figure> with a <figcaption>. Clicking a thumbnail
   opens the linked file in a modal dialog that this script builds once, on
   load, and appends to <body>; the caption under the image is a copy of that
   thumbnail's <figcaption>, when it has one.

   Progressive enhancement: the links keep their href, so with JavaScript off
   (or this file missing) a click opens the full-size file directly, which is
   what the lightbox shows anyway. A modified click (Ctrl, Cmd, Shift, Alt) is
   left to the browser so "open in new tab" keeps working, and a link with no
   image inside it is not intercepted.

   Keyboard, unchanged from the previous site:
     - focus moves to the Close button when the dialog opens;
     - Tab and Shift+Tab are contained in the dialog (with Close as the only
       focusable control, they simply keep focus on it);
     - Escape closes it, as does the Close button or a click on the backdrop;
     - on close, focus returns to the thumbnail link that opened it.
   Page scrolling is locked while the dialog is open.

   The dialog is role="dialog" aria-modal="true", styled with Design System /
   Bootstrap utilities only. The two things utilities cannot express -- a
   z-index above the sticky masthead, and a viewport-relative max-height for
   the image -- are set through the CSSOM (element.style), which a CSP without
   'unsafe-inline' still permits. No inline handlers, no inline <script>:
   everything attaches with addEventListener. Loaded with `defer` from the
   pages that carry a gallery. */
(function () {
   "use strict";

   var SVG_NS = "http://www.w3.org/2000/svg";

   function clear(node) {
      while (node.firstChild) { node.removeChild(node.firstChild); }
   }

   function setAttributes(el, attrs) {
      Object.keys(attrs).forEach(function (name) { el.setAttribute(name, attrs[name]); });
   }

   /* A cross, drawn inline so it takes the button's text colour. Decorative:
      the visible "Close" label carries the meaning. */
   function closeIcon() {
      var svg = document.createElementNS(SVG_NS, "svg");
      setAttributes(svg, {
         width: "14", height: "14", viewBox: "0 0 16 16",
         fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round",
         "aria-hidden": "true", focusable: "false", "class": "ms-2 align-baseline"
      });
      var path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", "M3 3l10 10M13 3 3 13");
      svg.appendChild(path);
      return svg;
   }

   function init() {
      var galleries = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
      if (!galleries.length) { return; }

      /* --- The dialog, built once ----------------------------------------- */
      // The backdrop. It is shown and hidden with the hidden attribute, so it
      // must not carry a d-* utility: Bootstrap's .d-flex and its [hidden]
      // rule are both !important at equal specificity, and the utility, being
      // later in the stylesheet, would win and keep the box on screen.
      var box = document.createElement("div");
      box.className = "position-fixed top-0 bottom-0 start-0 end-0 bg-wvu-coal text-white";
      setAttributes(box, { role: "dialog", "aria-modal": "true", "aria-label": "Image viewer" });
      box.hidden = true;
      // Above the sticky masthead and anything Bootstrap positions (its own
      // modal sits at 1055). z-* utilities stop at 3.
      box.style.zIndex = "1100";

      var closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "btn btn-wvu-gold position-absolute top-0 end-0 m-3 d-inline-flex align-items-center";
      closeBtn.appendChild(document.createTextNode("Close"));
      closeBtn.appendChild(closeIcon());

      // The stage scrolls if image and caption ever outgrow a small viewport.
      // The figure centres itself with my-auto rather than the stage using
      // justify-content-center, so that when it does overflow the top of it
      // stays reachable. pt-5 keeps it clear of the Close button.
      var stage = document.createElement("div");
      stage.className = "d-flex flex-column align-items-center h-100 overflow-auto px-3 pb-3 pt-5";

      var figure = document.createElement("figure");
      figure.className = "my-auto mw-100 text-center";

      var img = document.createElement("img");
      img.className = "img-fluid rounded d-block mx-auto";
      img.alt = "";
      img.decoding = "async";
      // Leave room for the Close button above and a caption below. The second
      // assignment upgrades to dynamic viewport units where the browser knows
      // them; where it does not, the assignment is ignored and vh stands.
      img.style.maxHeight = "calc(100vh - 8rem)";
      img.style.maxHeight = "calc(100dvh - 8rem)";

      var caption = document.createElement("figcaption");
      caption.className = "small mt-3 mb-0";
      caption.hidden = true;

      figure.appendChild(img);
      figure.appendChild(caption);
      stage.appendChild(figure);
      box.appendChild(closeBtn);
      box.appendChild(stage);
      document.body.appendChild(box);

      /* --- Open and close --------------------------------------------------- */
      var lastFocus = null;
      var bodyOverflow = "";

      function open(link, gallery) {
         var thumb = link.querySelector("img");
         var fig = link.closest("figure");
         var cap = fig && gallery.contains(fig) ? fig.querySelector("figcaption") : null;

         lastFocus = link;
         img.alt = (thumb && thumb.getAttribute("alt")) || "";
         img.src = link.href;

         // Copy the caption's nodes rather than its markup, so a <b> or a link
         // in it survives without going through innerHTML.
         clear(caption);
         if (cap) {
            Array.prototype.forEach.call(cap.childNodes, function (node) {
               caption.appendChild(node.cloneNode(true));
            });
         }
         caption.hidden = !cap;

         bodyOverflow = document.body.style.overflow;
         document.body.style.overflow = "hidden";
         box.hidden = false;
         closeBtn.focus();
      }

      function close() {
         box.hidden = true;
         document.body.style.overflow = bodyOverflow;
         // Drop the picture so the next opening does not flash the previous
         // one while its own file loads.
         img.removeAttribute("src");
         img.alt = "";
         if (lastFocus) {
            lastFocus.focus();
            lastFocus = null;
         }
      }

      function focusable() {
         return Array.prototype.slice.call(
            box.querySelectorAll("a[href], button:not([disabled])")
         );
      }

      /* --- Events ----------------------------------------------------------- */
      galleries.forEach(function (gallery) {
         gallery.addEventListener("click", function (e) {
            if (e.defaultPrevented || e.button !== 0) { return; }
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { return; }
            var link = e.target.closest("a[href]");
            if (!link || !gallery.contains(link) || !link.querySelector("img")) { return; }
            e.preventDefault();
            open(link, gallery);
         });
      });

      box.addEventListener("click", function (e) {
         // The Close button, or anywhere on the backdrop outside the picture
         // and its caption.
         if (closeBtn.contains(e.target) || !figure.contains(e.target)) { close(); }
      });

      document.addEventListener("keydown", function (e) {
         if (box.hidden) { return; }
         if (e.key === "Escape" || e.key === "Esc") {
            e.preventDefault();
            close();
            return;
         }
         // Keep Tab inside the dialog. Cycling first <-> last also brings
         // focus back in if a backdrop click had dropped it onto <body>.
         if (e.key === "Tab") {
            var items = focusable();
            if (!items.length) { return; }
            var first = items[0];
            var last = items[items.length - 1];
            var current = document.activeElement;
            var outside = !box.contains(current);
            if (e.shiftKey && (outside || current === first)) {
               e.preventDefault();
               last.focus();
            } else if (!e.shiftKey && (outside || current === last)) {
               e.preventDefault();
               first.focus();
            }
         }
      });
   }

   if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
   } else {
      init();
   }
})();
