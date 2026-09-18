# Shopify integration guide

Everything that touches Shopify: extensions, APIs, scopes, webhooks, billing, review.
Verify any item marked **[verify]** against current Shopify docs before relying on it; the
platform changes quarterly and this file was written before code existed.

## 1. App type and template

- Public app, embedded, listed on the App Store.
- Bootstrap: `shopify app init` → "Build a React Router app" (Shopify's official template,
  TypeScript, Prisma session storage). Do not start from an older Remix or Node/Express template.
- App config lives in `shopify.app.toml`. Extension config lives in each `extensions/*/shopify.extension.toml`.
- Deploy extensions and config with `shopify app deploy`. This creates an app version; the
  post-purchase extension only becomes live for a merchant after they pick our app in
  **Settings → Checkout → Post-purchase page** (one app per store). Onboarding must explain this step.

## 2. Access scopes

Keep the list minimal; every extra scope is a review question.

| Scope | Needed for |
|---|---|
| `read_products` | Offer product picker, variant price / stock |
| `read_orders` | Read order on webhook, order status, tags |
| `write_orders` | Order tags, order metafields (`metafieldsSet` on Order) |
| `read_customers` | Customer email for reminder (only when post-purchase skipped) **[verify: may be granted by orders scope for this field]** |
| `read_merchant_managed_fulfillment_orders` + `write_merchant_managed_fulfillment_orders` | Fulfillment holds |
| `read_third_party_fulfillment_orders` + `write_third_party_fulfillment_orders` | Holds when a 3PL app owns the fulfillment order |
| `write_metafield_definitions` **[verify name]** | Create pinned order metafield definitions on install |

Customer account extension (C) additionally declares in its toml what it needs from the
Customer Account API (order id, shipping country) **[verify exact `api_access` keys]**.

**Protected customer data.** In the Partner Dashboard → App → API access, request
"Protected customer data" (Level 1: name, email, phone, address) and state the purpose:
"Collecting delivery / customs identification and sending a reminder email for it."
Without this, `orders/create` payloads arrive with customer fields stripped.

## 3. Extension A: post-purchase (`checkout_post_purchase`)

Two entry points in `extensions/post-purchase/src/index.tsx`:

```ts
extend('Checkout::PostPurchase::ShouldRender', async ({ inputData, storage }) => {
  const res = await fetch(`${APP_URL}/api/ext/post-purchase/plan`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${inputData.token}` },
    body: JSON.stringify({ referenceId: inputData.initialPurchase.referenceId }),
  });
  const plan = await res.json();       // { offer?, fields[], requestId }
  await storage.update(plan);
  return { render: Boolean(plan.offer) || plan.fields.length > 0 };
});

