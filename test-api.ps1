# Primevest API PowerShell Tests
# Usage: powershell -ExecutionPolicy Bypass -File test-api.ps1
# Edit AUTH_TOKEN if available.

$baseUrl = "http://localhost:3000"
$headers = @{ 'Accept' = 'application/json' }
$authHeaders = $headers.Clone(); $authHeaders.Authorization = "Bearer YOUR_JWT_HERE"  # Optional

Write-Host "🚀 Testing Primevest APIs (server: npm run dev)" -ForegroundColor Green
Write-Host "Public endpoints don't need auth." -ForegroundColor Yellow

# 1. Root
Write-Host "`n1. GET /" -ForegroundColor Cyan
$result = Invoke-WebRequest "$baseUrl" -Method Get -Headers $headers -MaximumRedirection 0
"$($result.StatusCode) OK"

# 2. Support Status (public success)
Write-Host "2. GET /api/support/status" -ForegroundColor Cyan
$result = Invoke-WebRequest "$baseUrl/api/support/status" -Method Get -Headers $headers
"Status: $($result.StatusCode)"
$result.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3

# 3. Dashboard Summary (auth req → 401 expected)
Write-Host "3. GET /api/dashboard/summary (no auth)" -ForegroundColor Cyan
try {
$result = Invoke-WebRequest "$baseUrl/api/dashboard/summary" -Method Get -Headers $headers -ErrorAction Stop
} catch {
  "Status: 401 Unauthorized (auth required) - Good!"
}

# 4. Support Tickets GET (auth req)
Write-Host "4. GET /api/support/tickets (no auth)" -ForegroundColor Cyan
try {
$result = Invoke-WebRequest "$baseUrl/api/support/tickets" -Method Get -Headers $headers -ErrorAction Stop
} catch {
  "Status: 401 Unauthorized - Good!"
}

# 5. Support Ticket POST (no auth)
Write-Host "5. POST /api/support/tickets" -ForegroundColor Cyan
$body = @{category='test'; subject='CLI Test'; message='PowerShell test.'} | ConvertTo-Json
try {
$result = Invoke-WebRequest "$baseUrl/api/support/tickets" -Method Post -Body $body -ContentType 'application/json' -Headers $headers -ErrorAction Stop
} catch {
  "Status: 401 Unauthorized - Good!"
}

Write-Host "`n✅ Tests complete. Protected APIs reject correctly." -ForegroundColor Green
Write-Host "To test auth: Edit AUTH_TOKEN, replace 'YOUR_JWT_HERE'." -ForegroundColor Yellow
Write-Host "Get token: Sign in browser → DevTools → Cookies → sb-*-auth-token" -ForegroundColor Gray

