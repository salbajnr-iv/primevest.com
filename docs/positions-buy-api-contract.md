# Positions + Buy Market Impact API Contract

This document defines frontend-facing contracts for:

- `GET /api/positions`
- `POST /api/buy/market-impact`

## 1) `GET /api/positions`

Returns the authenticated user's holdings/positions, with server-side search and sorting.

### Query params

| Param | Type | Allowed | Default | Notes |
| --- | --- | --- | --- | --- |
| `q` | `string` | any non-empty string | `""` | Matches symbol/name/legacy `positions.asset` with case-insensitive partial search. |
| `sort` | `string` | `allocation`, `value`, `pnl` | `allocation` | Invalid value is ignored and replaced by default. |
| `direction` | `string` | `asc`, `desc` | `desc` | Invalid value is ignored and replaced by default. |
| `page` | `number` | integer >= 1 | `1` | Invalid/non-positive value falls back to default. |
| `pageSize` | `number` | integer 1..100 | `25` | Invalid value falls back to default, values over 100 are clamped. |

### Request headers

- `Authorization: Bearer <supabase_access_token>` (required)

### Success response (`200`)

```json
{
  "ok": true,
  "data": {
    "positions": [
      {
        "id": "uuid",
        "symbol": "BTC",
        "name": "Bitcoin",
        "quantity": 0.45000000,
        "value": 18342.12,
        "pnl": 842.11,
        "avgCost": 39100.33,
        "updatedAt": "2026-10-10T08:12:15.000Z",
        "allocationPct": 42.1111
      }
    ]
  },
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "total": 14,
    "totalPages": 1
  },
  "query": {
    "q": "btc",
    "sort": "allocation",
    "direction": "desc"
  }
}
```

### Error responses

- `401` missing or invalid auth token.
- `500` Supabase query failure.
- `503` API backend config unavailable.

---

## 2) `POST /api/buy/market-impact`

Estimates market impact for a buy quote and returns classification for warning/confirmation/block UI states.

### Request body

```json
{
  "symbol": "BTC",
  "amountEur": 1000,
  "liquidityEur": 8500000
}
```

### Validation + safe defaults

- `amountEur` invalid/non-positive -> coerced to `0`.
- `liquidityEur` invalid/non-positive -> coerced to `1_000_000`.
- `symbol` is normalized to uppercase string.

### Success response (`200`)

```json
{
  "ok": true,
  "data": {
    "symbol": "BTC",
    "amountEur": 1000,
    "liquidityEur": 8500000,
    "impactPct": 1.08,
    "severity": "warn",
    "classification": "warn",
    "threshold": {
      "warnPct": 1,
      "confirmationRequiredPct": 3,
      "blockPct": 8
    },
    "requiresConfirmation": false,
    "blocked": false
  }
}
```

### Classification semantics

| Classification | Condition | UI behavior |
| --- | --- | --- |
| `normal` | `impactPct < 1` | No warning treatment required. |
| `warn` | `impactPct >= 1 && < 3` | Show mild warning state. |
| `confirm_required` | `impactPct >= 3 && < 8` | Require user confirmation checkbox. |
| `blocked` | `impactPct >= 8` | Prevent buy submission. |

### Error responses

- `400` request body is not a JSON object.
- `500` unexpected server failure.

---

## Notes

- The endpoint attempts to use DB RPC `public.estimate_buy_market_impact(...)` and falls back to app-level calculation if RPC is unavailable.
- Thresholds are intentionally mirrored across RPC and app logic: warn at `1%`, confirmation/high at `3%`, blocked at `8%`.
