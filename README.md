# shopnest-orders

A small Express order service used to demo **Codebase Pilot** — detecting the internal services a repo depends on and flagging when their API docs change.

## What it depends on

| Service | Purpose | Client | Docs (public) |
|---|---|---|---|
| **PayHub** v1 | Payments, captures, refunds | `src/services/payhubClient.js` | https://anujchaudhary00.github.io/shopnest-orders/payhub/ |
| **SwiftCourier** v2 | Shipments, tracking | `src/services/courierClient.js` | https://anujchaudhary00.github.io/shopnest-orders/courier/ |

Each service is discoverable three ways (so detection works whichever signal Codebase Pilot uses):
1. `third-party-services.json` — explicit registry with docs + spec URLs
2. `@service` / `@see` JSDoc headers in each client file
3. `*_BASE_URL` env vars in `.env.example` and `src/config.js`

## Hosting the docs (the "public URL")

The `docs/` folder is a static site. After pushing the repo:

1. GitHub → **Settings → Pages** → Source: *Deploy from a branch* → Branch `main`, folder `/docs` → Save.
2. In ~1 minute the docs are live at `https://<your-username>.github.io/shopnest-orders/`.
3. If your username or repo name differs, find-and-replace `anujchaudhary00.github.io/shopnest-orders` across the repo.

Spec URLs Codebase Pilot should watch:
- `https://anujchaudhary00.github.io/shopnest-orders/payhub/openapi.json`
- `https://anujchaudhary00.github.io/shopnest-orders/courier/openapi.json`

## Run locally

```bash
npm install
cp .env.example .env
npm run dev     # starts PayHub mock (:4001), SwiftCourier mock (:4002) and the order service (:3000)
npm run smoke   # in another terminal: create → confirm → track an order
```

## API

| Method | Path | Calls |
|---|---|---|
| POST | `/orders` | PayHub `POST /payments` |
| POST | `/orders/:id/confirm` | PayHub `POST /payments/{id}/capture`, SwiftCourier `POST /shipments` |
| GET | `/orders/:id/tracking` | SwiftCourier `GET /shipments/{id}/tracking` |
| POST | `/orders/:id/cancel` | PayHub `POST /refunds` |

See [DEMO.md](DEMO.md) for the doc changes to make during the demo.
