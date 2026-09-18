# Roadmap and status

## Current status

```
Phase:        0 — design only, no code yet
Last updated: 2026-09-18
Next action:  Week 1, task 1.1 (bootstrap with `shopify app init`)
Blockers:     none
Open verifs:  see SHOPIFY_INTEGRATION.md §12 (5 items) — resolve in week 1
```

Update this block whenever a task completes. Keep it honest; it is the first thing any
person or agent reads.

## Goal

A reviewable, billable app live on the Shopify App Store in **4 weeks**, with:
post-purchase upsell + conditional info collection on all plans, fallback chain (thank-you page,
order status page, reminder email), fulfillment holds, encrypted storage, GDPR webhooks,
Managed Pricing with a real free tier. Plus checkout field is a bonus if it fits in week 4.

## MVP scope (in / out)

| In | Out (later) |
|---|---|
| 1 offer per post-purchase page, percent or fixed discount | Multi-offer funnels, downsells, A/B |
| Field rules by country + product tags + order total | Rules on customer tags, cart attributes, discount codes |
| Presets: `br_cpf`, `kr_pccc`, `tr_tckn`, `cl_rut`, `generic_digits` | Remaining presets (`cn`, `tw`, `id`, `za`) |
| Surfaces A, B, C + email | Surface D (Plus checkout) if week 4 is tight |
| Holds + tags | Shopify Flow trigger, Slack / email alerts to merchant |
| Admin: dashboard, offers, rules, requests, settings | Analytics charts beyond counters, CSV export (keep a JSON export for GDPR) |
| English admin, editable customer-facing labels | Localized admin |
| Managed Pricing, 3 plans | Usage-based add-ons |

## Week-by-week plan

### Week 1 — foundation (days 1–5)
| # | Task | Output |
|---|---|---|
| 1.1 | `shopify app init` (React Router template), pnpm, Postgres, Prisma, pg-boss, pino, zod, prettier | app boots, installs on dev store |
| 1.2 | Prisma schema from `DATABASE.md` (all tables), migration, seed | `pnpm prisma migrate dev` green |
| 1.3 | Crypto module + tests | round-trip, AAD tamper test |
| 1.4 | Shop bootstrap on install: plan detection, metafield definitions, `Shop` row | install → row with `isPlus` correct |
| 1.5 | Webhooks: `app/uninstalled`, `shop/update`, 3 GDPR topics, `WebhookEvent` dedupe | `shopify app webhook trigger` for each |
| 1.6 | Resolve the 5 **[verify]** items in `SHOPIFY_INTEGRATION.md §12` | docs updated |
| 1.7 | Request protected customer data access in Partner Dashboard (approval takes days) | submitted |
| 1.8 | Request a Plus dev store | submitted |

### Week 2 — core value (days 6–10)
| # | Task | Output |
|---|---|---|
| 2.1 | Rule engine (`domain/rules/evaluate.ts`) + validation presets + tests | pure, 100% covered |
| 2.2 | Extension A: `ShouldRender` + plan endpoint + offer card + accept/decline with changeset | offer works on dev store |
| 2.3 | Extension A: fields form under offer + collect endpoint → encrypt, metafield, tag | metafield visible on order |
| 2.4 | Admin: Offers CRUD (Polaris, product picker via App Bridge resource picker) | |
| 2.5 | Admin: Field rules CRUD, preset picker, country multiselect, live preview of the form | |

### Week 3 — fallback chain and safety (days 11–15)
| # | Task | Output |
|---|---|---|
| 3.1 | `orders/create` handler → request creation, holds, tags, reminder job | flow 2.2 E2E |
| 3.2 | Extension B (thank-you) and C (order status) with session-token auth | form appears when pending |
| 3.3 | Reminder job + Resend template + `orders/cancelled` / `orders/fulfilled` handling | email with working link |
| 3.4 | Retention job, expiry job, needs-attention list, manual resolve, reveal with audit log | |
| 3.5 | Managed Pricing plans created; `billingPlan` mirror; feature gates | free tier limits enforced |
| 3.6 | Dashboard counters: render rate, accept rate, completion rate by surface | |

### Week 4 — ship (days 16–22)
| # | Task | Output |
|---|---|---|
| 4.1 | Extension D (Plus) if 3.x finished on time; else move to post-launch | |
| 4.2 | Hosting: web + worker deployed, secrets, backups, `/healthz`, alerts | production URL |
| 4.3 | Full manual E2E checklist (`DEVELOPMENT.md §5`) on both dev stores | all 6 pass |
| 4.4 | Listing: copy, 6 screenshots, demo video (60 s), privacy policy, support email, `network_access` justification | |
| 4.5 | Submit for review **by day 19** (review takes 5–10 business days; iterate on feedback) | submitted |
| 4.6 | Onboarding page: "enable post-purchase in Checkout settings" with screenshot + detect-and-nag banner | |

## Milestones

| Date (target) | Milestone |
|---|---|
| Day 5 | App installs, DB migrated, GDPR webhooks pass, protected data requested |
| Day 10 | Offer + fields work on the post-purchase page on a non-Plus dev store |
| Day 15 | Skip-the-page flow recovers via email → order status page; holds release |
| Day 19 | Submitted for review |
| Day 30 | Live, first paying merchant |

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Review rejects a fields-only post-purchase page | Core flow changes | Resolve in week 1; fallback = always pair with an offer, fields-only orders use B |
| Protected customer data approval is slow | No reminder emails at launch | Ship with reminders "pending approval" banner; B and C still work without email |
| Post-purchase does not render for many gateways | Lower value for some merchants | Flow 2.2 covers it; listing states supported gateways honestly |
| Extension API names drift from this doc | Wasted days | Pin versions in week 1; treat **[verify]** items as tasks |
| Scope creep (surveys, funnels) | Miss the month | MVP table above is the contract; new ideas go to "Post-launch" below |

## Post-launch backlog (do not start before live)

- Surface D if it slipped, remaining validation presets, Shopify Flow trigger "Info collected",
  CSV export, multi-offer funnels, A/B offers, localized admin (FR, ES, PT-BR, KO, TR),
  Klaviyo / SMS reminder channel, per-rule custom email template, survey question on the post-purchase page.

## Open questions

1. Working name "Afterpage" is a placeholder. Decide name + domain before listing copy (week 3).
2. Hosting provider: Fly.io vs Railway (week 1, pick the one with the simplest worker + Postgres story).
3. Should the free tier include the upsell with a "Powered by" badge instead of excluding it? Decide after first 20 installs.
