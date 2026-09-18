# Architecture

This document explains how the pieces fit together. Read it before touching code.
For Shopify-specific API details see `SHOPIFY_INTEGRATION.md`; for the schema see `DATABASE.md`.

## 1. High-level picture

```
                 ┌──────────────────────────────────────────────────────┐
                 │                    Shopify                           │
                 │                                                      │
  Customer ──►   │  Checkout ──► Post-purchase page ──► Thank-you page  │
                 │     ▲              (ext A)              (ext B)      │
                 │     │ (ext D, Plus only)                             │
                 │                                                      │
                 │  Customer account ► Order status page (ext C)        │
                 │                                                      │
                 │  Admin ► Embedded app (Polaris UI)                   │
                 │  Webhooks ► orders/*, fulfillment_orders/*, app/*    │
                 └───────┬───────────────────────────────┬──────────────┘
                         │ Admin GraphQL                 │ Webhooks / ext fetch
                         ▼                               ▼
                 ┌──────────────────────────────────────────────────────┐
                 │                 Afterpage backend                    │
                 │  React Router app (SSR) + API routes                 │
                 │  ├─ /app/*        merchant UI (embedded)             │
                 │  ├─ /api/ext/*    endpoints called by extensions     │
                 │  ├─ /webhooks/*   Shopify webhooks                   │
                 │  └─ /jobs/*       worker entry (reminders, retention)│
                 │                                                      │
                 │  Postgres (Prisma)   ·   Job queue (pg-boss)         │
                 │  Email provider (Resend)                             │
                 └──────────────────────────────────────────────────────┘
```

Extensions (all live in `extensions/` and deploy with `shopify app deploy`):

| ID | Type | Target | Plan | Purpose |
|---|---|---|---|---|
| A | `checkout_post_purchase` | post-purchase page | all | Show offer + conditional fields |
| B | `ui_extension` | `purchase.thank-you.block.render` | all | Fields fallback when A did not render or was skipped |
| C | `ui_extension` | `customer-account.order-status.block.render` | all | Fields fallback, reminder email link target, edit collected value |
| D | `ui_extension` | `purchase.checkout.delivery-address.render-after` | Plus | Required field before payment, validation blocks progress |

## 2. Runtime flows

### 2.1 Order placed, post-purchase renders (happy path, all plans)

1. Customer pays. Shopify calls extension A `ShouldRender`.
2. `ShouldRender` receives `inputData` (line items, `destinationCountryCode`, totals, `token`).
   It calls `POST /api/ext/post-purchase/plan` with the token. Backend evaluates:
   - **Offer rules** → picks at most one offer (priority order, stock check, exclusions).
   - **Field rules** → list of fields whose conditions match (country, product tags, total).
3. Backend responds `{ offer?, fields[], requestId }`. Extension stores it via `storage.update()`
   and returns `render: offer || fields.length > 0`.
4. `Render` shows: offer card (accept / decline) and, below it, the fields form.
5. On **accept**: `calculateChangeset` → show updated total → `applyChangeset` (signed JWT from backend).
6. On **submit fields**: `POST /api/ext/post-purchase/collect` with token + values.
   Backend validates (preset or regex), encrypts, stores, writes order metafields,
   releases fulfillment hold if one exists, tags order `afterpage:collected`.
7. Customer continues to thank-you page. Extension B checks `GET /api/ext/status?orderId`
   and renders nothing if everything is collected.

### 2.2 Post-purchase did not render or was skipped

Reasons it may not render: unsupported gateway, order type (e.g. some local pickup / draft
order flows), customer closed the tab, `ShouldRender` timed out.

1. `orders/create` webhook arrives (always, regardless of extensions).
2. Backend evaluates field rules against the order. If any match and no `OrderInfoRequest`
   exists with status `collected`, it creates one with status `pending`.
3. If the rule has `blockFulfillment = true`: place a fulfillment hold on each open
   fulfillment order (`fulfillmentOrderHold`, reason `OTHER`, note "Waiting for customs ID").
4. Tag order `afterpage:pending`.
5. Enqueue `send-reminder` job at `now + rule.reminderDelayMinutes` (default 60).
6. Thank-you page (B) and order status page (C) show the form while status is `pending`.
7. Reminder email links to the order status page. Customer fills form → same collect endpoint
   → hold released, tag swapped, job cancelled.
8. If never collected: after `rule.expireAfterDays` the request goes to `expired`,
   the merchant sees it in the "Needs attention" list in the admin UI, and the hold stays
   until they resolve it manually.

### 2.3 Plus checkout field (extension D)

1. Extension D reads `shippingAddress.countryCode` via checkout API hooks.
2. It fetches the applicable field rules from an app **metafield on the shop** (not a fetch
   to our backend, to stay fast and offline-safe). We sync this metafield whenever rules change.
