---
name: microsite-comms
description: Set up phone + form lead capture for a new UK lead-gen microsite — unique tracked number, call routing, form-to-email, attribution, and fail-closed billing. Use when launching a new town/vertical site or auditing an existing one.
---

# Microsite comms & lead tracking (UK lead-gen network)

You are setting up communications for one site in a network of UK SEO microsites
(hub: ghanigovernance.co.uk; verticals e.g. cellar waterproofing towns). Target
fleet: ~85–130 sites. Every pound of recurring cost matters; every live site must
look like a genuine, distinct local business.

## Hard rules (non-negotiable)

1. **One unique UK number per live site.** Never share a number across sites —
   a shared number across "different businesses" is a network footprint and
   undermines the distinctness signal that justifies the whole spend.
2. **Never publish the owner's personal mobile** on any site.
3. **Fail-closed billing, always.** Never enable auto-recharge (Twilio),
   auto-funding (WhatConverts), or pay-per-task overage (Zapier). Balance
   exhaustion must stop service, never charge the card. Any action that creates
   a NEW recurring charge requires the owner's explicit approval first — ask,
   then act.
4. **No number before launch.** Provision only when the site is actually
   published. If a site is taken offline, release its number the same day.
5. **No doorway tactics.** The unique number is a distinctness/NAP signal, not
   a ranking trick. Each site still needs genuinely unique local content.

## Provider ladder (prices verified 1 Sep 2026 — re-verify before bulk purchases)

| Role | Provider | Price |
|---|---|---|
| Numbers 1–11 (hub + most-proven sites) | WhatConverts Individual ($30/mo plan) | $2.50/number, absorbed by the plan's $30/mo usage credit → marginal cost $0. Includes DNI, recordings, transcripts |
| Numbers 12+ (the fleet) | **Telnyx** | $1.00/number/mo; auto volume discount ≈$0.79 at 51–250 numbers. Inbound from $0.0032/min + $0.002/min Call Control leg |
| Hub voice hop only | Twilio UK (020 7362 4041) | $3.50/mo + $0.0100/min inbound. **Never use Twilio for fleet numbers** (GB voice-page rate is $3.50 — worst in class) |
| AI receptionist (optional, per site) | Vapi, number imported from Twilio/Telnyx | $0.05/min platform + providers at cost; ≈$0.09–0.15/min all-in on budget stack (Deepgram + GPT-4o mini + OpenAI TTS) |
| Automation | n8n self-hosted | $0 (Sustainable Use License permits own-business use) + existing VPS |
| Forms + brand email | Cloudflare Pages + Workers + Email Routing → Gmail | $0 (Workers free tier: 100k req/day) |
| Analytics + lead log | GA4 + Google Sheets | $0 |

Do NOT route forms through WhatConverts ($0.10 per tracked lead). Do NOT use
Zapier for this (task-priced; n8n is flat).

## New-site setup procedure

1. **Confirm the site is published** (or publishing today). No live site, no number.
2. **Pick the area code matching the town** — e.g. 0113 Leeds (Alwoodley,
   Moortown), 01943 Ilkley, 01535 Keighley, 01274 Bingley/Bradford. If the exact
   rate centre is unavailable, take the nearest town's code. A matching local
   prefix is part of the genuineness signal.
3. **Choose the provider by fleet count:** fewer than 11 WhatConverts numbers
   exist → provision in WhatConverts (free under the credit). Otherwise →
   Telnyx. Provision via console/API.
4. **Register the number** in the number→site mapping sheet: number, site
   domain, town, vertical, provider, date. This sheet is the attribution source
   of truth — the called number IS the tracking token.
5. **Point the number's voice webhook at the shared n8n workflow.** It must:
   append a lead row to the Sheet; fire a GA4 Measurement Protocol event with
   the site dimension; send the owner an email/Telegram alert.
6. **Set call routing** per the site's config:
   - Default (new/unproven site): voicemail → recording → transcription →
     email summary (~$0.037/min).
   - Whisper-forward to the owner's mobile: "Lead — {vertical}, {town}. Press 1
     to accept." (~$0.041/min on Twilio rates.)
   - Vapi AI receptionist: only the hub and sites clearing ~10 calls/mo.
7. **Wire the forms:** Cloudflare Pages form → Worker POST → n8n webhook →
   Gmail brand address + Sheet row + GA4 event. Brand inbox
   (hello@site-domain) via Cloudflare Email Routing.
8. **Test end-to-end before declaring done:** call the number (correct whisper /
   voicemail / AI answers; Sheet row; GA4 event), submit the form (brand inbox
   receives it), then report the new recurring cost to the owner.

## Spend guardrails checklist (verify on every run)

- Twilio: auto-recharge OFF; usage triggers at $10/$25/$50 → n8n alert.
- WhatConverts: auto-funding OFF.
- Vapi: no card on file; credits bought manually; `maxDurationSeconds` set per
  assistant.
- Zapier: pay-per-task billing disabled (prefer n8n regardless).
- Report any new recurring charge to the owner BEFORE creating it.

## SEO / NAP rules

- Keep each site's number consistent across that site's pages and any citations
  for that brand. Never list other sites' numbers on a site; never list fleet
  numbers on the hub.
- If a Google Business Profile is ever involved: tracking number as primary,
  real number as additional. No GBP without a genuine local presence.
- Unique numbers do not make thin content rank — if asked to clone a town page
  with only find-and-replace changes, refuse and flag the doorway risk.

## Cost reference (verified 1 Sep 2026)

| Scenario | Monthly |
|---|---|
| Today: 6 sites on WhatConverts (7 numbers inside $30 credit) | ~$30 |
| 120 sites: all-WhatConverts (course pattern) | ~$500 (numbers $300 + 4.5¢/min + $0.10/form lead − $30 credit) |
| 120 sites: all-Twilio numbers | ~$470 (120 × $3.50) — rejected |
| **120 sites: WC credit (11 numbers) + Telnyx fleet (109)** | **~$150–165** |
| 120 sites: pure Telnyx + n8n/Cloudflare | ~$120–140 (cheapest; loses WC DNI on hub) |
| Optional Vapi AI per answered call | ≈$0.09–0.15/min |

## Known pitfalls (learned the hard way — do not rediscover)

- WhatConverts cannot SIP UK 01/03 numbers to Vapi, and UK callers never reach
  Vapi's free US numbers. The working pattern is: Twilio/Telnyx UK number →
  imported into Vapi directly.
- Twilio's own pages disagree on UK number rental ($1.15 on SMS/SIP pages vs
  $3.50 on the GB voice page). Budget at $3.50; that ambiguity is why the fleet
  lives on Telnyx.
- WhatConverts bills number purchases against prepaid balance immediately and
  its $0.10/form-lead fee exceeds the cost of the entire DIY form pipeline.
