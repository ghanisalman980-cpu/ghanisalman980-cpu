/*
 * Lead-capture form handling.
 *
 * Every form with [data-lead-form] is validated in the browser, then POSTed as
 * JSON to SITE_CONFIG.formEndpoint (the Cloudflare Worker → n8n pipeline:
 * Sheet row + GA4 event + owner alert). Attribution fields (site, form name,
 * page URL, timestamp) are attached automatically.
 *
 * Until formEndpoint is configured, forms run in demo mode: nothing is sent and
 * the success state is shown so the flow can be reviewed end to end.
 */
(function () {
  "use strict";

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  document.querySelectorAll("form[data-lead-form]").forEach(function (form) {
    var status = form.querySelector(".form-status");

    // Honeypot: invisible to humans, irresistible to bots. The Worker drops
    // any submission where this field is filled.
    var trap = document.createElement("input");
    trap.type = "text";
    trap.name = "_gotcha";
    trap.tabIndex = -1;
    trap.autocomplete = "off";
    trap.setAttribute("aria-hidden", "true");
    trap.style.cssText = "position:absolute;left:-9999px;top:-9999px;height:1px;width:1px;overflow:hidden";
    form.appendChild(trap);

    function show(kind, msg) {
      if (!status) return;
      status.className = "form-status " + kind;
      status.innerHTML = msg;
      status.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();

      // Browser-native validation + visual flagging
      var valid = true;
      form.querySelectorAll("[required]").forEach(function (el) {
        el.classList.toggle("invalid", !el.checkValidity());
        if (!el.checkValidity()) valid = false;
      });
      if (!valid) {
        show("err", "Please complete the highlighted fields and try again.");
        return;
      }

      var data = {
        site: (window.SITE_CONFIG || {}).domain || location.hostname,
        form: form.getAttribute("data-lead-form"),
        page: location.href,
        submittedAt: new Date().toISOString(),
        fields: {},
      };
      new FormData(form).forEach(function (value, key) {
        // File inputs can't be serialised to JSON; capture the filename only.
        data.fields[key] = value instanceof File ? (value.name || "") : value;
      });

      var endpoint = (window.SITE_CONFIG || {}).formEndpoint;
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = "Sending…"; }

      function done(ok, msg) {
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; }
        if (ok) {
          form.reset();
          // Client-side GA4 lead event (only when analytics.js has loaded gtag).
          // The server-side Measurement Protocol event from n8n is the record of truth.
          if (typeof window.gtag === "function") {
            window.gtag("event", "generate_lead", { form_name: data.form, page_location: data.page });
          }
          show("ok", msg);
        } else {
          show("err", msg);
        }
      }

      if (!endpoint) {
        // Demo mode — nothing leaves the browser.
        console.info("[lead-form demo] payload:", data);
        done(
          true,
          "<strong>Thank you — your details have been received.</strong><br>" +
            "One of our consultants will be in touch shortly. (Form endpoint not yet configured — this submission was not sent.)"
        );
        return;
      }

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          done(true, "<strong>Thank you — your details have been received.</strong><br>One of our consultants will be in touch shortly.");
        })
        .catch(function () {
          done(
            false,
            "Sorry — something went wrong sending your details. Please email us directly at " +
              esc((window.SITE_CONFIG || {}).email || "") + " or call " + esc((window.SITE_CONFIG || {}).phone || "") + "."
          );
        });
    });

    // Clear the invalid flag as the user fixes a field
    form.addEventListener("input", function (ev) {
      if (ev.target.classList) ev.target.classList.remove("invalid");
    });
  });
})();
