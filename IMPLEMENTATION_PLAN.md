<<<<<<< HEAD
# Implementation Plan - Portfolio Features & KYC Enhancement

## Overview
This plan outlines the improvements needed to make the portfolio features functional and the KYC verification process more professional and user-friendly.

## Current State Analysis

### Portfolio Pages (Basic Implementation)
- ✅ `/app/dashboard/portfolio/page.tsx` - Lists holdings, navigation to actions
- ✅ `/app/dashboard/buy/page.tsx` - Basic form to select asset/amount
- ✅ `/app/dashboard/buy/review/page.tsx` - Review order
- ✅ `/app/dashboard/buy/success/page.tsx` - Success confirmation
- ✅ `/app/dashboard/sell/page.tsx` - Basic form to select asset/amount
- ✅ `/app/dashboard/sell/review/page.tsx` - Review order
- ✅ `/app/dashboard/sell/success/page.tsx` - Success confirmation
- ✅ `/app/dashboard/swap/page.tsx` - Basic swap form
- ✅ `/app/dashboard/swap/review/page.tsx` - Swap review
- ✅ `/app/dashboard/swap/success/page.tsx` - Swap confirmation
- ✅ `/app/dashboard/deposit/page.tsx` - Deposit form
- ✅ `/app/dashboard/deposit/review/page.tsx` - Deposit review
- ✅ `/app/dashboard/deposit/success/page.tsx` - Deposit confirmation
- ✅ `/app/dashboard/portfolio/manage/page.tsx` - Portfolio management

### KYC Pages (Needs Enhancement)
- ⚠️ `/app/profile/verify/page.tsx` - Basic KYC form
- ⚠️ `/components/KycUploader.tsx` - Simple uploader
- ✅ Admin KYC review interface exists

## Issues Identified

1. **UI Issues:**
   - Basic button styling without proper hover/active states
   - Simple form layouts without visual hierarchy
   - No proper loading states or animations
   - Inconsistent spacing and padding
   - Missing professional card designs
   - No proper empty states or error handling

2. **KYC Issues:**
   - Single-step upload process
   - No document type selection
   - No progress tracking
   - Missing verification stages
   - No clear status indicators
   - Basic file upload UI

## Implementation Plan

### Phase 1: UI/UX Improvements

#### 1.1 Enhanced Dashboard Header
- Add welcome message with user's name
- Include portfolio summary (total value, 24h change)
- Add notification bell with badge
- Better theming toggle design

#### 1.2 Improved Portfolio Page
- Add portfolio value card with gradient background
- Include sparkline chart visualization
- Add quick action buttons with icons
- Enhance holdings list with better styling
- Add filter/sort options for holdings

#### 1.3 Enhanced Buy/Sell Pages
- Add asset search with autocomplete
- Show real-time price estimates
- Add quick amount buttons (25%, 50%, 75%, 100%)
- Show fee breakdown
- Add price impact warning
- Better form validation with error messages

#### 1.4 Enhanced Swap Page
- Show exchange rate preview
- Add slippage settings
- Show price impact
- Add minimum received amount
- Better asset selection UI

#### 1.5 Enhanced Deposit Page
- Add bank account selector
- Show deposit limits
- Add payment method comparison
- Better IBAN validation
- Add reference number display

### Phase 2: KYC Enhancement

#### 2.1 Multi-Step KYC Flow
1. **Step 1: Personal Information**
   - Full name
   - Date of birth
   - Nationality
   - Address
   
