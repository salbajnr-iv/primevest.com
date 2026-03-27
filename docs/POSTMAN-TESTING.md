# Postman API Testing Setup for Primevest

## 1. Start the Development Server

Execute in terminal:

```bash
npm run dev
```

Server runs at [http://localhost:3000](http://localhost:3000). APIs at `/api/*`.

## 2. Install Postman (if not installed)

1. Download from [https://www.postman.com/downloads/](https://www.postman.com/downloads/)
2. Install and launch.

## 3. Import Collection

1. File → Import → Select `primevest-api.postman_collection.json`
2. Collection ready with 5 key endpoints.

## 4. Configure Environment Variables

In Postman:

1. Environments → Add → Name: "Primevest Local"
2. Variables:

| Key         | Value                          |
|-------------|--------------------------------|
| `base_url`  | `http://localhost:3000`        |
| `auth_token`| `Bearer eyJ...` (get JWT below)|

## 5. Get Auth Token (Supabase JWT)

1. Sign up/login via app at [http://localhost:3000/signin](http://localhost:3000/signin).
2. Browser DevTools → Application → Cookies → Copy `sb-[project]-auth-token`.
3. Decode at [https://jwt.io](https://jwt.io).
4. Or create test user in Supabase dashboard.

## 6. Test Endpoints

Select "Primevest Local" environment, run requests:

- **Dashboard Summary GET**: Requires user auth
- **KYC Submit POST**: Test doc submission  
- **Admin Delete POST**: Admin-only
- **Support Tickets GET/POST**: Paginated list/create

**Expected responses:**
- Success: `{ok: true, data: {...}}`  
- Errors: `{ok: false, code: '...', error: '...'}`
- 401 Unauthorized: Bad/missing token

## Additional Endpoints to Add

```bash
POST /api/wallets/withdraw
GET /api/orders/history  
POST /api/swap/quote
```

Duplicate requests and update paths.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Server not running | `npm run dev` |
| Auth fails | Verify JWT valid/not expired |
| DB errors | Run Supabase migrations |
| No Postman | `curl -H "Authorization: {{auth_token}}" http://localhost:3000/api/dashboard/summary` |

**Collection validates JSON responses. Ready for import!**

