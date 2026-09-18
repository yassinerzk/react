# Development guide

How to set up, code, test, and ship. Also the entry point for any AI agent picking up a task.

## 0. If you are an AI agent starting a task

1. Read `README.md`, then `docs/ROADMAP.md` (status + what is next), then the doc for the area you
   are touching (`ARCHITECTURE`, `SHOPIFY_INTEGRATION`, `DATABASE`).
2. Check the "Current status" block at the top of `ROADMAP.md`. Update it when you finish something.
3. Anything marked **[verify]** in the docs is unconfirmed. Confirm against Shopify docs before
   relying on it, then remove the marker and note the source in the same line.
4. Do not invent Shopify API names. If a hook or mutation is not in the pinned package's types, it
   does not exist for us.
5. Never log, print, or include in a test fixture a real-looking national ID. Use the `example`
   value from the validation preset and prefix test data with `TEST`.
6. Keep PRs small: one route, one extension, or one domain module per PR. Update docs in the same PR.
7. Commit messages: `area: what changed` (`ext-a: add fields form below offer`, `db: add OrderInfoRequest`).

## 1. Stack

| Layer | Choice | Notes |
|---|---|---|
| Runtime | Node 20 LTS | Match Shopify CLI requirement |
| Package manager | pnpm | Lockfile committed |
| App framework | Shopify app template (React Router, SSR) | `shopify app init` |
| Language | TypeScript, `strict: true`, no `any` without `// why:` comment | |
| UI (admin) | Polaris + App Bridge | Template default |
| UI (extensions) | `@shopify/ui-extensions-react` (checkout + post-purchase) | Pin exact version |
| ORM | Prisma | Postgres |
| Jobs | pg-boss | Same DB |
| Email | Resend | Env `RESEND_API_KEY` |
| Validation | zod at every HTTP boundary | Extensions use the shared presets only |
| Logging | pino, JSON | Redaction list in `app/lib/logger.ts` |
| Tests | vitest (unit), Playwright (admin UI smoke) | Extensions: unit test the pure parts |
| Lint / format | eslint (template config) + prettier | CI fails on either |
| Hosting | Fly.io or Railway (one web process + one worker process) | Decide week 1; both trivial |

## 2. Local setup

```bash
# prerequisites: node 20, pnpm, docker, Shopify CLI (npm i -g @shopify/cli)
git clone <repo> && cd <repo>
pnpm install
cp .env.example .env            # fill values below
docker compose up -d postgres   # or the docker run in DATABASE.md
pnpm prisma migrate dev
pnpm prisma db seed
shopify app dev                 # opens tunnel, installs on your dev store
```

`.env.example` (never commit `.env`):

```
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=
SHOPIFY_APP_URL=            # set by CLI in dev
SCOPES=                     # keep in sync with shopify.app.toml
DATABASE_URL=postgresql://postgres:dev@localhost:5432/afterpage
PII_KEYS={"k1":"<base64 32 bytes>"}
PII_ACTIVE_KEY_ID=k1
RESEND_API_KEY=
APP_ENV=development
LOG_LEVEL=debug
```

Generate a key: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.

Dev stores: create two in the Partner Dashboard, one normal and one with the Plus
features enabled (request via "Create development store → Shopify Plus" **[verify current option]**).

## 3. Commands

| Command | Does |
|---|---|
| `pnpm dev` | `shopify app dev` (app + extensions with hot reload) |
| `pnpm build` | production build of the app |
| `pnpm worker` | starts the pg-boss worker (`app/jobs/worker.ts`) |
| `pnpm test` | vitest, unit |
| `pnpm test:e2e` | Playwright against `shopify app dev` URL |
| `pnpm lint` / `pnpm format` | eslint / prettier |
| `pnpm typecheck` | `tsc --noEmit` for app and each extension |
| `pnpm prisma migrate dev --name <name>` | create a migration |
| `shopify app deploy` | push extensions + config as a new app version |
| `shopify app webhook trigger --topic orders/create` | fire a fake webhook at local |