3. Renders the field, validates on blur, uses `useBuyerJourneyIntercept` to block progress
   when required and invalid.
4. Saves the value as a **cart attribute** (`useApplyAttributeChange`). It becomes an order
   attribute on `orders/create`.
5. Backend, on `orders/create`, moves the attribute into the encrypted store + order metafield
   and marks the request `collected` immediately. Post-purchase page then shows only the offer.

### 2.4 Uninstall / redact

`app/uninstalled` → mark shop uninstalled, cancel jobs, schedule full data purge after 48h.
`shop/redact` → purge everything for that shop. `customers/redact` → purge that customer's
requests and values. `customers/data_request` → produce export (email to merchant).

## 3. Module layout (planned)

```
app/
  routes/
    app._index.tsx              dashboard: stats, needs-attention list
    app.offers.*.tsx            offer CRUD
    app.rules.*.tsx             field rule CRUD
    app.requests.*.tsx          collected / pending requests, manual resolve, export
    app.settings.tsx            retention, email sender, hold behaviour
    api.ext.post-purchase.plan.tsx
    api.ext.post-purchase.collect.tsx
    api.ext.post-purchase.changeset.tsx
    api.ext.status.tsx          used by B, C
    api.ext.collect.tsx         used by B, C (session-token auth)
    webhooks.*.tsx
  domain/
    offers/                     rule evaluation, changeset building
    fields/                     rule evaluation, validation presets, i18n labels
    requests/                   state machine pending → collected → expired
    crypto/                     AES-GCM helpers, key ids
    shopify/                    thin typed wrappers around Admin GraphQL we use
    jobs/                       pg-boss job definitions and handlers
  lib/                          shared utils, logging, errors
extensions/
  post-purchase/                extension A
  thank-you-fields/             extension B
  order-status-fields/          extension C
  checkout-fields/              extension D
  shared/                       validation presets shared with backend (pure TS, no deps)
prisma/
  schema.prisma
  migrations/
docs/
```

Rule: **`domain/` has no React and no Shopify SDK imports except in `domain/shopify/`.**
It is unit-testable with plain vitest.

## 4. Key design decisions

| # | Decision | Alternatives rejected | Reason |
|---|---|---|---|
| 1 | Field rules are evaluated on the backend for A, B, C, but from a shop metafield for D | Backend fetch from D | Checkout extensions must be fast and cannot rely on our uptime; a metafield read is local |
| 2 | Values live in order metafields (namespace `$app:collect`) and encrypted in our DB | Order note attributes only | Notes are free text, not typed, printed everywhere; metafields are structured and permissioned |
| 3 | Fulfillment holds, not only tags | Tags only | A tag does not stop a 3PL. Hold is enforced by Shopify |
| 4 | One offer per post-purchase page in MVP | Multi-offer funnels | Review simplicity; funnels are a Pro feature later |
| 5 | Validation presets are pure functions shared by backend and extensions | Server-only validation | Instant feedback on the page; server re-validates anyway |
| 6 | pg-boss for jobs | Redis + BullMQ, cron | One datastore, transactional enqueue, no extra infra for month one |
| 7 | Resend for email with merchant-configurable sender name | Shopify Email, Flow | Available on all plans, deliverable in a week; Flow trigger can be added later as an integration |

## 5. Security model

- Extensions never receive secrets. A, B, C authenticate to the backend with Shopify-issued
  tokens (`inputData.token` for A, session token for B/C). Backend verifies JWT with the app secret.
- Backend authorizes every request against the shop in the token; the shop can only read its own rows.
- PII (collected values, customer email) is encrypted with AES-256-GCM. Key from env, key id stored
  per row so rotation is possible. Plaintext never goes to logs, error trackers, or job payloads.
- Merchant UI shows last 4 characters of a value by default; full value requires a click that is
  written to `AuditLog`.
- Retention job deletes DB plaintext-equivalents after `shop.retentionDays` (default 90).
  Metafields are the merchant's data and are not auto-deleted unless they enable it.

## 6. Observability

- Structured JSON logs (`pino`), request id per HTTP call, job id per job run.
- Never log request bodies from `/api/ext/*collect*`.
- Metrics we care about from day one: post-purchase render rate, offer accept rate,
  field completion rate by surface (A / B / C / D / email), reminder-to-completion time.
  These come from `OfferEvent` and `OrderInfoRequest` rows, no third-party analytics needed.

## 7. Non-goals for MVP

- Multi-step upsell funnels, downsells.
- Surveys / NPS (possible later on the same page).
- Anything pre-purchase on non-Plus (cart attributes via theme extension). Explicitly rejected for UX.
- Storing card or payment data. Never.
