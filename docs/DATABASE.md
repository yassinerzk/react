# Database guide

Postgres 15+, accessed through Prisma. This file is the source of truth for the schema until
`prisma/schema.prisma` exists; after that, keep both in sync and treat the Prisma file as canonical.

## 1. Principles

1. **Shop-scoped everything.** Every table except `Session` and `WebhookEvent` carries `shopId`.
   Every query filters by it. No cross-shop joins, ever.
2. **Shopify IDs are stored as GIDs** (`gid://shopify/Order/123`), never bare numerics, in `text`
   columns. Use them as-is in GraphQL.
3. **PII is encrypted at the application layer**, not only at rest by the DB. Columns holding
   ciphertext are named `*Enc` and typed `bytea`. A sibling `*Last4` text column exists when the UI
   needs a hint.
4. **Soft state, hard deletes.** We do not soft-delete PII. Redaction and retention physically delete rows.
5. **Idempotency is a table, not a hope.** Webhooks and extension calls can retry; we dedupe on ids.
6. **Migrations only through `prisma migrate`.** No manual SQL in production.

## 2. Schema

Prisma-style pseudo-schema. Types map 1:1 to what we will write in `schema.prisma`.

```prisma
// ---------- Shopify session storage (from the template, do not rename) ----------
model Session {
  id          String    @id
  shop        String
  state       String
  isOnline    Boolean   @default(false)
  scope       String?
  expires     DateTime?
  accessToken String
  userId      BigInt?
  // template adds more columns; keep them
}

// ---------- Tenant ----------
model Shop {
  id                String    @id @default(cuid())
  domain            String    @unique            // "store.myshopify.com"
  shopGid           String    @unique            // gid://shopify/Shop/...
  planName          String                       // raw Shopify plan display name
  isPlus            Boolean   @default(false)
  isDevStore        Boolean   @default(false)
  billingPlan       BillingPlan @default(FREE)
  installedAt       DateTime  @default(now())
  uninstalledAt     DateTime?
  retentionDays     Int       @default(90)
  holdFulfillment   Boolean   @default(true)     // global default, rules can override
  reminderEnabled   Boolean   @default(true)
  reminderFromName  String?
  reminderReplyTo   String?
  primaryLocale     String    @default("en")
  currencyCode      String    @default("USD")
  rulesMetafieldSyncedAt DateTime?              // last time rules were pushed to shop metafield for ext D
  offers            Offer[]
  fieldRules        FieldRule[]
  requests          OrderInfoRequest[]
  auditLogs         AuditLog[]
}

enum BillingPlan { FREE GROWTH PRO }

// ---------- Upsell ----------
model Offer {
  id              String   @id @default(cuid())
  shopId          String
  shop            Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)
  name            String
  status          OfferStatus @default(DRAFT)
  priority        Int      @default(100)        // lower wins
  productGid      String
  variantGid      String
  quantity        Int      @default(1)
  discountType    DiscountType @default(NONE)
  discountValue   Decimal? @db.Decimal(10, 2)    // percent or fixed amount
  headline        Json     // { "en": "...", "fr": "..." }
  description     Json
  conditions      Json     // see §3
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  events          OfferEvent[]
  @@index([shopId, status, priority])
}

enum OfferStatus  { DRAFT ACTIVE PAUSED ARCHIVED }
enum DiscountType { NONE PERCENT FIXED }

model OfferEvent {
  id          String   @id @default(cuid())
  shopId      String
  offerId     String
  offer       Offer    @relation(fields: [offerId], references: [id], onDelete: Cascade)
  orderGid    String
  kind        OfferEventKind
  amount      Decimal? @db.Decimal(10, 2)       // accepted line total, for revenue stats
  currency    String?
  createdAt   DateTime @default(now())
  @@unique([offerId, orderGid, kind])           // one impression / accept / decline per order
  @@index([shopId, createdAt])
}

enum OfferEventKind { SHOWN ACCEPTED DECLINED FAILED }

// ---------- Information collection ----------
model FieldRule {
  id                  String   @id @default(cuid())
  shopId              String
  shop                Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)
  name                String
  enabled             Boolean  @default(true)
  priority            Int      @default(100)
  fieldKey            String   // metafield key, snake_case, unique per shop, e.g. "customs_id"
  fieldType           FieldType @default(TEXT)
  label               Json     // i18n
  helpText            Json?    // i18n
  placeholder         Json?
  required            Boolean  @default(true)
  validationPreset    String?  // "br_cpf" | "kr_pccc" | "tr_tckn" | "cl_rut" | ... see §4
  validationRegex     String?  // used when preset is null
  countries           String[] // ISO 3166-1 alpha-2, empty = all
  conditions          Json     // extra conditions, see §3
  surfaces            Surface[] // where to ask, ordered
  blockFulfillment    Boolean? // null = inherit shop.holdFulfillment
  reminderDelayMin    Int      @default(60)
  reminderMaxCount    Int      @default(2)
  expireAfterDays     Int      @default(14)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  requests            OrderInfoRequest[]
  @@unique([shopId, fieldKey])
  @@index([shopId, enabled])
}

enum FieldType { TEXT NUMBER SELECT CHECKBOX DATE }
enum Surface   { CHECKOUT POST_PURCHASE THANK_YOU ORDER_STATUS EMAIL }

model OrderInfoRequest {
  id                 String   @id @default(cuid())
  shopId             String
  shop               Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)
  orderGid           String
  orderName          String   // "#1042", for UI only
  customerGid        String?
  customerEmailEnc   Bytes?   // needed for reminders; encrypted
  keyId              String   // encryption key id used for *Enc columns in this row
  destinationCountry String?
  status             RequestStatus @default(PENDING)
  holdPlaced         Boolean  @default(false)
  fulfillmentOrderGids String[] // holds we placed, to release later
  reminderCount      Int      @default(0)
  lastReminderAt     DateTime?
  nextReminderAt     DateTime?
  expiresAt          DateTime
  collectedAt        DateTime?
  collectedVia       Surface?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  values             CollectedValue[]
  @@unique([shopId, orderGid])
  @@index([shopId, status, nextReminderAt])
  @@index([shopId, expiresAt])
}

enum RequestStatus { PENDING COLLECTED EXPIRED RESOLVED_MANUALLY CANCELLED }

model CollectedValue {
  id          String   @id @default(cuid())
  requestId   String
  request     OrderInfoRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  ruleId      String
  rule        FieldRule @relation(fields: [ruleId], references: [id])
  fieldKey    String
  valueEnc    Bytes
  valueLast4  String?
  keyId       String
  metafieldGid String?  // set once written to Shopify
  createdAt   DateTime @default(now())
  @@unique([requestId, fieldKey])
}

// ---------- Infra ----------
model WebhookEvent {
  id          String   @id            // X-Shopify-Webhook-Id
  topic       String
  shopDomain  String
  receivedAt  DateTime @default(now())
  processedAt DateTime?
  error       String?
  @@index([shopDomain, topic, receivedAt])
}

model AuditLog {
  id        String   @id @default(cuid())
  shopId    String
  shop      Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)
  actorId   String   // Shopify staff user id or "system"
  action    String   // "value.reveal" | "request.resolve" | "request.export" | "rule.delete" ...
  targetId  String?
  meta      Json?
  createdAt DateTime @default(now())
  @@index([shopId, createdAt])
}
```

