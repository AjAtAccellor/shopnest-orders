# Demo script — API doc changes for Codebase Pilot to catch

Make the change in **both** `docs/<service>/openapi.json` and `docs/<service>/index.html`, bump the version, add a changelog line, and push. GitHub Pages republishes in about a minute.

Start with Change 1 — it's the clearest story. The others are backups or a second round.

---

## Change 1 — PayHub v1.5.0: `amount` → `amountMinor` (BREAKING)

**Doc edit**
- `CreatePaymentRequest` and `RefundRequest`: rename `amount` (number, major units) to `amountMinor` (integer, paise/cents — `499.99` becomes `49999`).
- `info.version` → `1.5.0`; changelog: *"BREAKING: `amount` replaced by integer `amountMinor`."*

**What Codebase Pilot should report**
- Impacted: `src/services/payhubClient.js` → `createPayment()` and `refundPayment()` send `amount`.
- Impacted: `src/routes/orders.js` → `POST /orders` passes `total` (a decimal) and `POST /orders/:id/cancel` passes `order.total`.
- Suggested fix: send `amountMinor: Math.round(total * 100)`.

## Change 2 — SwiftCourier v2.2.0: new required `address.state` (BREAKING)

**Doc edit**
- `Address.required` → add `"state"`; add `state` property (string).
- `info.version` → `2.2.0`; changelog: *"`address.state` is now required."*

**What Codebase Pilot should report**
- Impacted: `src/services/courierClient.js` → `createShipment()` builds `address` without `state`.
- Upstream impact: `POST /orders` request body has no `state`, so it must be collected from callers too.

## Change 3 — PayHub v1.5.0: capture endpoint deprecated (NON-BREAKING)

**Doc edit**
- `POST /payments/{paymentId}/capture` → add `"deprecated": true`, note *"Use `PATCH /payments/{paymentId}` with `{ \"action\": \"capture\" }`. Removal in v2."*
- Add the new `PATCH /payments/{paymentId}` path.

**What Codebase Pilot should report**
- Warning (not error): `capturePayment()` in `payhubClient.js` uses a deprecated endpoint; caller `POST /orders/:id/confirm`.

## Change 4 — SwiftCourier v2.3.0: new tracking status (INFORMATIONAL)

**Doc edit**
- Add `"lost"` to `Tracking.status` enum.

**What Codebase Pilot should report**
- Low severity: no code branches on tracking status today, so no breakage — but `GET /orders/:id/tracking` will now pass `lost` through to clients.

## Change 5 — Unrelated endpoint added (NO IMPACT, control case)

**Doc edit**
- PayHub: add `GET /payouts` (not used by this repo).

**What Codebase Pilot should report**
- Doc changed, **no impact** on this repo. Good for showing it doesn't cry wolf.

---

### Reset after the demo
```bash
git revert <doc-change-commit>   # or: git checkout <tag> -- docs/
```
Tip: tag the baseline before the demo with `git tag docs-baseline && git push --tags`.
