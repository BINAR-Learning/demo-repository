@echo off
echo ========================================
echo   Prometheus & Grafana Setup Script
echo ========================================
echo.

REM Check if Node.js is running
echo Checking if Next.js app is running...
curl -s http://localhost:3000/api/metrics >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Next.js app is not running on port 3000
    echo Please start your app first: npm run dev
    pause
    exit /b 1
)
echo ✅ Next.js app is running

REM Check if Prometheus directory exists
if not exist "C:\prometheus" (
    echo.
    echo Downloading Prometheus...
    echo This may take a few minutes...
    
    REM Download Prometheus
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.windows-amd64.zip' -OutFile 'prometheus.zip'"
    
    if %errorlevel% neq 0 (
        echo ❌ Failed to download Prometheus
        pause
        exit /b 1
    )
    
    REM Extract Prometheus
    powershell -Command "Expand-Archive -Path 'prometheus.zip' -DestinationPath 'C:\' -Force"
    
    REM Move files to prometheus directory
    if exist "C:\prometheus-2.45.0.windows-amd64" (
        move "C:\prometheus-2.45.0.windows-amd64\*" "C:\prometheus\" 2>nul
        rmdir "C:\prometheus-2.45.0.windows-amd64" 2>nul
    )
    
    REM Clean up
    del prometheus.zip 2>nul
    
    echo ✅ Prometheus downloaded and extracted
) else (
    echo ✅ Prometheus directory already exists
)

REM Copy prometheus.yml if it doesn't exist
if not exist "C:\prometheus\prometheus.yml" (
    echo.
    echo Copying prometheus.yml configuration...
    copy "prometheus.yml.template" "C:\prometheus\prometheus.yml" >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Failed to copy prometheus.yml
        echo Please make sure prometheus.yml.template exists in the current directory
        pause
        exit /b 1
    )
    echo ✅ Configuration copied
    echo.
    echo ⚠️  IMPORTANT: Update C:\prometheus\prometheus.yml with your Grafana Cloud credentials
    echo    - Replace YOUR_INSTANCE_ID with your Grafana Cloud Instance ID
    echo    - Replace YOUR_API_KEY with your Grafana Cloud API Key
    echo.
) else (
    echo ✅ Prometheus configuration already exists
)

REM Check if Prometheus is already running
tasklist /FI "IMAGENAME eq prometheus.exe" 2>NUL | find /I /N "prometheus.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ Prometheus is already running
) else (
    echo.
    echo Starting Prometheus...
    start "Prometheus" C:\prometheus\prometheus.exe --config.file=C:\prometheus\prometheus.yml
    echo ✅ Prometheus started
)

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo 📊 Next Steps:
echo 1. Open http://localhost:9090 to check Prometheus
echo 2. Update Grafana Cloud credentials in C:\prometheus\prometheus.yml
echo 3. Create dashboard in Grafana Cloud
echo 4. Run: node scripts/monitor-metrics.js to check status
echo.
echo 📚 For detailed instructions, see PROMETHEUS_SETUP.md
echo.
pause 