`pg-boss` creates its own tables in schema `pgboss`; leave them out of Prisma.

## 3. `conditions` JSON shape

Used by both `Offer.conditions` and `FieldRule.conditions`. Keep it flat and boring.

```json
{
  "all": [
    { "field": "destinationCountry", "op": "in", "value": ["KR", "BR"] },
    { "field": "orderTotal",         "op": "gte", "value": 50 },
    { "field": "lineItemProductGids","op": "containsAny", "value": ["gid://shopify/Product/1"] },
    { "field": "lineItemTags",       "op": "containsAny", "value": ["fragrance"] },
    { "field": "customerTags",       "op": "notContainsAny", "value": ["wholesale"] }
  ]
}
```

Supported ops: `eq, neq, in, notIn, gte, lte, containsAny, notContainsAny`.
Evaluation lives in `app/domain/rules/evaluate.ts` and is pure. `FieldRule.countries` is a
convenience that compiles to a `destinationCountry in` condition.

## 4. Validation presets

Pure TS in `extensions/shared/validation/`, imported by backend and all extensions.
Each preset exports `{ normalize(input): string, validate(normalized): boolean, example: string }`.

| Preset | Country | Rule |
|---|---|---|
| `br_cpf` | BR | 11 digits, two check digits (mod 11) |
| `kr_pccc` | KR | `P` + 12 digits |
| `tr_tckn` | TR | 11 digits, first not 0, 10th and 11th check digits |
| `cl_rut` | CL | 7–8 digits + check digit (0–9 or K), mod 11 |
| `cn_resident_id` | CN | 18 chars, last is check digit (ISO 7064 mod 11-2) |
| `tw_ezway_phone` | TW | mobile number `09` + 8 digits (EZ Way binds by phone) |
| `id_nik` | ID | 16 digits |
| `za_id` | ZA | 13 digits, Luhn |
| `generic_digits` | any | `^\d{min,max}$` with params |

