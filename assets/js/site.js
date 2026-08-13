/* WVU RAIL — site behaviour.
   Vanilla, no dependencies. Replaces the previous jQuery + skel bundle. */
(function () {
   "use strict";

   var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

   // Reveal animations only apply under `.js`, so content is never stuck hidden
   // if this script fails to load or throws.
   document.documentElement.classList.add("js");

   /* --- Sticky header -------------------------------------------------- */
   var header = document.querySelector(".site-header");
   if (header) {
      var onScroll = function () {
         header.classList.toggle("is-stuck", window.scrollY > 24);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
   }

   /* --- Mobile navigation ---------------------------------------------- */
   var toggle = document.querySelector(".nav-toggle");
   if (toggle) {
      var setOpen = function (open) {
         document.documentElement.toggleAttribute("data-nav-open", open);
         toggle.setAttribute("aria-expanded", String(open));
      };
      toggle.addEventListener("click", function () {
         setOpen(!document.documentElement.hasAttribute("data-nav-open"));
      });
      document.querySelectorAll(".site-nav a").forEach(function (a) {
         a.addEventListener("click", function () { setOpen(false); });
      });
      document.addEventListener("keydown", function (e) {
         if (e.key === "Escape" && document.documentElement.hasAttribute("data-nav-open")) setOpen(false);
      });
      document.addEventListener("click", function (e) {
         if (!document.documentElement.hasAttribute("data-nav-open")) return;
         if (!e.target.closest(".site-nav") && !e.target.closest(".nav-toggle")) setOpen(false);
      });
   }

   /* --- Reveal on scroll ------------------------------------------------ */
   var reveals = document.querySelectorAll(".reveal");
   if (reveals.length) {
      if (reduceMotion || !("IntersectionObserver" in window)) {
         reveals.forEach(function (el) { el.classList.add("is-in"); });
      } else {
         var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
               if (entry.isIntersecting) {
                  entry.target.classList.add("is-in");
                  io.unobserve(entry.target);
               }
            });
         }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
         reveals.forEach(function (el) { io.observe(el); });
      }
   }

   /* --- Hero sky: starfield + a drifting signal trace -------------------- */
   var canvas = document.getElementById("sky");
   if (canvas && canvas.getContext) {
      var ctx = canvas.getContext("2d");
      var stars = [];
      var w = 0, h = 0, dpr = 1, raf = null, visible = true;

      // Small deterministic PRNG so the sky is identical on every load.
      var seed = 20240612;
      var rand = function () {
         seed = (seed * 1664525 + 1013904223) % 4294967296;
         return seed / 4294967296;
      };

      var build = function () {
         var rect = canvas.getBoundingClientRect();
         dpr = Math.min(window.devicePixelRatio || 1, 2);
         w = rect.width; h = rect.height;
         canvas.width = Math.round(w * dpr);
         canvas.height = Math.round(h * dpr);
         ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

         seed = 20240612;
         stars = [];
         var count = Math.min(260, Math.round((w * h) / 5200));
         for (var i = 0; i < count; i++) {
            stars.push({
               x: rand() * w,
               y: rand() * h * 0.86,
               r: 0.35 + rand() * 1.25,
               a: 0.18 + rand() * 0.62,
               // A few stars pick up the gold cast of the horizon glow
               gold: rand() > 0.88,
               tw: rand() * Math.PI * 2,
               sp: 0.4 + rand() * 1.1
            });
         }
      };

      var drawStars = function (time) {
         for (var i = 0; i < stars.length; i++) {
            var s = stars[i];
            var a = s.a * (reduceMotion ? 1 : 0.72 + 0.28 * Math.sin(time * 0.0009 * s.sp + s.tw));
            // Fade the field out toward the bottom, where the dish texture takes over
            a *= 1 - Math.pow(s.y / h, 2.2) * 0.85;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = s.gold
               ? "rgba(255, 208, 110, " + a.toFixed(3) + ")"
               : "rgba(226, 236, 255, " + a.toFixed(3) + ")";
            ctx.fill();
         }
      };

      // Three summed sinusoids of different frequency — an incoming signal
      // sweeping across the field of view.
      var drawSignal = function (time) {
         var baseY = h * 0.74;
         var waves = [
            { amp: h * 0.055, freq: 0.0042, speed: 0.00021, alpha: 0.24, width: 1.4 },
            { amp: h * 0.032, freq: 0.0091, speed: -0.00034, alpha: 0.15, width: 1 },
            { amp: h * 0.018, freq: 0.0173, speed: 0.00052, alpha: 0.1, width: 0.8 }
         ];
         for (var k = 0; k < waves.length; k++) {
            var wv = waves[k];
            ctx.beginPath();
            for (var x = 0; x <= w; x += 3) {
               // Gaussian envelope keeps the trace from touching the edges
               var env = Math.exp(-Math.pow((x - w * 0.5) / (w * 0.42), 2));
               var y = baseY + Math.sin(x * wv.freq + time * wv.speed) * wv.amp * env;
               x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.strokeStyle = "rgba(234, 170, 0, " + wv.alpha + ")";
            ctx.lineWidth = wv.width;
            ctx.stroke();
         }
      };

      var frame = function (time) {
         ctx.clearRect(0, 0, w, h);
         drawStars(time);
         drawSignal(time);
         raf = requestAnimationFrame(frame);
      };

      var start = function () {
         build();
         if (!visible) {
            // Re-render one static frame but don't restart the loop off-screen.
            ctx.clearRect(0, 0, w, h);
            drawStars(0);
            drawSignal(0);
         } else if (reduceMotion) {
            ctx.clearRect(0, 0, w, h);
            drawStars(0);
            drawSignal(0);
         } else if (raf === null) {
            raf = requestAnimationFrame(frame);
         }
      };

      var resizeTimer;
      window.addEventListener("resize", function () {
         clearTimeout(resizeTimer);
         resizeTimer = setTimeout(function () {
            if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
            start();
         }, 180);
      });

      // Stop animating when the hero scrolls out of view.
      if ("IntersectionObserver" in window && !reduceMotion) {
         new IntersectionObserver(function (entries) {
            // Entries can be batched; only the last one reflects current state.
            visible = entries[entries.length - 1].isIntersecting;
            if (visible && raf === null) {
               raf = requestAnimationFrame(frame);
            } else if (!visible && raf !== null) {
               cancelAnimationFrame(raf);
               raf = null;
            }
         }, { threshold: 0 }).observe(canvas);
      }

      start();
   }

   /* --- Lightbox for the DSPIRA archive galleries ------------------------ */
   var galleries = document.querySelectorAll(".gallery.lightbox");
   if (galleries.length) {
      var box = document.createElement("div");
      box.className = "lb";
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-modal", "true");
      box.setAttribute("aria-label", "Image viewer");
      box.innerHTML =
         '<button class="lb-close" type="button" aria-label="Close image">&#10005;</button><img alt="" />';
      document.body.appendChild(box);
      var boxImg = box.querySelector("img");
      var lastFocus = null;

      var close = function () {
         box.classList.remove("is-open");
         document.body.style.overflow = "";
         if (lastFocus) lastFocus.focus();
      };

      galleries.forEach(function (g) {
         g.addEventListener("click", function (e) {
            var link = e.target.closest("a");
            if (!link || !g.contains(link)) return;
            e.preventDefault();
            lastFocus = link;
            boxImg.src = link.getAttribute("href");
            var img = link.querySelector("img");
            boxImg.alt = (img && img.getAttribute("alt")) || "";
            box.classList.add("is-open");
            document.body.style.overflow = "hidden";
            box.querySelector(".lb-close").focus();
         });
      });

      box.addEventListener("click", function (e) {
         if (e.target === box || e.target.closest(".lb-close")) close();
      });
      document.addEventListener("keydown", function (e) {
         if (!box.classList.contains("is-open")) return;
         if (e.key === "Escape") { close(); return; }
         // The dialog has exactly one focusable child, so containment is just
         // "keep Tab here".
         if (e.key === "Tab") {
            e.preventDefault();
            box.querySelector(".lb-close").focus();
         }
      });
   }
})();