## 4. Project conventions

### Code
- Routes are thin: parse → call `domain/` → respond. No business logic in loaders/actions.
- `domain/` modules are pure or take injected clients (`{ admin, db, jobs, now }`) so they test without Shopify.
- Every external input is parsed with zod before use: webhook bodies, extension POSTs, form data.
- Errors: throw `AppError(code, message, { status })` from `app/lib/errors.ts`; routes map to responses. Never leak stack traces to extensions.
- Money: `Decimal` from Prisma or string; never float. Currency code travels with every amount.
- Dates: store UTC, render in the shop's timezone (`shop.ianaTimezone`, add to Shop when needed).
- i18n: JSON per locale in `app/locales/`. Merchant-facing copy in the admin follows Polaris tone.
  Customer-facing labels are merchant-editable (stored in rules), so we ship only defaults.

### Extensions
- One folder per extension, `src/` inside, no shared imports except `extensions/shared/` (pure TS).
- No `fetch` in `ShouldRender` beyond the single plan call. Timeout it at 2 s and fall back to `render: false`.
- Every backend call from an extension sends the Shopify-issued token; the backend never trusts a shop domain in the body.

### Database
- See `DATABASE.md`. Short version: shop-scoped, GIDs, `*Enc` columns, no raw SQL on PII tables.

### Git
- Branch per task: `feat/<area>-<short>`, `fix/<area>-<short>`, `docs/<short>`.
- Squash-merge to `main`. `main` is always deployable.
- Do not commit `.env`, `shopify.app.*.toml` for personal dev apps (template gitignores them), or store-specific ids.

## 5. Testing strategy

| Level | What | Tool |
|---|---|---|
| Unit | rule evaluation, validation presets, crypto round-trip, request state machine, changeset building | vitest, pure |
| Integration | webhook handlers against a real Postgres (testcontainers or the docker DB), Shopify Admin mocked with recorded GraphQL responses | vitest |
| Extension | render post-purchase `App` with mocked `storage.initialData`; assert form appears only when fields exist | vitest + `@shopify/ui-extensions` test utils **[verify availability]** |
| E2E manual | full purchase on dev store with Shopify Payments test mode: see checklist below | Playwright where possible, otherwise manual |

Manual E2E checklist (run before every `shopify app deploy` to production):

1. Non-Plus store, BR address, offer active → post-purchase shows offer + CPF field. Accept offer, submit valid CPF → order has extra line, metafield set, tag `collected`, no hold.
2. Same, close tab on post-purchase → after webhook: tag `pending`, hold placed, reminder email after delay → fill on order status page → hold released.
3. Non-Plus store, US address → post-purchase shows offer only, no fields, no request row.
4. Plus store, block D placed, KR address → checkout blocks until PCCC valid → post-purchase shows offer only → metafield set from attribute.
5. Invalid CPF → inline error, backend 422, nothing stored.
6. Uninstall → jobs cancelled; trigger `shop/redact` → rows gone.

## 6. Definition of done for any task

- Code + tests + docs updated in the same PR.
- `pnpm lint && pnpm typecheck && pnpm test` green.
- No new **[verify]** markers added without a linked doc source; existing ones you relied on are resolved.
- PII rules respected (grep the diff for `console.log` and for `decrypt(`).
- `ROADMAP.md` status block updated if the task moved a milestone.

## 7. Deployment (target shape, decide provider in week 1)

- Two processes from one image: `web` (React Router server) and `worker` (`pnpm worker`).
- Postgres managed by the provider, daily backups, `PII_KEYS` in the provider's secret store.
- `shopify app deploy` from CI on tag; app server deploys on merge to `main`.
- Health: `GET /healthz` returns DB + pg-boss status. Alert on webhook error rate and job failures.
