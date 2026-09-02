/* Shared behaviour: mobile nav, config-driven contact details, footer year. */
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};

  // Inject configured contact details anywhere data-site="phone|email|address" appears.
  document.querySelectorAll('[data-site="phone"]').forEach(function (el) {
    if (el.tagName === "A") el.href = "tel:" + (cfg.phoneHref || "");
    el.textContent = cfg.phone || el.textContent;
  });
  document.querySelectorAll('[data-site="email"]').forEach(function (el) {
    if (el.tagName === "A") el.href = "mailto:" + (cfg.email || "");
    el.textContent = cfg.email || el.textContent;
  });
  document.querySelectorAll('[data-site="address"]').forEach(function (el) {
    el.textContent = cfg.address || el.textContent;
  });

  // Mobile navigation
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Highlight current page in nav
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === path) a.classList.add("active");
  });

  // Footer year
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
