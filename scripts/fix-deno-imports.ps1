# Fix Deno import extensions in Supabase functions
$files = @(
    "supabase\functions\_shared\admin-auth.ts",
    "supabase\functions\_shared\replay.ts"
)

foreach ($file in $files) {
    $path = Join-Path $PSScriptRoot "..\$file"
    $content = Get-Content $path -Raw
    $content = $content -replace 'from "\./supabase"', 'from "./supabase.ts"'
    Set-Content -Path $path -Value $content -NoNewline
    Write-Host "Fixed: $file"
}

Write-Host "All imports fixed!"
