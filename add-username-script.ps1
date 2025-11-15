# PowerShell script to add username to existing profile via API
# This script will update your profile with a username

param(
    [Parameter(Mandatory=$true)]
    [string]$UserId,
    
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [string]$ApiUrl = "http://localhost:8080"
)

Write-Host "Adding username '$Username' to profile for user '$UserId'" -ForegroundColor Green

try {
    # First get the current profile
    $getResponse = Invoke-RestMethod -Uri "$ApiUrl/api/v1/users/user/$UserId" -Method GET
    $profileId = $getResponse.id
    
    Write-Host "Found profile ID: $profileId" -ForegroundColor Cyan
    
    # Update the profile with username
    $updateData = @{
        username = $Username
    }
    
    $headers = @{
        'Content-Type' = 'application/json'
        'X-User-Id' = $UserId
    }
    
    $response = Invoke-RestMethod -Uri "$ApiUrl/api/v1/users/$profileId" -Method PUT -Body ($updateData | ConvertTo-Json) -Headers $headers
    
    Write-Host "✓ Successfully added username '$Username' to your profile!" -ForegroundColor Green
    Write-Host "Profile updated:" -ForegroundColor Cyan
    Write-Host "  Display Name: $($response.displayName)" -ForegroundColor White
    Write-Host "  Username: @$($response.username)" -ForegroundColor White
    Write-Host "  Location: $($response.location)" -ForegroundColor White
    
} catch {
    Write-Host "✗ Error updating profile: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "The username '$Username' is already taken. Please try a different username." -ForegroundColor Yellow
    }
}

Write-Host "`nUsage example:" -ForegroundColor Yellow
Write-Host ".\add-username-script.ps1 -UserId 'your-user-id-here' -Username 'your_username'" -ForegroundColor White