# Compact UI Spec

This spec standardizes card-heavy pages (`/notifications`, `/settings`, `/tools`, `/support`) with shared spacing and action hierarchy.

## 1) Card shell
- **Container radius:** `rounded-xl`
- **Border:** `border border-gray-200`
- **Background:** `bg-white`
- **Default shadow:** `shadow-sm`
- **Hover shadow:** `hover:shadow-md`
- **Padding:**
  - Mobile: `p-4`
  - Desktop (`sm+`): `p-5`

## 2) Title scale and copy rhythm
- **Section title:** `text-2xl sm:text-3xl font-semibold`
- **Card title:** `text-base sm:text-lg font-semibold`
- **Body copy:** `text-sm text-gray-600`
- **Eyebrow/meta label:** `text-xs uppercase tracking-wide text-gray-500`

## 3) Icon containers
- Use shared icon badges for visual consistency.
- **Default badge size:** `h-10 w-10`
- **Large badge size:** `h-12 w-12`
- **Radius:** `rounded-lg`
- **Background default:** `bg-gray-100`
- Accent variants may use semantic background/text pairs (e.g., emerald/blue/amber).

## 4) Primary/secondary action usage
- Cards with 2 actions should place:
  - **Secondary action on the left** (`outline` or `ghost`)
  - **Primary CTA on the right** (`default`)
- Action row spacing:
  - `gap-2` mobile
  - `gap-3` desktop

## 5) Spacing tokens
- Vertical stack inside cards: `space-y-3` (or `space-y-4` for dense detail cards)
- Gap between icon and text in card headers: `gap-3`
- Grid gaps:
  - Card grids: `gap-4`
  - Dense lists: `gap-3`
