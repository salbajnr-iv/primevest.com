# Dashboard Data Contract

This document defines the current analytics dashboard data contract implemented by:

- `app/dashboard/page.tsx` (server-side data bootstrap)
- `lib/dashboard/queries.ts` (Supabase queries + mapping)
- `app/dashboard/DashboardClient.tsx` (component wiring)
- `components/dashboard/analytics/*` (widget rendering)

## 1) Section-to-data mapping

| Dashboard section | Primary component(s) | Source table/view/materialized view | Required fields | Refresh cadence |
| --- | --- | --- | --- | --- |
| Header summary (user + portfolio + notification badge) | `DashboardShell` header props from `DashboardClient` | `public.profiles`, `public.notifications` | `profiles.full_name`, `profiles.account_balance`, `notifications.id` (count only) | `on-load` |
| KPI cards | `KpiGauge` (x3) | `public.orders` | `orders.id`, `orders.status`, `orders.order_type`, `orders.total_amount` | `on-load` |
| Market Trends bar chart | `MetricsBarChart` | `public.orders` | `orders.created_at`, `orders.id` | `on-load` |
| Performance chart (7D/1M/3M toggle) | `PerformanceLineChart` | `public.orders` | `orders.created_at`, `orders.total_amount` | `on-load` |
| News ticker / insights strip | inline news text section | Fallback static dataset (`fallbackDashboardData.marketNews`) | `marketNews[].id`, `marketNews[].text` | `interval` (currently static fallback; can be replaced by scheduled feed) |
| Top Markets table | `DataTable` | `public.orders` | `orders.symbol`, `orders.total_amount`, `orders.status` | `on-load` |
| User Activity Feed (initial list) | activity list in `DashboardClient` | `public.orders` | `orders.id`, `orders.order_type`, `orders.status`, `orders.symbol`, `orders.total_amount`, `orders.price`, `orders.created_at` | `on-load` |
| User Activity Feed (live prepend) | activity list in `DashboardClient` realtime channel | `public.orders` realtime (`postgres_changes` INSERT subscription) | `orders.id`, `orders.total_amount` | `realtime` |

## 2) Widget input contracts and null/empty behavior

### `KpiGauge`

**Input shape**

```ts
{
  label: string;
  value: number;
  target?: number;      // default: 100
  valueLabel: string;
  deltaLabel?: string;
}
```

**Behavior rules**

- `percent = clamp((value / target) * 100, 0, 100)`.
- If `deltaLabel` is missing/falsy, the delta line is not rendered.
- No internal fallback for missing `label`/`valueLabel`; caller is responsible.

---

### `MetricsBarChart`

**Input shape**

```ts
{
  title: string;
  data: Array<{
    label: string;
    value: number;
  }>;
}
```

**Behavior rules**

- `data` is normalized before rendering (`label` required, non-finite `value` coerced to `0`).
- Empty array renders `emptyStateLabel` (default: `"No metrics available yet."`).
- Active metric caption appears only when a bar is hovered/focused.

---

### `PerformanceLineChart`

**Input shape**

```ts
{
  title: string;
  data: Array<{
    label: string;
    value: number;
  }>;
}
```

**Behavior rules**

- `data` is normalized before rendering (`label` required, non-finite `value` coerced to `0`).
- Empty array renders `emptyStateLabel` (default: `"No performance data available yet."`).
- Focus detail text (`{active.label}: {active.value}`) is shown only after dot focus.
- Dot focus handler coerces undefined value via `Number(value ?? 0)`.

---

### `DataTable<T extends Record<string, unknown>>`

**Input shape**

```ts
{
  title: string;
  columns: Array<{
    key: keyof T;
    label: string;
    render?: (value: T[keyof T], row: T) => ReactNode;
  }>;
  rows: T[];
}
```

**Behavior rules**

- Empty `rows` renders a single-body-row empty state with `emptyStateLabel` (default: `"No rows to display."`).
- Default cell rendering uses `String(value)`:
  - `null` -> `"null"`
  - `undefined` -> `"undefined"`
  - `""` remains empty text
- Optional `render` allows caller-level null formatting overrides.

## 3) Data ownership note (query -> component)

All dashboard data is owned by `getDashboardData` in `lib/dashboard/queries.ts`, except realtime activity inserts.

| Query / mapper in `lib/dashboard/queries.ts` | Output field | Owning UI component |
| --- | --- | --- |
| `profiles` + `notifications` query + `mapProfileToSummary` | `portfolioSummary` | `DashboardShell` header (via `DashboardClient`) |
| `orders` query + `mapOrdersToKpis` | `kpis` | `KpiGauge` cards |
| `orders` query + `mapOrdersToVolumeData` | `volumeData` | `MetricsBarChart` |
| `orders` query + `mapOrdersToPerformance` | `performanceSeries` | `PerformanceLineChart` |
| `orders` query + `mapOrdersToTopPairs` | `topPairs` | `DataTable` (Top Markets) |
| `orders` query + `mapOrdersToActivityFeed` | `activityFeed` (initial) | User Activity Feed list |
| fallback dataset assignment | `marketNews` | News & Insights strip |
| `supabase.channel(...postgres_changes on orders INSERT...)` in `DashboardClient` | live prepend activity entry | User Activity Feed list (realtime) |

## 4) Notes and assumptions

- No materialized views are currently used by dashboard analytics; data comes directly from base tables + static fallback data.
- `interval` cadence is documented for the news strip to clarify intended future behavior, even though it is currently static fallback data.
