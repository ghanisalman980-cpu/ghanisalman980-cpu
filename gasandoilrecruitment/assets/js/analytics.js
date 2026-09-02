/*
 * Analytics loader — loads GA4 and/or Cloudflare Web Analytics only when the
 * corresponding IDs are set in config.js. With both empty (the default) this
 * file makes no network requests at all.
 *
 * GA4 measures pageviews and the client-side generate_lead event fired by
 * forms.js. The server-side lead event (n8n → Measurement Protocol) is the
 * attribution record of truth — see the microsite-comms runbook.
 */
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};

  if (cfg.ga4MeasurementId) {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.ga4MeasurementId);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", cfg.ga4MeasurementId);
  }

  if (cfg.cfBeaconToken) {
    var b = document.createElement("script");
    b.defer = true;
    b.src = "https://static.cloudflareinsights.com/beacon.min.js";
    b.setAttribute("data-cf-beacon", JSON.stringify({ token: cfg.cfBeaconToken }));
    document.head.appendChild(b);
  }
})();
