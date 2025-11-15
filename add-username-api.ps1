# Add username via API
$userId = "5c845ec6-90d7-4429-a0fa-cf06ea01b4de"
$username = "vinay_dev"

try {
    # Get profile
    $profile = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/users/user/$userId" -Method GET
    $profileId = $profile.id
    
    # Update with username
    $updateData = @{ username = $username } | ConvertTo-Json
    $headers = @{ 'Content-Type' = 'application/json'; 'X-User-Id' = $userId }
    
    $result = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/users/$profileId" -Method PUT -Body $updateData -Headers $headers
    
    Write-Host "✓ Username '$username' added successfully!" -ForegroundColor Green
    Write-Host "Profile: $($result.displayName) (@$($result.username))" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}