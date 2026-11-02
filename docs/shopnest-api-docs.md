# ShopNest Internal API Reference

Documentation for internal services consumed by `shopnest-orders`.

| Service | Current version | Owner |
|---|---|---|
| PayHub Payments API | 1.4.0 | payments-platform-team |
| SwiftCourier Shipping API | 2.1.0 | logistics-team |

---

## 1. PayHub Payments API

**Version:** 1.4.0
**Base URL:** `https://payhub.internal.shopnest.dev/api/v1`
**Auth:** header `X-PayHub-Key: <api key>`

### 1.1 Create payment

`POST /payments`

Request body:

| Field | Type | Required | Description |
|---|---|---|---|
| orderId | string | yes | Caller's order id |
| amount | number | yes | Decimal amount in major units, e.g. `499.99` |
| currency | string | no | `INR` (default) or `USD` |
| customerEmail | string (email) | no | Customer email for receipts |

Response `201 Created`:

```json
{
  "paymentId": "pay_8f2a91c4",
  "orderId": "ORD-1001",
  "amount": 999.98,
  "currency": "INR",
  "status": "authorized",
  "createdAt": "2026-11-02T10:15:00Z"
}
```

`status` values: `pending` | `authorized` | `captured` | `failed`

### 1.2 Get payment

`GET /payments/{paymentId}`

| Param | In | Type | Required |
|---|---|---|---|
| paymentId | path | string | yes |

Response `200 OK`: Payment object (same shape as 1.1).

### 1.3 Capture payment

`POST /payments/{paymentId}/capture`

Captures an authorized payment. No request body.

| Param | In | Type | Required |
|---|---|---|---|
| paymentId | path | string | yes |

Response `200 OK`: Payment object with `"status": "captured"`.

### 1.4 Create refund

`POST /refunds`

Request body:

| Field | Type | Required | Description |
|---|---|---|---|
| paymentId | string | yes | Captured payment to refund |
| amount | number | yes | Decimal amount in major units |
| reason | string | no | Free-text reason |

Response `201 Created`:

```json
{
  "refundId": "ref_1c9e02ab",
  "paymentId": "pay_8f2a91c4",
  "status": "processing"
}
```

`status` values: `processing` | `completed` | `failed`

### 1.5 Errors

| Code | Meaning |
|---|---|
| 400 | Missing or invalid field |
| 401 | Missing or invalid `X-PayHub-Key` |
| 404 | Payment not found |

### PayHub changelog

- **1.4.0** — Added `USD` currency support.
- **1.3.0** — Added `GET /payments/{paymentId}`.

---

## 2. SwiftCourier Shipping API

**Version:** 2.1.0
**Base URL:** `https://courier.internal.shopnest.dev/v2`
**Auth:** header `X-Client-Id: <client id>`

### 2.1 Create shipment

`POST /shipments`

Request body:

| Field | Type | Required | Description |
|---|---|---|---|
| referenceId | string | yes | Caller's order id |
| address.line1 | string | yes | Street address |
| address.city | string | yes | City |
| address.pincode | string | yes | Postal code |
| weightKg | number | no | Total parcel weight in kg |

Response `201 Created`:

```json
{
  "shipmentId": "shp_47d0e2f1",
  "awb": "SC1793613791101",
  "eta": "2026-11-05"
}
```

### 2.2 Get tracking

`GET /shipments/{shipmentId}/tracking`

| Param | In | Type | Required |
|---|---|---|---|
| shipmentId | path | string | yes |

Response `200 OK`:

```json
{
  "shipmentId": "shp_47d0e2f1",
  "status": "in_transit",
  "events": [
    { "at": "2026-11-02T11:00:00Z", "location": "Delhi Hub", "note": "Picked up" }
  ]
}
```

`status` values: `created` | `in_transit` | `out_for_delivery` | `delivered` | `returned`

### 2.3 Errors

| Code | Meaning |
|---|---|
| 400 | Missing `referenceId` or `address.pincode` |
| 401 | Missing or invalid `X-Client-Id` |
| 404 | Shipment not found |

### SwiftCourier changelog

- **2.1.0** — Added `returned` tracking status.
- **2.0.0** — Moved to `/v2`; `orderId` renamed to `referenceId`.
