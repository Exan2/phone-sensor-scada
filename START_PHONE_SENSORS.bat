@echo off
echo ========================================
echo   Phone Sensor Service Starter
echo ========================================
echo.

echo [1/2] Starting Phone Sensor Service...
cd phone-sensor-service
start "Phone Sensor Service" cmd /k "npm start"
cd ..

timeout /t 3 /nobreak >nul

echo [2/2] Starting SCADA Dashboard...
cd client
start "SCADA Dashboard" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo   Services Started!
echo ========================================
echo.
echo Phone Sensor Service: http://localhost:3001
echo SCADA Dashboard: http://localhost:3000
echo.
echo Make sure your phone is connected via USB
echo and USB debugging is enabled!
echo.
pause

