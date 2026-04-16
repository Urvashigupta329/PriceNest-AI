@echo off
REM PriceNestAI Multi-Service Startup Script for Windows
REM This script starts ML API, Backend, and Frontend in separate terminal windows

setlocal enabledelayedexpansion

set PROJECT_ROOT=d:\PriceNest AI

echo.
echo =====================================
echo  PriceNestAI Startup Helper
echo =====================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python from https://www.python.org
    pause
    exit /b 1
)

echo [OK] Node.js installed: 
node --version

echo [OK] Python installed:
python --version

echo.
echo Starting all services...
echo.

REM Start ML API in new window
echo [1/3] Starting ML Service (Flask) on port 5001...
start "ML API - Port 5001" cmd /k "cd /d "!PROJECT_ROOT!\ml-api" && venv\Scripts\activate && python app.py"

REM Wait a moment for ML service to start
timeout /t 3 /nobreak

REM Start Backend in new window
echo [2/3] Starting Backend (Express) on port 5000...
start "Backend - Port 5000" cmd /k "cd /d "!PROJECT_ROOT!\server" && npm run dev"

REM Wait a moment for Backend to start
timeout /t 3 /nobreak

REM Start Frontend in new window
echo [3/3] Starting Frontend (Vite) on port 5173...
start "Frontend - Port 5173" cmd /k "cd /d "!PROJECT_ROOT!\client" && npm run dev"

echo.
echo =====================================
echo  All Services Starting...
echo =====================================
echo.
echo Wait for all terminal windows to show "ready" messages
echo.
echo Services:
echo   - ML API:   http://localhost:5001
echo   - Backend:  http://localhost:5000
echo   - Frontend: http://localhost:5173
echo.
echo Check browser console for detailed logs (F12)
echo Check server terminals for request logs
echo.
echo For troubleshooting: Read DEBUGGING.md
echo.
pause
