/* WVU RAIL — click-to-play GIF, for the DSPIRA 2017 archive page.

   An animated GIF starts itself and cannot be paused, which fails WCAG 2.2.2
   for motion that runs past five seconds. Each .gif-player host is therefore
   held behind a button until the visitor asks for it; this also keeps the
   2 MB file off the page until then. With JavaScript off, the <noscript>
   image inside the host is what renders, so nothing is lost.

   Markup the script expects (Design System utilities only, no custom CSS):

     <div class="gif-player ratio ratio-16x9 bg-wvu-blue"
          data-gif="/images/dspira/timelapse.gif"
          data-alt="What the animation shows"
          data-size="2 MB" data-width="480" data-height="270">
        <noscript><img src="..." alt="..." width="480" height="270"></noscript>
     </div>

   .ratio positions its direct child to fill the box, so the button is placed
   in a flex wrapper that centres it, and the image that replaces it fills the
   box with object-fit-cover.

   Vanilla, no dependencies, and no inline handlers: everything attaches with
   addEventListener, so the page survives a Content-Security-Policy that
   forbids inline script. Loaded with `defer` from the page that needs it. */
(function () {
   "use strict";

   function clear(node) {
      while (node.firstChild) { node.removeChild(node.firstChild); }
   }

   function init() {
      var hosts = document.querySelectorAll(".gif-player[data-gif]");

      Array.prototype.forEach.call(hosts, function (host) {
         var src   = host.getAttribute("data-gif");
         var alt   = host.getAttribute("data-alt") || "";
         var size  = host.getAttribute("data-size") || "";
         var label = host.getAttribute("data-label") || "Play time-lapse";
         var w     = parseInt(host.getAttribute("data-width"), 10) || 480;
         var h     = parseInt(host.getAttribute("data-height"), 10) || 270;

         var wrap = document.createElement("div");
         wrap.className = "d-flex align-items-center justify-content-center";

         var btn = document.createElement("button");
         btn.type = "button";
         btn.className = "btn btn-wvu-gold";
         btn.appendChild(document.createTextNode(label));
         if (size) {
            var meta = document.createElement("span");
            meta.className = "small ms-2";
            meta.textContent = "GIF · " + size;
            btn.appendChild(meta);
         }
         btn.setAttribute("aria-label", label + ": " + alt);

         btn.addEventListener("click", function () {
            var img = document.createElement("img");
            img.src = src;
            img.alt = alt;
            img.width = w;
            img.height = h;
            img.className = "object-fit-cover rounded";
            clear(host);
            host.appendChild(img);
            // The button the user activated is gone; move focus to what replaced it
            // so a keyboard user does not drop to <body>.
            img.tabIndex = -1;
            img.focus();
         });

         wrap.appendChild(btn);
         clear(host);
         host.appendChild(wrap);
      });
   }

   if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
   } else {
      init();
   }
})();
