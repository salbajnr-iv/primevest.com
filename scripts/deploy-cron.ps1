# Deploy Cron Job to Supabase
$sqlFile = "c:\Users\DELL 7480\SALBA-JNR\htdocs\primevest.com\sql\setup-market-price-cron.sql"
$sqlContent = Get-Content $sqlFile -Raw

Write-Host "Deploying cron jobs to Supabase..."
Write-Host "Project: xhyivvvbrcmbjvzmvlod"
Write-Host ""

# Use psql via connection string
$envContent = Get-Content ".env" -Raw
$dbUrl = ($envContent | Select-String "DATABASE_URL=(.*)" | ForEach-Object { $_.Matches.Groups[1].Value }).Trim()

if ([string]::IsNullOrEmpty($dbUrl)) {
    Write-Host "Error: DATABASE_URL not found in .env file" -ForegroundColor Red
    exit 1
}

Write-Host "Executing SQL..." -ForegroundColor Green

# Execute using psql (PostgreSQL CLI)
$psi = New-Object System.Diagnostics.ProcessStartInfo 
$psi.FileName = "psql"
$psi.RedirectStandardInput = $true
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.UseShellExecute = $false
$psi.ArgumentList.Add($dbUrl)

$process = New-Object System.Diagnostics.Process
$process.StartInfo = $psi
$process.Start() | Out-Null

$process.StandardInput.WriteLine($sqlContent)
$process.StandardInput.Close()

$output = $process.StandardOutput.ReadToEnd()
$errorOutput = $process.StandardError.ReadToEnd()

$process.WaitForExit()

Write-Host ""
Write-Host "=== Output ===" -ForegroundColor Cyan
Write-Host $output

if ($errorOutput -and $errorOutput -notmatch "^WARNING:" -and $errorOutput -notmatch "^NOTICE:") {
    Write-Host ""
    Write-Host "=== Errors/Warnings ===" -ForegroundColor Yellow
    Write-Host $errorOutput
}

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Check your Supabase Dashboard: https://supabase.com/dashboard/project/xhyivvvbrcmbjvzmvlod/database/cron"
Write-Host "2. Run this query to verify:"
Write-Host "   SELECT * FROM market_ingest_job_history;"
Write-Host ""
