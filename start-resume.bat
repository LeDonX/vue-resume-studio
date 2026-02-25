@echo off
setlocal

cd /d "%~dp0"

if not exist ".env" (
  if exist ".env.example" (
    copy /Y ".env.example" ".env" >nul
    echo [INFO] .env created. Optional: set BROWSER_BIN in .env
  ) else (
    echo [WARN] .env.example not found. Please create .env manually.
  )
)

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found. Please install Node.js 18+.
  pause
  exit /b 1
)

start "Vue Resume Server" cmd /k "cd /d "%~dp0" && node server.js"

powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Sleep -Seconds 2; Start-Process 'http://127.0.0.1:8787/'"

echo [OK] Started server and opened browser.
echo [TIP] If export fails, ensure Edge/Chrome is installed.
pause

endlocal
