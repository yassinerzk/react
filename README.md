# Afterpage (working name)

A Shopify app that turns the post-purchase page into two things at once:

1. A one-click **post-purchase upsell** (extra revenue on an order that is already paid).
2. A **conditional information collector** for data that shipping actually needs
   (national ID / customs numbers, delivery notes, gift messages) without adding
   friction before payment.

Works on **every Shopify plan**. On Shopify Plus it can also collect the same
fields inside checkout before payment.

> Status: **pre-code, design complete.** No application code exists yet.
> Start with `docs/ROADMAP.md` for what to do next.

---

## Why this app

| Problem | Today | Afterpage |
|---|---|---|
| Merchants shipping to KR, BR, TR, CL, TW, CN, ID, ZA lose parcels to customs because checkout never asked for the ID number | Manual emails, order notes, generic form apps that add fields *before* payment and hurt conversion | Ask only when a rule matches (e.g. destination country), *after* payment, with format validation and a fallback chain |
| Upsell apps only do upsells, form apps only do forms | Two apps, two subscriptions, two widgets on the same page | One page, one app, one subscription |
| Customers skip post-purchase pages | Merchant never notices until the parcel is stuck | Order is tagged, fulfillment is held, a reminder email links to the order status page where the same form appears |

## Core principles

- **Never ask before payment unless the merchant is on Plus and chooses to.** The post-purchase page is the friendliest moment to ask.
- **Ask only what a rule requires.** No rule matched, no field shown.
- **The merchant must never lose an order silently.** Every unanswered request becomes a tag, an optional fulfillment hold, and a reminder.
- **Sensitive data is handled as sensitive.** Encrypted at rest, retention window, GDPR webhooks, audit log, never logged.
- **Follow Shopify's surfaces, not hacks.** Post-purchase extension, checkout UI extensions, order metafields, fulfillment holds, Billing/Managed Pricing.

## Surfaces by plan

| Surface | Basic / Shopify / Advanced | Plus |
|---|---|---|
| Post-purchase page (offer + fields) | yes | yes |
| Thank-you page block (fields fallback) | yes | yes |
| Order status page block (fields fallback, reminder link target) | yes | yes |
| Checkout address / payment step field (required before pay) | no | yes |
| Reminder email | yes | yes |

## Pricing (planned, via Shopify Managed Pricing)

| Plan | Price | Includes |
|---|---|---|
| Free | $0 | Info collection, 1 rule, 50 requests / month |
| Growth | $19 / mo | Unlimited rules, post-purchase upsell, 1 offer live |
| Pro | $29 / mo | Unlimited offers, A/B of offers, priority support |

## Documentation map

| File | Read it when |
|---|---|
| `README.md` (this file) | You need the one-page picture |
| `docs/ARCHITECTURE.md` | You are about to touch any code: components, data flow, surfaces, decisions |
| `docs/SHOPIFY_INTEGRATION.md` | You are working on extensions, APIs, scopes, webhooks, billing, app review |
| `docs/DATABASE.md` | You are touching the schema, encryption, retention, or GDPR handling |
| `docs/DEVELOPMENT.md` | You are setting up locally, writing code, testing, or you are an AI agent starting a task |
| `docs/ROADMAP.md` | You want to know current status, the 4-week plan, what is in / out of MVP, open questions |

## Decision log (short)

| Date | Decision | Why |
|---|---|---|
| 2026-09-18 | Build on Shopify's official app template (React Router + Prisma) | Fastest path to review; auth, sessions, billing, webhooks are solved |
| 2026-09-18 | Postgres, not SQLite, from day one | Encrypted PII + background jobs + multi-shop; migrating later is worse |
| 2026-09-18 | Post-purchase extension is the primary surface, checkout field is Plus-only bonus | Works on all plans; ships first |
| 2026-09-18 | Store collected values in order metafields **and** encrypted in our DB | Metafield = merchant-visible source of truth; DB copy drives reminders / status / retention |
| 2026-09-18 | Use fulfillment holds (`fulfillmentOrderHold`) plus an order tag, not just a tag | Holds are the sanctioned way to stop shipping; tags are for visibility and Flow |
| 2026-09-18 | Managed Pricing instead of hand-rolled Billing API calls | Less code, Shopify-hosted plan picker, fewer review issues |
