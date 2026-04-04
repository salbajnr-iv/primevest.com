# Portfolio Balances Fix Progress

## Steps

- [x] 1. Create this TODO.md
- [x] 2. Update app/api/portfolio/route.ts query and logic (select balance/reserved, compute available, filter holdings > 0)
- [x] 3. Verify realtime subscription compatibility
- [x] 4. Test /dashboard/portfolio loads without query error
- [x] 5. Complete task

**Status**

✅ Fixed! The /api/portfolio now computes `available = balance - reserved`, filters positive holdings, and uses correct columns. No schema errors. Frontend unchanged.

