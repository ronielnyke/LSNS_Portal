@echo off
chcp 65001 >nul
title Student Management System - DepEd Grading
color 0B
cls

echo ==========================================
echo   Student Management System
echo   DepEd Order No. 8, s. 2015 Compliant
echo ==========================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%a in ('node -v') do set NODEVER=%%a
echo [OK] Node.js %NODEVER%

echo.
echo [1/3] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Building React app...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)
echo [OK] Build successful.

echo.
echo [3/3] Starting server...
echo.
node server.cjs

pause