render('Checkout::PostPurchase::Render', App);  // reads storage.initialData
```

Facts to design around:

- `inputData.initialPurchase` gives `referenceId` (order id), `lineItems`, `totalPriceSet`,
  `customerId`, `destinationCountryCode`. It does **not** give the shipping address or email.
  Anything else: look the order up server-side by id.
- `inputData.token` is a JWT signed with the app's API secret. Verify it on every backend call.
  It is short-lived; do not persist it.
- `ShouldRender` has a tight time budget (a few seconds). Backend must answer in < 500 ms:
  cache rules per shop in memory, do not hit Shopify from that endpoint.
- Offer flow: `calculateChangeset({ changes })` → shows new total → `applyChangeset(signedToken)`.
  The signed changeset token is minted by our backend (`/api/ext/post-purchase/changeset`) using
  the app secret; the extension never sees the secret.
- Changeset `changes` support `add_variant` with `discount` and `add_shipping_line` **[verify list]**.
- The page does not render for: gateways other than Shopify Payments / PayPal Express / a
  short allow-list, orders with installment payments, some pickup flows, orders where the
  customer used a vaulted wallet that requires re-auth **[verify current list]**.
  This is why flow 2.2 in ARCHITECTURE exists.
- Available UI components include `TextField`, `Select`, `Checkbox`, `Radio`, `Button`, `Banner`,
  `Layout`, `Heading`, `Image`, `Form` **[verify names against current post-purchase component list]**.
- App Store rule to confirm before building the "fields without offer" case: whether a
  post-purchase page that shows only a form (no offer) is accepted in review. Fallback design if
  not: always require an offer for A and use B for fields-only orders.

## 4. Extensions B, C, D: checkout UI extensions (`ui_extension`)

One extension package per target keeps review and toml simple.

| Ext | `targeting` in toml | Plan | Auth to backend |
|---|---|---|---|
| B | `purchase.thank-you.block.render` | all | `useSessionToken()` → Bearer |
| C | `customer-account.order-status.block.render` | all | `useSessionToken()` → Bearer |
| D | `purchase.checkout.delivery-address.render-after` (also test `purchase.checkout.block.render` for merchant-placed) | Plus | none, reads shop metafield |

Shared facts:

- Extensions run in a web worker sandbox with Shopify's UI components (`@shopify/ui-extensions-react/checkout`).
  No DOM, no arbitrary CSS, no third-party scripts. Design within Polaris-like components.
- `network_access = true` in toml is required for B and C to call our backend. It is a review item;
  the listing must say why.
- B and C can read `order.id` (B via `useOrder()` **[verify hook]**, C via order status API) and
  `shippingAddress.countryCode`.
- D: `useShippingAddress()`, `useApplyAttributeChange()`, `useBuyerJourneyIntercept()`,
  `useAppMetafields()` with `[[extensions.metafields]]` declared in toml (namespace `$app:rules`, key `checkout`).
- Metafield for D is written by the backend with `metafieldsSet` on the Shop whenever a rule is
  saved. Payload = compiled list of `{ fieldKey, label, countries, preset, regex, required }`.
- D must handle the case where the merchant is on Plus but has not placed the block:
  nothing renders, and flow 2.1 still covers them.
- Thank-you page (B) cannot write to the order; it posts to our backend, which writes the metafield.

## 5. Order metafields

On install, create definitions so values show cleanly in the admin order page:

```graphql
mutation {
  metafieldDefinitionCreate(definition: {
    name: "Customs / delivery ID",
    namespace: "$app:collect",
    key: "customs_id",           # one definition per FieldRule.fieldKey
    type: "single_line_text_field",
    ownerType: ORDER,
    pin: true,
    access: { admin: MERCHANT_READ }
  }) { createdDefinition { id } userErrors { field message } }
}
```

- `$app:` namespaces are reserved to our app; other apps cannot read them. Merchant can read but
  not edit (`MERCHANT_READ`). If merchants need to correct a value they do it in our UI, which
  re-writes the metafield and logs it.
- Write values with `metafieldsSet(metafields: [{ ownerId: orderGid, namespace, key, type, value }])`.
- Metafields show on packing slips through the merchant's Liquid template edits; provide a copy-paste
  snippet in Settings: `{{ order.metafields.app--<app-id>--collect.customs_id }}` **[verify the
  rendered namespace form for app-reserved metafields in Liquid]**.

## 6. Fulfillment holds

```graphql
mutation Hold($id: ID!) {
  fulfillmentOrderHold(id: $id, fulfillmentHold: { reason: OTHER, reasonNotes: "Waiting for customs ID (Afterpage)", notifyMerchant: false }) {
    fulfillmentOrder { id status } userErrors { field message }
  }
}
mutation Release($id: ID!) {
  fulfillmentOrderReleaseHold(id: $id) { fulfillmentOrder { id status } userErrors { field message } }
}
```

- Get fulfillment orders with `order(id:) { fulfillmentOrders(first: 10) { nodes { id status } } }`.
- Store held GIDs in `OrderInfoRequest.fulfillmentOrderGids` so release is exact.
- Holds may fail for already-fulfilled or cancelled fulfillment orders; treat `userErrors` as
  non-fatal and record in the request.
- **Multiple holds per fulfillment order** are supported by newer API versions **[verify]**; if
  the version we pin does not, check `status == ON_HOLD` first and skip.

## 7. Order tags

`tagsAdd(id: orderGid, tags: ["afterpage:pending"])` / `tagsRemove`. Tags:

| Tag | Meaning |
|---|---|
| `afterpage:pending` | Waiting for customer input |
| `afterpage:collected` | All required fields present |
| `afterpage:expired` | Gave up, merchant must resolve |

Tags let merchants filter orders and build Shopify Flow automations without our app doing more.

## 8. Webhooks

Declared in `shopify.app.toml` (`[[webhooks.subscriptions]]`), delivered to `/webhooks/<topic>`.

| Topic | Handler responsibility |
|---|---|
| `orders/create` | Evaluate field rules → create request, hold, tag, enqueue reminder (flow 2.2). Move ext D attribute into store |
| `orders/updated` | If shipping country changed before fulfillment, re-evaluate |
| `orders/cancelled` | Cancel request, release hold, cancel jobs |
| `orders/fulfilled` | If request still pending (merchant bypassed), mark `RESOLVED_MANUALLY` |
| `fulfillment_orders/*` **[verify useful subset]** | Keep `fulfillmentOrderGids` accurate when orders split |
| `app/uninstalled` | Mark uninstalled, cancel jobs, schedule purge |
| `shop/update` | Refresh `isPlus`, `planName`, locale, currency |
| `app_subscriptions/update` | Mirror `billingPlan` (Managed Pricing still emits this) |
| `customers/data_request` | Mandatory GDPR: export |
| `customers/redact` | Mandatory GDPR: delete customer data |
| `shop/redact` | Mandatory GDPR: delete shop data |

Rules:
- Verify HMAC (template does this). Insert `WebhookEvent` row first; if the id exists, return 200 and stop.
- Return 200 within 5 seconds. Do the real work in a job when it needs Shopify calls.
- Webhooks can arrive out of order. `orders/create` after `orders/cancelled` must not resurrect a request.

## 9. Billing: Managed Pricing

- Plans are configured in the Partner Dashboard, not in code. Shopify hosts the plan picker.
- The app reads the current plan via `currentAppInstallation { activeSubscriptions { name status } }`
  and mirrors it to `Shop.billingPlan`; `app_subscriptions/update` keeps it fresh.
- Feature gating is done in our code by `billingPlan` (see README pricing table).
- Free plan must be genuinely usable (1 rule, 50 requests / month) so review does not flag a "fake free".
- Dev stores and the review team's store must get everything unlocked: `isDevStore || planName includes "affiliate" || "partner_test"` → treat as PRO. **[verify plan name strings]**

## 10. Plan detection (Plus vs not)

```graphql
{ shop { plan { partnerDevelopment shopifyPlus displayName } } }
```

Run on install and on `shop/update`. `shopifyPlus` drives whether the UI shows the
"Collect in checkout" option and the instructions to add block D in the checkout editor.

## 11. Compliance and review checklist

- [ ] Mandatory GDPR webhooks implemented and tested with `shopify app webhook trigger`.
- [ ] Protected customer data access requested with purpose text.
- [ ] Privacy policy URL and data retention statement in the listing (state: encrypted, retention default 90 days, merchant-configurable).
- [ ] `network_access` justification written in the listing for B and C.
- [ ] App does not collect data it does not need: no phone, no address beyond country (we read country from Shopify, we do not ask).
- [ ] Post-purchase page: one offer max, clear "No thanks" button, price and discount shown before accept, no countdown timers that are fake.
- [ ] Embedded app uses App Bridge, Polaris, session tokens (template default).
- [ ] Uninstall cleans up: holds released (best effort), no orphan metafield definitions left "pinned" without values (Shopify keeps definitions; document this).
- [ ] Listing screenshots show both plans' flows; explain the post-purchase checkout-settings step.
- [ ] Test on a Plus dev store (request one via Partner Dashboard) and a non-Plus dev store.
- [ ] Test with Shopify Payments test mode and with PayPal sandbox, plus one unsupported gateway to see fallback 2.2 trigger.

## 12. Known unknowns to resolve in week one

1. Review acceptance of fields-only post-purchase page (§3).
2. Exact hook names / API access keys for the current `@shopify/ui-extensions` version we pin.
3. Whether `orders/create` contains `email` when protected data access is pending approval (it does not; plan for reminders to be disabled until approval).
4. Liquid path for `$app:` metafields on packing slips (§5).
5. Fulfillment hold behaviour on already-held orders for our pinned API version (§6).
