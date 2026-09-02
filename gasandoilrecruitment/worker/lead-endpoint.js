/*
 * Cloudflare Worker: lead endpoint for gasandoilrecruitment.com
 *
 * Receives form POSTs from the site's data-lead-form forms, validates them,
 * and forwards to the shared n8n webhook, which appends the Google Sheet row,
 * fires the GA4 Measurement Protocol event and alerts the owner
 * (see skills/microsite-comms/SKILL.md).
 *
 * Fail-closed by design: if N8N_WEBHOOK_URL is not set the endpoint returns
 * 503 and the visitor is told to email/call — leads are never silently dropped.
 *
 * Deploy:
 *   cd worker
 *   npx wrangler deploy
 *   npx wrangler secret put N8N_WEBHOOK_URL
 * Then set SITE_CONFIG.formEndpoint in assets/js/config.js to the Worker's URL
 * (or the custom subdomain route, e.g. https://forms.gasandoilrecruitment.com/lead).
 */

const ALLOWED_ORIGINS = [
  "https://gasandoilrecruitment.com",
  "https://www.gasandoilrecruitment.com",
  // Cloudflare Pages preview subdomain for this project:
  "https://gasandoilrecruitment.pages.dev",
];

const MAX_BODY_BYTES = 20 * 1024; // forms are small; CV files travel as filenames only
const KNOWN_FORMS = ["job-application", "candidate-registration", "employer-vacancy", "contact"];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(origin, status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

function validEmail(s) {
  return typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (url.pathname === "/health") {
      return json(origin, 200, { ok: true, configured: Boolean(env.N8N_WEBHOOK_URL) });
    }

    if (request.method !== "POST") {
      return json(origin, 405, { ok: false, error: "Method not allowed" });
    }

    if (!env.N8N_WEBHOOK_URL) {
      return json(origin, 503, { ok: false, error: "Lead pipeline not configured" });
    }

    const length = Number(request.headers.get("Content-Length") || 0);
    if (length > MAX_BODY_BYTES) {
      return json(origin, 413, { ok: false, error: "Payload too large" });
    }

    let lead;
    try {
      lead = await request.json();
    } catch {
      return json(origin, 400, { ok: false, error: "Invalid JSON" });
    }

    const fields = lead && typeof lead.fields === "object" && lead.fields ? lead.fields : {};

    // Honeypot: real users never see or fill this injected field. Pretend
    // success so bots don't adapt, but forward nothing.
    if (fields._gotcha) {
      return json(origin, 200, { ok: true });
    }

    if (!KNOWN_FORMS.includes(lead.form)) {
      return json(origin, 400, { ok: false, error: "Unknown form" });
    }
    if (typeof fields.name !== "string" || !fields.name.trim() || fields.name.length > 200) {
      return json(origin, 422, { ok: false, error: "Name is required" });
    }
    if (!validEmail(fields.email)) {
      return json(origin, 422, { ok: false, error: "Valid email is required" });
    }
    if (fields.consent !== "on" && fields.consent !== true && fields.consent !== "true") {
      return json(origin, 422, { ok: false, error: "Consent is required" });
    }

    // Strip the honeypot and cap field sizes before forwarding.
    delete fields._gotcha;
    const cleanFields = {};
    for (const [key, value] of Object.entries(fields)) {
      cleanFields[String(key).slice(0, 64)] = String(value).slice(0, 5000);
    }

    const envelope = {
      ...lead,
      fields: cleanFields,
      receivedAt: new Date().toISOString(),
      ip: request.headers.get("CF-Connecting-IP") || "",
      userAgent: request.headers.get("User-Agent") || "",
      country: (request.cf && request.cf.country) || "",
    };

    let upstream;
    try {
      upstream = await fetch(env.N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(envelope),
      });
    } catch {
      return json(origin, 502, { ok: false, error: "Lead pipeline unreachable" });
    }

    if (!upstream.ok) {
      return json(origin, 502, { ok: false, error: "Lead pipeline rejected the submission" });
    }

    return json(origin, 200, { ok: true });
  },
};
