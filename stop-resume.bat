@echo off
setlocal

for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8787" ^| findstr "LISTENING"') do (
  taskkill /PID %%p /F >nul 2>nul
)

echo [OK] Stopped service on port 8787 (if running).
pause

endlocal