2. **Step 2: Document Selection**
   - ID Card (Passport, Driver's License, National ID)
   - Proof of Address (Utility Bill, Bank Statement)
   - Selfie with ID
   
3. **Step 3: Document Upload**
   - Drag and drop interface
   - Document preview
   - Quality check indicator
   
4. **Step 4: Verification**
   - Submit for review
   - Expected processing time
   - Status tracking

#### 2.2 Enhanced KYC Status Page
- Clear status badge (Pending, In Review, Verified, Rejected)
- Progress bar showing completion
- Document upload history
- Feedback messages for rejected documents

#### 2.3 Admin KYC Review Improvements
- Document preview modal
- Side-by-side comparison
- Rejection reason templates
- Bulk review actions

### Phase 3: New Reference Pages

#### 3.1 Order History Page
- Filter by type (Buy, Sell, Swap, Deposit)
- Date range picker
- Export to CSV
- Detailed transaction view

#### 3.2 Asset Details Page
- Price chart (1H, 1D, 1W, 1M, 1Y)
- Market statistics
- Your holdings
- Quick actions (Buy, Sell, Swap)

#### 3.3 Settings & Preferences
- Notification preferences
- Security settings
- Language selection
- Theme preferences

## File Changes Required

### New Files to Create
1. `app/dashboard/orders/page.tsx` - Order history
2. `app/dashboard/orders/[id]/page.tsx` - Order details
3. `app/dashboard/withdraw/page.tsx` - Withdrawal flow
4. `app/profile/verify/step-1/page.tsx` - KYC Step 1
5. `app/profile/verify/step-2/page.tsx` - KYC Step 2
6. `app/profile/verify/step-3/page.tsx` - KYC Step 3
7. `app/profile/verify/status/page.tsx` - KYC Status tracking

### Files to Update
1. `app/dashboard/portfolio/page.tsx` - Enhanced UI
2. `app/dashboard/buy/page.tsx` - Enhanced form
3. `app/dashboard/sell/page.tsx` - Enhanced form
4. `app/dashboard/swap/page.tsx` - Enhanced swap interface
5. `app/dashboard/deposit/page.tsx` - Enhanced deposit form
6. `app/profile/verify/page.tsx` - Multi-step KYC flow
7. `components/KycUploader.tsx` - Enhanced uploader
8. `app/globals.css` - Additional styles

## Design Guidelines

### Color Palette
- Primary Green: `#0f9d58` / `#103e36`
- Success: `#2cec9a`
- Warning: `#ff9800`
- Error: `#d64545`
- Background Light: `#f4f7f5`
- Background Dark: `#0b1e16`
- Card Light: `rgba(255,255,255,0.9)`
- Card Dark: `rgba(20,40,32,0.9)`

### Typography
- Headlines: `Bitpanda Compressed` font family
- Body: `Inter` font family
- Bold weights for emphasis

### Spacing System
- Base unit: 4px
- Small: 8px / 12px
- Medium: 16px / 24px
- Large: 32px / 40px

### Border Radius
- Small: 8px
- Medium: 16px / 18px
- Large: 22px / 26px
- Full: 9999px (pills/chips)

## Implementation Steps

1. **Create TODO.md** - Track all tasks
2. **Update global styles** - Add new CSS variables and classes
3. **Enhance portfolio page** - Better UI with portfolio card
4. **Improve buy/sell flows** - Add quick amounts, price estimates
5. **Enhance swap page** - Add exchange rate, slippage
6. **Improve deposit page** - Add bank selection, limits
7. **Create KYC multi-step flow** - Step-by-step verification
8. **Add KYC status tracking** - Progress indicators
9. **Create order history page** - Transaction history
10. **Test all flows** - Ensure proper navigation

## Success Criteria
- All portfolio features have professional UI
- KYC flow has clear steps and progress indication
- Consistent design across all pages
- Proper error handling and feedback
- Responsive design on all screen sizes
=======
# Implementation Plan: Add Crypto Logos to Dashboard and Markets

## Overview
Add actual cryptocurrency logos to the portfolio dashboard and markets page instead of colored circles with text.

## Available Logo Files in /public/
- `btc-logo.png`
- `eth-logo.png`
- `bnb-logo.png`
- `sol-logo.png`
- `xrp-logo.png`
- `ada-logo.png`

## Missing Logo Files (need to source/download)
- `doge-logo.png` (Dogecoin)
- `dot-logo.png` (Polkadot)

---

## Tasks

### Task 1: Download Missing Crypto Logos
**File:** Dogecoin and Polkadot logos
**Action:** Download from CoinGecko API or similar source
- Dogecoin: https://assets.coingecko.com/coins/images/5/large/dogecoin.png
- Polkadot: https://assets.coingecko.com/coins/images/12171/large/polkadot.png

### Task 2: Update `hooks/usePriceSimulation.ts`
**Add:**
- `getCoinLogo` function that returns logo path for each symbol
- Update `getCoinColor` to include DOGE and DOT colors

### Task 3: Update `app/dashboard/page.tsx`
**Changes:**
1. Create `cryptoLogos` mapping object
2. Update `currencies` array: replace `iconColor` with `iconSrc`
3. Update `watchlist` array: replace `iconColor` with `iconSrc`
4. Update `topPositions` array: change icon strings to logo paths

### Task 4: Update `app/markets/page.tsx`
**Changes:**
1. Add `iconSrc` to `initialMarketData` objects
2. Update market rows to use `Image` component with logo path
3. Update coin detail modal to show logo

---

## Detailed Changes

### 1. hooks/usePriceSimulation.ts - Add getCoinLogo
```typescript
export function getCoinLogo(symbol: string): string {
  const logos: Record<string, string> = {
    BTC: "/btc-logo.png",
    ETH: "/eth-logo.png",
    BNB: "/bnb-logo.png",
    SOL: "/sol-logo.png",
    XRP: "/xrp-logo.png",
    ADA: "/ada-logo.png",
    DOGE: "/doge-logo.png",
    DOT: "/dot-logo.png",
  };
  return logos[symbol] || "";
}
```

### 2. app/dashboard/page.tsx - Update currencies
```typescript
const currencies = [
  { name: "Bitcoin", symbol: "BTC", price: "66.234,50 €", change: "2,34%", changeValue: "+1.512 €", marketCap: "1,3 B€", iconSrc: "/btc-logo.png", isPositive: true },
  { name: "Ethereum", symbol: "ETH", price: "3.261,80 €", change: "1,87%", changeValue: "+59,80 €", marketCap: "392 B€", iconSrc: "/eth-logo.png", isPositive: true },
  // ... rest with iconSrc
];
```

### 3. app/markets/page.tsx - Update data and rendering
Add `iconSrc` to market data objects and use Image component in JSX.

---

## Files to Modify
1. `/workspaces/broker/hooks/usePriceSimulation.ts`
2. `/workspaces/broker/app/dashboard/page.tsx`
3. `/workspaces/broker/app/markets/page.tsx`

## New Files to Create
1. `/workspaces/broker/public/doge-logo.png`
2. `/workspaces/broker/public/dot-logo.png`

---

## Testing
- Verify all crypto logos display correctly
- Check markets page list and modal
- Verify watchlist and top positions sections
- Ensure logos are properly sized and aligned
>>>>>>> 02bdcb7 (Initial commit)

