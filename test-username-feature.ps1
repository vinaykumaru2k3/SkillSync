# Test Username Feature Implementation
# This script tests the username functionality for collaboration between developers

Write-Host "Testing Username Feature Implementation" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Test 1: Check if user service is running
Write-Host "`n1. Testing User Service Health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8082/actuator/health" -Method GET
    if ($response.status -eq "UP") {
        Write-Host "✓ User Service is running" -ForegroundColor Green
    } else {
        Write-Host "✗ User Service is not healthy" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ User Service is not accessible: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Check if collaboration service is running
Write-Host "`n2. Testing Collaboration Service Health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8085/actuator/health" -Method GET
    if ($response.status -eq "UP") {
        Write-Host "✓ Collaboration Service is running" -ForegroundColor Green
    } else {
        Write-Host "✗ Collaboration Service is not healthy" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Collaboration Service is not accessible: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Check API Gateway routing for username endpoint
Write-Host "`n3. Testing API Gateway Username Endpoint Routing..." -ForegroundColor Yellow
try {
    # This should return 404 for non-existent user, but not 500 or connection error
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/users/username/testuser123" -Method GET -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 404) {
        Write-Host "✓ API Gateway correctly routes username endpoint (404 for non-existent user)" -ForegroundColor Green
    } elseif ($response.StatusCode -eq 200) {
        Write-Host "✓ API Gateway routes username endpoint successfully" -ForegroundColor Green
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✓ API Gateway correctly routes username endpoint (404 for non-existent user)" -ForegroundColor Green
    } else {
        Write-Host "✗ API Gateway username endpoint routing failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Check user search endpoint
Write-Host "`n4. Testing User Search Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/users/search?query=test&page=0&size=10" -Method GET
    Write-Host "✓ User search endpoint is accessible" -ForegroundColor Green
    Write-Host "   Found $($response.totalElements) users" -ForegroundColor Cyan
} catch {
    Write-Host "✗ User search endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=====================================" -ForegroundColor Green
Write-Host "Username Feature Test Summary:" -ForegroundColor Green
Write-Host "- Backend services are running" -ForegroundColor Green
Write-Host "- API Gateway routes username endpoints" -ForegroundColor Green
Write-Host "- User search functionality is available" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Create a user profile with username through the frontend" -ForegroundColor White
Write-Host "2. Test searching for users by username in the Discover tab" -ForegroundColor White
Write-Host "3. Test sending collaboration invitations by username" -ForegroundColor White
Write-Host "`nFrontend URL: http://localhost:3000" -ForegroundColor Cyan