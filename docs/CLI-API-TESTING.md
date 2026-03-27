# CLI API Testing (Curl Script)

## Setup

1. Start server: `npm run dev`
2. Edit `test-primevest-api.sh`:
   - Replace `YOUR_SUPABASE_JWT_HERE` with valid user JWT (from browser cookies or Supabase dashboard).
   - `YOUR_ADMIN_JWT_HERE` for admin tests.
3. Make executable: `chmod +x test-primevest-api.sh` (Git Bash/WSL) or run directly in PowerShell.

## Run Tests

```bash
./test-primevest-api.sh
```

Tests 5 endpoints with timing/status. Expected: 200 OK, `{ok: true}`.

## Get JWT Token

1. Visit [http://localhost:3000](http://localhost:3000) → Sign in.
2. DevTools → Application → Cookies → `sb-[project]-auth-token`.
3. Or Supabase Dashboard → Authentication → Users → View JWT.

## Sample Output

```bash
Status: 200
{"ok":true,"summary":{...}}

Status: 201
{"ok":true,"ticket":{...}}
```

Extend script for other endpoints (wallets, orders, swap).

**Ready to test all APIs manually via CLI!**

