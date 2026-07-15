/* ============================================================
   Metro Parlez-Ment — Shared global navigation bar
   Single source of truth for the navbar markup + behaviour.
   Every page loads this script (with `defer`) and links nav.css.
   The identical navbar is injected on every page; only the
   .active link changes, derived automatically from the URL.
   ============================================================ */
(function () {
  "use strict";

  // Primary navigation (the centered links). Keep in ONE place.
  var LINKS = [
    { href: "index.html", label: "Home" },
    { href: "about.html", label: "About Us" },
    { href: "impact.html", label: "Impact" },
    { href: "get-involved.html", label: "Get Involved" },
    { href: "contact.html", label: "Contact Us" },
  ];

  var LOGO = "Asset/Nav-link-logo.png";
  var LOADER_STORAGE_KEY = "metro-loader-shown";
  var NAV_SKIP_LOADER_KEY = "metro-nav-skip-loader";
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  var navigationType = null;
  if (typeof performance.getEntriesByType === "function") {
    var navEntries = performance.getEntriesByType("navigation");
    if (navEntries && navEntries[0]) {
      navigationType = navEntries[0].type;
    }
  }
  if (navigationType === null && performance.navigation) {
    navigationType = performance.navigation.type;
  }

  var isReload = navigationType === 1 || navigationType === "reload";
  var fromClientNav = sessionStorage.getItem(NAV_SKIP_LOADER_KEY) === "1";
  if (fromClientNav) {
    sessionStorage.removeItem(NAV_SKIP_LOADER_KEY);
  }
  var showLoader =
    !fromClientNav && (!sessionStorage.getItem(LOADER_STORAGE_KEY) || isReload);
  var loaderOverlay = null;
  var loaderHidden = false;
  var loaderStartTime = Date.now();

  function createPageLoader() {
    if (!showLoader || loaderOverlay || !document.body) return;
    loaderOverlay = document.createElement("div");
    loaderOverlay.id = "pageLoaderOverlay";
    loaderOverlay.className = "page-loader-overlay";
    loaderOverlay.setAttribute("role", "status");
    loaderOverlay.setAttribute("aria-live", "polite");
    loaderOverlay.innerHTML =
      '<div class="page-loader-panel">' +
      '<div class="page-loader-ring">' +
      '<img src="' +
      LOGO +
      '" alt="Metro Parlez-Ment logo" class="page-loader-logo" />' +
      "</div>" +
      '<div class="page-loader-label">Metro Parlez-Ment</div>' +
      '<div class="page-loader-note">Welcoming your impact. Loading the site…</div>' +
      "</div>";
    document.body.insertBefore(loaderOverlay, document.body.firstChild);
    document.body.classList.add("page-loader-active");
    sessionStorage.setItem(LOADER_STORAGE_KEY, "1");
    if (!prefersReducedMotion) {
      loaderOverlay.offsetWidth;
    }
  }

  function hidePageLoader() {
    if (!loaderOverlay || loaderHidden) return;
    loaderHidden = true;
    loaderOverlay.classList.add("hidden");
    document.body.classList.remove("page-loader-active");
    setTimeout(function () {
      if (loaderOverlay.parentNode) {
        loaderOverlay.parentNode.removeChild(loaderOverlay);
      }
      loaderOverlay = null;
    }, 420);
  }

  function initializeLoaderLifecycle() {
    if (!showLoader) return;
    var minDuration = 500;
    var maxDuration = 1800;
    var finished = false;

    function finalizeLoader() {
      if (finished) return;
      finished = true;
      var elapsed = Date.now() - loaderStartTime;
      var delay = Math.max(0, minDuration - elapsed);
      setTimeout(hidePageLoader, delay);
    }

    if (document.readyState === "complete") {
      finalizeLoader();
    } else {
      window.addEventListener("load", finalizeLoader);
    }
    setTimeout(finalizeLoader, maxDuration);
  }

  // Which page are we on? Normalise "/" and "" to index.html.
  var current = (
    location.pathname.split("/").pop() || "index.html"
  ).toLowerCase();
  if (current === "") current = "index.html";

  function isActive(href) {
    return href.toLowerCase() === current;
  }

  var linksHtml = LINKS.map(function (l) {
    return (
      '<li><a href="' +
      l.href +
      '"' +
      (isActive(l.href) ? ' class="active" aria-current="page"' : "") +
      ">" +
      l.label +
      "</a></li>"
    );
  }).join("");

  var drawerLinksHtml = LINKS.map(function (l) {
    return (
      '<li><a href="' +
      l.href +
      '"' +
      (isActive(l.href) ? ' class="active" aria-current="page"' : "") +
      ">" +
      l.label +
      "</a></li>"
    );
  }).join("");

  var ICON_CLOSE =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  var html =
    // Navbar
    '<nav class="site-nav">' +
    '<div class="nav-inner">' +
    '<a href="index.html" class="nav-logo" aria-label="Metro Parlez-Ment home">' +
    '<img src="' +
    LOGO +
    '" alt="Metro Parlez-Ment" />' +
    "</a>" +
    '<ul class="nav-links">' +
    linksHtml +
    "</ul>" +
    '<div class="nav-right">' +
    '<a href="donate.html" class="btn-donate-nav">Donate Now</a>' +
    '<button class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>' +
    "</div>" +
    "</div>" +
    "</nav>" +
    // Drawer overlay + drawer
    '<div class="nav-overlay" id="navOverlay"></div>' +
    '<aside class="nav-drawer" id="navDrawer" aria-label="Mobile menu">' +
    '<div class="drawer-header">' +
    '<a href="index.html" class="nav-logo"><img src="' +
    LOGO +
    '" alt="Metro Parlez-Ment" /></a>' +
    '<button class="drawer-close" id="drawerClose" aria-label="Close menu">' +
    ICON_CLOSE +
    "</button>" +
    "</div>" +
    '<ul class="drawer-links">' +
    drawerLinksHtml +
    "</ul>" +
    '<div class="drawer-cta">' +
    '<a href="get-involved.html" class="drawer-volunteer">Volunteer With Us</a>' +
    '<a href="donate.html" class="btn-donate-nav">Donate Now</a>' +
    "</div>" +
    "</aside>";

  function mount() {
    var tpl = document.createElement("template");
    createPageLoader();
    initializeLoaderLifecycle();
    tpl.innerHTML = html;
    // Insert the navbar (and drawer) at the very top of the body.
    document.body.insertBefore(tpl.content, document.body.firstChild);

    // ── Drawer behaviour ──
    var hamburger = document.getElementById("hamburger");
    var navDrawer = document.getElementById("navDrawer");
    var navOverlay = document.getElementById("navOverlay");
    var drawerClose = document.getElementById("drawerClose");

    function openDrawer() {
      navDrawer.classList.add("open");
      navOverlay.classList.add("open");
      document.body.style.overflow = "hidden";
      hamburger.setAttribute("aria-expanded", "true");
    }
    function closeDrawer() {
      navDrawer.classList.remove("open");
      navOverlay.classList.remove("open");
      document.body.style.overflow = "";
      hamburger.setAttribute("aria-expanded", "false");
    }

    hamburger.addEventListener("click", openDrawer);
    drawerClose.addEventListener("click", closeDrawer);
    navOverlay.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrawer();
    });

    // ── Press interaction for links (touch & pointer friendly)
    var pressables = document.querySelectorAll(
      ".site-nav .nav-links a, .site-nav .btn-donate-nav, .drawer-links a",
    );
    pressables.forEach(function (el) {
      var clear = null;
      function addPressed() {
        el.classList.add("pressed");
        if (clear) clearTimeout(clear);
      }
      function removePressed() {
        if (clear) clearTimeout(clear);
        clear = setTimeout(function () {
          el.classList.remove("pressed");
        }, 120);
      }

      el.addEventListener("pointerdown", addPressed, { passive: true });
      document.addEventListener("pointerup", removePressed);
      el.addEventListener("pointercancel", removePressed);
      el.addEventListener("touchstart", addPressed, { passive: true });
      el.addEventListener("touchend", removePressed);
    });

    initMotion();
  }

  function initMotion() {
    var prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!prefersReduced) {
      document.documentElement.style.scrollBehavior = "smooth";
    }

    var observedElements = new WeakSet();

    function safeObserve(el, delay) {
      if (!el || observedElements.has(el)) return;
      observedElements.add(el);
      el.classList.add("animate-item");
      el.style.transitionDelay = String(delay || 0) + "ms";
      if (observer) {
        observer.observe(el);
      } else {
        el.classList.add("in-view");
      }
    }

    function animateCountUp(el) {
      var raw = el.dataset.target || el.textContent;
      var value = parseInt(String(raw).replace(/[^0-9]/g, ""), 10);
      if (isNaN(value) || value <= 0) return;
      var duration = 1400;
      var startTime = null;
      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var current = Math.floor(progress * value);
        el.textContent = current.toLocaleString();
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = value.toLocaleString();
        }
      }
      window.requestAnimationFrame(step);
    }

    var observer = null;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("in-view");
            if (entry.target.classList.contains("count-up")) {
              animateCountUp(entry.target);
            }
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.18, rootMargin: "0px 0px -12% 0px" },
      );
    }

    [
      ".hero-content",
      ".hero-illustration",
      ".section-header",
      ".about-content",
      ".about-image",
      ".focus-card",
      ".value-card",
      ".team-card",
      ".mission-box",
      ".who-grid > div",
      ".gallery-item",
      ".stat-item",
      ".timeline-item",
      ".panel",
      ".card",
      ".donate-card",
      ".why-card",
      ".info-card",
      ".contact-form-card",
      ".bank-card",
      ".map-container",
      ".faq-section",
    ].forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el, index) {
        safeObserve(el, index * 55);
      });
    });

    document.querySelectorAll(".count-up").forEach(function (el) {
      safeObserve(el);
    });

    document.querySelectorAll("a[href^='#']").forEach(function (anchor) {
      anchor.addEventListener("click", function (event) {
        var targetId = anchor.getAttribute("href");
        if (!targetId || targetId === "#") return;
        var target = document.querySelector(targetId);
        if (target) {
          event.preventDefault();
          target.scrollIntoView({
            behavior: prefersReduced ? "auto" : "smooth",
          });
        }
      });
    });

    document.querySelectorAll("a[href]").forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0)
        return;
      if (link.target === "_blank" || link.hasAttribute("download")) return;
      var destination = link.href;
      if (destination === location.href) return;
      if (link.hostname === location.hostname) {
        link.addEventListener("click", function (event) {
          if (href.indexOf("#") === 0) return;
          event.preventDefault();
          sessionStorage.setItem(NAV_SKIP_LOADER_KEY, "1");
          document.body.classList.add("page-exit");
          setTimeout(function () {
            window.location.href = destination;
          }, 260);
        });
      }
    });
  }

  if (document.body) {
    mount();
  } else {
    document.addEventListener("DOMContentLoaded", mount);
  }
})();
