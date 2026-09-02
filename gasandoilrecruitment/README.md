# gasandoilrecruitment.com

Static marketing + job-board site for **Gas & Oil Recruitment**, a specialist oil & gas
recruitment consultancy (Aberdeen, UK). No build step — plain HTML/CSS/JS, ready for
Cloudflare Pages.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home — hero job search, sectors, featured roles, candidate/employer funnels |
| `jobs.html` | Full job board with keyword/sector/location/type filters and sorting |
| `job.html?id=…` | Job detail + application form + `JobPosting` JSON-LD (Google for Jobs) |
| `candidates.html` | Candidate benefits + CV registration form |
| `employers.html` | Employer services + vacancy brief form |
| `about.html` | Company story and coverage |
| `contact.html` | Contact form + NAP details |
| `privacy.html` | UK GDPR privacy notice |
| `404.html` | Not-found page (Cloudflare Pages uses it automatically) |

Vacancies live in `assets/js/jobs-data.js`. Edit that file to add/remove roles;
`jobs.html`, `job.html` and the homepage featured list all render from it.

## Run locally

```bash
cd gasandoilrecruitment
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy (Cloudflare Pages)

1. Create a Pages project from this repo; set the build output directory to
   `gasandoilrecruitment` (no build command needed).
2. Add the custom domain `gasandoilrecruitment.com`.

## Before launch — comms & lead capture (see `../skills/microsite-comms/SKILL.md`)

1. **Phone number.** `assets/js/config.js` carries a placeholder
   (`+44 (0)1224 000 000`). Provision this site's **own unique tracked UK number**
   only once the site is published, then update `phone` / `phoneHref` in
   `config.js`. Never reuse a number from another site; never publish a personal
   mobile.
2. **Forms.** All forms (`data-lead-form`) POST JSON to `SITE_CONFIG.formEndpoint`.
   Set it to the Cloudflare Worker URL that forwards into n8n (Google Sheet row +
   GA4 Measurement Protocol event + owner alert). Until then forms run in demo
   mode and nothing is transmitted. CV file inputs currently capture the filename
   only — wire real upload handling in the Worker if needed.
3. **Email.** `hello@gasandoilrecruitment.com` via Cloudflare Email Routing to the
   brand Gmail inbox.
4. **Analytics.** Add the GA4 snippet and Cloudflare Web Analytics beacon before
   launch (both are free; see the tracking-tools guide in the repo root).
5. **SEO checks.** Run the homepage and a job page through the Schema Markup
   Validator, submit `sitemap.xml` in Search Console, and import into Bing
   Webmaster Tools.

## Notes

- Job detail pages are query-string driven (`job.html?id=…`) and marked
  `noindex` until the ATS sync is in place; the board itself is fully crawlable.
- All content is hand-written for this brand — keep it that way (no
  find-and-replace cloning across sites; see the doorway-tactics rule in the
  microsite-comms runbook).
