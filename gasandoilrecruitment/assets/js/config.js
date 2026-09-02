/*
 * Site-wide configuration for gasandoilrecruitment.com
 *
 * PHONE: placeholder below. Per the microsite-comms runbook, provision a unique
 * tracked UK number for this domain only when the site is published, then set it
 * here. Never reuse a number from another site and never publish a personal mobile.
 *
 * FORMS: point formEndpoint at the Cloudflare Worker that forwards to n8n
 * (lead row in Sheets + GA4 event + owner alert). Until it is set, forms run in
 * demo mode: they validate and show a success state without sending anything.
 */
window.SITE_CONFIG = {
  name: "Gas & Oil Recruitment",
  domain: "gasandoilrecruitment.com",
  phone: "+44 (0)1224 000 000", // TODO: replace with this site's unique tracked number at launch
  phoneHref: "+441224000000",
  email: "hello@gasandoilrecruitment.com",
  address: "Prime Four, Kingswells, Aberdeen AB15 8PU",
  formEndpoint: "", // e.g. "https://forms.gasandoilrecruitment.com/lead" (see worker/)

  // Analytics — both empty = nothing loads. Set at launch (see README).
  ga4MeasurementId: "", // e.g. "G-XXXXXXXXXX"
  cfBeaconToken: "", // Cloudflare Web Analytics site token
};
