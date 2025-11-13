# PowerShell script to test profile image upload
# Usage: .\test-profile-upload.ps1 -ImagePath "path\to\image.jpg"

param(
    [Parameter(Mandatory=$false)]
    [string]$ImagePath = "",
    [string]$BaseUrl = "http://localhost:8082/api/v1"
)

Write-Host "=== SkillSync Profile Image Upload Test ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create a test profile
Write-Host "Step 1: Creating test profile..." -ForegroundColor Yellow
$userId = [guid]::NewGuid().ToString()
$createProfileBody = @{
    userId = $userId
    displayName = "Test User $(Get-Date -Format 'HHmmss')"
    bio = "Testing profile image upload"
    visibility = "PUBLIC"
} | ConvertTo-Json

try {
    $profileResponse = Invoke-RestMethod -Uri "$BaseUrl/users" `
        -Method Post `
        -ContentType "application/json" `
        -Body $createProfileBody
    
    $profileId = $profileResponse.id
    Write-Host "✓ Profile created successfully!" -ForegroundColor Green
    Write-Host "  Profile ID: $profileId" -ForegroundColor Gray
    Write-Host "  User ID: $userId" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed to create profile: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Upload image (if provided)
if ($ImagePath -and (Test-Path $ImagePath)) {
    Write-Host "Step 2: Uploading image..." -ForegroundColor Yellow
    
    try {
        $boundary = [System.Guid]::NewGuid().ToString()
        $fileBytes = [System.IO.File]::ReadAllBytes($ImagePath)
        $fileName = [System.IO.Path]::GetFileName($ImagePath)
        
        $bodyLines = @(
            "--$boundary",
            "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"",
            "Content-Type: application/octet-stream",
            "",
            [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($fileBytes),
            "--$boundary--"
        ) -join "`r`n"
        
        $imageUrl = Invoke-RestMethod -Uri "$BaseUrl/users/$profileId/avatar" `
            -Method Post `
            -ContentType "multipart/form-data; boundary=$boundary" `
            -Body $bodyLines
        
        Write-Host "✓ Image uploaded successfully!" -ForegroundColor Green
        Write-Host "  Image URL: $imageUrl" -ForegroundColor Gray
        Write-Host ""
    } catch {
        Write-Host "✗ Failed to upload image: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "  You can still test by updating the profile with a URL manually" -ForegroundColor Yellow
    }
} else {
    Write-Host "Step 2: Skipping image upload (no image path provided)" -ForegroundColor Yellow
    Write-Host "  To upload an image, run: .\test-profile-upload.ps1 -ImagePath 'path\to\image.jpg'" -ForegroundColor Gray
    Write-Host ""
}

# Step 3: Retrieve and display profile
Write-Host "Step 3: Retrieving profile..." -ForegroundColor Yellow
try {
    $profile = Invoke-RestMethod -Uri "$BaseUrl/users/$profileId" -Method Get
    
    Write-Host "✓ Profile retrieved successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Profile Details:" -ForegroundColor Cyan
    Write-Host "  Display Name: $($profile.displayName)" -ForegroundColor Gray
    Write-Host "  Bio: $($profile.bio)" -ForegroundColor Gray
    Write-Host "  Visibility: $($profile.visibility)" -ForegroundColor Gray
    Write-Host "  Profile Image: $($profile.profileImageUrl)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed to retrieve profile: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open frontend: http://localhost:3000/profile/$userId" -ForegroundColor Gray
Write-Host "2. View in Supabase: https://supabase.com/dashboard/project/ymihlmgnwmmbjlyaxzii/storage/buckets/profile-images" -ForegroundColor Gray
Write-Host "3. Test search: $BaseUrl/users/search" -ForegroundColor Gray
Write-Host ""
Write-Host "Profile ID: $profileId" -ForegroundColor Cyan
Write-Host "User ID: $userId" -ForegroundColor Cyan