Backend **always** re-validates. Extensions validate for UX only.

## 5. Encryption

- Algorithm: AES-256-GCM. Library: Node `crypto`, no third-party.
- Keys: env var `PII_KEYS` = JSON `{"k1":"<base64 32 bytes>","k2":"..."}`, `PII_ACTIVE_KEY_ID=k2`.
- Stored blob layout: `keyId` in its own column; `valueEnc = iv(12) || ciphertext || tag(16)`.
- AAD = `shopId + ':' + rowId` so a ciphertext cannot be moved between rows.
- Rotation: add new key, switch active id, run `jobs/rotate-keys` which re-encrypts rows lazily.
- Helper API (in `app/domain/crypto`): `encrypt(plain, aad) -> {keyId, blob}`, `decrypt(blob, keyId, aad) -> plain`.
- Never call `decrypt` in a loader that renders a list. Only in the reveal action, the metafield
  write, the reminder job (email only), and the GDPR export.

## 6. Retention and deletion

| Trigger | What is deleted |
|---|---|
| `retentionDays` after `collectedAt` (nightly job) | `CollectedValue.valueEnc` set to empty, `customerEmailEnc` null. Row kept for stats |
| `customers/redact` webhook | All `OrderInfoRequest` + values for that customer, `AuditLog.meta` scrubbed |
| `shop/redact` webhook (48h after uninstall) | Everything with that `shopId`, sessions included |
| Merchant deletes a rule | Rule is kept if it has values (set `enabled=false`, UI shows "archived"); deleted only when it has none |

Metafields on the order are **not** deleted by us on retention. They belong to the merchant.
Setting "also delete order metafields on retention" is an opt-in in Settings.

## 7. Indexing and volume assumptions

- A shop with 10k orders / month and 2 rules generates ~10k `OrderInfoRequest` rows / month at most.
  Postgres on the smallest managed tier handles this comfortably for the first year.
- Hot queries: `status = PENDING AND nextReminderAt <= now()` (reminder job) and
  `shopId + status` (admin list). Both covered above.
- `OfferEvent` grows fastest. Partition by month only if it passes ~50M rows. Not a month-one problem.

## 8. Local setup

```bash
docker run --name afterpage-pg -e POSTGRES_PASSWORD=dev -p 5432:5432 -d postgres:16
export DATABASE_URL="postgresql://postgres:dev@localhost:5432/afterpage"
pnpm prisma migrate dev
pnpm prisma studio     # inspect
```

Seed script (`prisma/seed.ts`) creates one dev shop, one active offer, and two rules
(`br_cpf` for BR, `kr_pccc` for KR). Values in the seed are fake and marked as such.

## 9. Things not to do

- Do not add a `customerEmail` plaintext column "just for search". Search by order name instead.
- Do not store `accessToken` anywhere except `Session`.
- Do not put JSON blobs of the whole Shopify order in the DB. Store the GID and refetch.
- Do not write raw SQL for PII tables. Prisma only, so the `*Enc` discipline is visible in review.
