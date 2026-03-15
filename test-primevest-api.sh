#!/bin/bash
# Primevest API CLI Tests
# Edit BASE_URL, AUTH_TOKEN below.
# Run: chmod +x test-primevest-api.sh && ./test-primevest-api.sh

set -e  # Exit on error

BASE_URL="http://localhost:3000"
AUTH_TOKEN="Bearer YOUR_SUPABASE_JWT_HERE"  # Replace with valid token
ADMIN_TOKEN="Bearer YOUR_ADMIN_JWT_HERE"    # For admin endpoints

echo "🚀 Testing Primevest APIs at $BASE_URL"
echo "Ensure 'npm run dev' running and Supabase connected."
echo "----------------------------------------"

# 1. Dashboard Summary (user auth)
echo "1. GET /api/dashboard/summary"
curl -s -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n" \
  -H "Authorization: $AUTH_TOKEN" \
  "$BASE_URL/api/dashboard/summary"

# 2. KYC Submit (POST)
echo "2. POST /api/kyc/submit"
KYC_BODY='{
  "documents": [
    {
      "doc_type": "passport",
      "storage_path": "test/path",
      "file_name": "test.jpg",
      "mime_type": "image/jpeg",
      "size": 12345,
      "meta": {}
    }
  ],
  "metadata": {"country": "US"}
}'
curl -s -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n" \
  -X POST \
  -H "Authorization: $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$KYC_BODY" \
  "$BASE_URL/api/kyc/submit"

# 3. Admin Delete User (admin auth)
echo "3. POST /api/admin/users/delete"
DELETE_BODY='{"user_id": "test-user-uuid"}'
curl -s -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n" \
  -X POST \
  -H "Authorization: $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$DELETE_BODY" \
  "$BASE_URL/api/admin/users/delete"

# 4. Support Tickets GET
echo "4. GET /api/support/tickets"
curl -s -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n" \
  -H "Authorization: $AUTH_TOKEN" \
  "$BASE_URL/api/support/tickets?status=open&page=1"

# 5. Support Ticket Create POST
echo "5. POST /api/support/tickets"
TICKET_BODY='{
  "category": "general",
  "subject": "CLI Test Ticket",
  "message": "Automated test via curl."
}'
curl -s -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n" \
  -X POST \
  -H "Authorization: $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$TICKET_BODY" \
  "$BASE_URL/api/support/tickets"

echo "✅ All tests complete. Check responses for {ok: true}."
echo "More endpoints: /api/wallets/withdraw, /api/orders/history, /api/swap/quote"

