# Script to add username to existing profile in Docker PostgreSQL
param(
    [Parameter(Mandatory=$true)]
    [string]$UserId,
    
    [Parameter(Mandatory=$true)]
    [string]$Username
)

Write-Host "Adding username '$Username' to profile for user '$UserId'" -ForegroundColor Green

# Execute SQL in Docker container
$sql = @"
UPDATE user_profiles 
SET username = '$Username', updated_at = CURRENT_TIMESTAMP
WHERE user_id = '$UserId';

SELECT id, user_id, username, display_name FROM user_profiles WHERE user_id = '$UserId';
"@

try {
    Write-Host "Executing SQL in Docker container..." -ForegroundColor Cyan
    docker exec -i skillsync-postgres psql -U skillsync -d skillsync -c "$sql"
    Write-Host "✓ Username added successfully!" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nUsage: .\add-username-docker.ps1 -UserId 'your-user-id' -Username 'your_username'" -ForegroundColor Yellow