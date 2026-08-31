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
      var nav = document.getElementById("site-nav");
      var navLinks = nav ? [].slice.call(nav.querySelectorAll("a")) : [];
      var setOpen = function (open, returnFocus) {
         document.documentElement.toggleAttribute("data-nav-open", open);
         toggle.setAttribute("aria-expanded", String(open));
         toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
         // Stop the page scrolling behind the open drawer.
         document.body.style.overflow = open ? "hidden" : "";
         if (open && navLinks.length) {
            window.requestAnimationFrame(function () { navLinks[0].focus(); });
         } else if (returnFocus) {
            toggle.focus();
         }
      };
      toggle.addEventListener("click", function () {
         setOpen(!document.documentElement.hasAttribute("data-nav-open"));
      });
      navLinks.forEach(function (a) {
         a.addEventListener("click", function () { setOpen(false); });
      });
      document.addEventListener("keydown", function (e) {
         if (!document.documentElement.hasAttribute("data-nav-open")) return;
         if (e.key === "Escape") {
            setOpen(false, true);
            return;
         }
         // Keep keyboard focus within the open drawer and its close control.
         if (e.key === "Tab") {
            var focusable = [toggle].concat(navLinks);
            var first = focusable[0];
            var last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
               e.preventDefault();
               last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
               e.preventDefault();
               first.focus();
            }
         }
      });
      document.addEventListener("click", function (e) {
         if (!document.documentElement.hasAttribute("data-nav-open")) return;
         if (!e.target.closest(".site-nav") && !e.target.closest(".nav-toggle")) setOpen(false);
      });
      // A drawer opened on a narrow screen must not leave body scrolling locked
      // if the viewport is widened past the desktop breakpoint.
      var desktopNav = window.matchMedia("(min-width: 981px)");
      var closeAtDesktop = function (e) { if (e.matches) setOpen(false); };
      if (desktopNav.addEventListener) desktopNav.addEventListener("change", closeAtDesktop);
      else desktopNav.addListener(closeAtDesktop);
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

   /* --- Click-to-play GIFs ---------------------------------------------- */
   // An animated GIF starts itself and cannot be paused, so it is held behind a
   // button (WCAG 2.2.2). Built here rather than in the markup so that with JS
   // off the <noscript> image is what renders.
   [].slice.call(document.querySelectorAll(".gif-player")).forEach(function (host) {
      var src = host.getAttribute("data-gif");
      var alt = host.getAttribute("data-alt") || "";
      if (!src) return;

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gif-play";
      btn.innerHTML = 'Play time-lapse <span class="gif-meta">GIF &middot; 2 MB</span>';
      btn.setAttribute("aria-label", "Play time-lapse: " + alt);

      btn.addEventListener("click", function () {
         var img = new Image();
         img.src = src;
         img.alt = alt;
         img.width = 480;
         img.height = 270;
         host.replaceChildren(img);
      });

      host.replaceChildren(btn);
   });

   /* --- Publications filter --------------------------------------------- */
   var search = document.getElementById("pub-search");
   if (search) {
      var entries = [].slice.call(document.querySelectorAll(".pub-list .pub"));
      var counter = document.querySelector(".pub-filter-count");

      // Index once — 69 entries re-read from the DOM on every keystroke is
      // wasteful, and innerText forces layout.
      entries.forEach(function (el) {
         el._haystack = (el.textContent || "").toLowerCase().replace(/\s+/g, " ");
      });

      // A band or year group with nothing left in it should disappear too,
      // otherwise you get a page of empty headings.
      var groups = [].slice.call(document.querySelectorAll(".people-block, section[id]"));

      var apply = function () {
         var q = search.value.trim().toLowerCase();
         var hits = 0;
         entries.forEach(function (el) {
            var show = !q || el._haystack.indexOf(q) !== -1;
            el.hidden = !show;
            if (show) hits++;
         });
         groups.forEach(function (g) {
            if (!g.querySelector(".pub")) return;   // not a publication group
            g.hidden = q ? !g.querySelector(".pub:not([hidden])") : false;
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

   /* --- Lightbox for the DSPIRA archive galleries ------------------------ */
   var galleries = document.querySelectorAll("[data-lightbox]");
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
