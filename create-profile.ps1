# Create User Profile Script
$token = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJST0xFX1VTRVIiXSwidXNlcklkIjoiNWM4NDVlYzYtOTBkNy00NDI5LWEwZmEtY2YwNmVhMDFiNGRlIiwiZW1haWwiOiJ2azUwMjI3MDJAZ21haWwuY29tIiwic3ViIjoidms1MDIyNzAyQGdtYWlsLmNvbSIsImlhdCI6MTc2MzcxOTI4MywiZXhwIjoxNzYzODA1NjgzfQ.makgcIwRaVduIcf4o0cfva--9Nuwgm6wDncd-vQ1IVA"
$userId = "5c845ec6-90d7-4429-a0fa-cf06ea01b4de"

$body = @{
    userId = $userId
    username = "vk5022702"
    displayName = "Vinay Kumar"
    visibility = "PUBLIC"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

Write-Host "Creating user profile..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8082/api/v1/users/profiles" -Method Post -Body $body -Headers $headers
    Write-Host "Profile created successfully!" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}
