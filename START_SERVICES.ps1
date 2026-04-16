# PriceNestAI Multi-Service Startup Script for Windows PowerShell
# This script starts ML API, Backend, and Frontend in separate PowerShell windows

$ProjectRoot = "d:\PriceNest AI"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  PriceNestAI Startup Helper" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
$nodeInstalled = $null -ne (Get-Command node -ErrorAction SilentlyContinue)
if (-not $nodeInstalled) {
    Write-Host "[ERROR] Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Python is installed
$pythonInstalled = $null -ne (Get-Command python -ErrorAction SilentlyContinue)
if (-not $pythonInstalled) {
    Write-Host "[ERROR] Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python from https://www.python.org" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[OK] Node.js installed: " -ForegroundColor Green -NoNewline
node --version

Write-Host "[OK] Python installed: " -ForegroundColor Green -NoNewline
python --version

Write-Host ""
Write-Host "Starting all services..." -ForegroundColor Yellow
Write-Host ""

# Start ML API
Write-Host "[1/3] Starting ML Service (Flask) on port 5001..." -ForegroundColor Cyan
$mlCommand = @"
Set-Location '$ProjectRoot\ml-api'
`$env:Path | Out-Null
& venv\Scripts\Activate.ps1
python app.py
"@
Start-Process powershell -ArgumentList "-NoExit -Command $mlCommand" -WindowStyle Normal

# Wait for ML service to start
Start-Sleep -Seconds 3

# Start Backend
Write-Host "[2/3] Starting Backend (Express) on port 5000..." -ForegroundColor Cyan
$backendCommand = @"
Set-Location '$ProjectRoot\server'
npm run dev
"@
Start-Process powershell -ArgumentList "-NoExit -Command $backendCommand" -WindowStyle Normal

# Wait for Backend to start
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "[3/3] Starting Frontend (Vite) on port 5173..." -ForegroundColor Cyan
$frontendCommand = @"
Set-Location '$ProjectRoot\client'
npm run dev
"@
Start-Process powershell -ArgumentList "-NoExit -Command $frontendCommand" -WindowStyle Normal

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  All Services Starting..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Wait for all terminal windows to show 'ready' messages" -ForegroundColor Yellow
Write-Host ""
Write-Host "Services:" -ForegroundColor Green
Write-Host "  - ML API:   http://localhost:5001" -ForegroundColor Green
Write-Host "  - Backend:  http://localhost:5000" -ForegroundColor Green
Write-Host "  - Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Check browser console for detailed logs (F12)" -ForegroundColor Yellow
Write-Host "Check server terminals for request logs" -ForegroundColor Yellow
Write-Host ""
Write-Host "For troubleshooting: Read DEBUGGING.md" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to close this window"
