# PowerShell script to start auth-service with environment variables from .env file

Write-Host "Loading environment variables from .env file..." -ForegroundColor Green

# Check if .env file exists
if (Test-Path ".env") {
    # Read .env file and set environment variables
    Get-Content .env | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
            Write-Host "Set $name" -ForegroundColor Cyan
        }
    }
    Write-Host "Environment variables loaded successfully!" -ForegroundColor Green
} else {
    Write-Host "Warning: .env file not found!" -ForegroundColor Yellow
}

Write-Host "`nStarting auth-service..." -ForegroundColor Green
mvn spring-boot:run
