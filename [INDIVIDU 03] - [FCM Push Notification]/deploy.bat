@echo off
REM FCM Push Notification Deployment Script for Google Cloud Platform (Windows)

echo 🚀 Starting FCM Push Notification deployment to Google Cloud...

REM Check if gcloud is installed
gcloud version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: gcloud CLI is not installed. Please install it from https://cloud.google.com/sdk/docs/install
    pause
    exit /b 1
)

REM Check if user is authenticated
for /f "tokens=*" %%i in ('gcloud auth list --filter=status:ACTIVE --format="value(account)"') do set ACCOUNT=%%i
if "%ACCOUNT%"=="" (
    echo ERROR: Not authenticated with Google Cloud. Please run 'gcloud auth login'
    pause
    exit /b 1
)

REM Get project ID
for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set PROJECT_ID=%%i
if "%PROJECT_ID%"=="" (
    echo ERROR: No project set. Please run 'gcloud config set project YOUR_PROJECT_ID'
    pause
    exit /b 1
)

echo Using project: %PROJECT_ID%

REM Check if billing is enabled
echo Checking billing account...
gcloud beta billing projects describe %PROJECT_ID% >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: No billing account linked to project %PROJECT_ID%
    echo Please enable billing at: https://console.cloud.google.com/billing/linkedaccount
    echo Note: Google provides $300 free credit for new accounts
    pause
    exit /b 1
)

echo ✅ Billing account found

REM Enable required APIs (only after billing is confirmed)
echo Enabling required Google Cloud APIs...
gcloud services enable appengine.googleapis.com cloudbuild.googleapis.com run.googleapis.com storage-api.googleapis.com
if %errorlevel% neq 0 (
    echo ERROR: Failed to enable APIs. Please check billing and permissions.
    pause
    exit /b 1
)

REM Deploy server to App Engine
echo Deploying server to App Engine...
cd server

REM Check if App Engine app exists, create if not
gcloud app describe >nul 2>&1
if %errorlevel% neq 0 (
    echo Creating App Engine application...
    gcloud app create --region=us-central
)

REM Deploy the server
gcloud app deploy --quiet --stop-previous-version

REM Get the server URL
set SERVER_URL=https://%PROJECT_ID%.appspot.com
echo Server deployed to: %SERVER_URL%

REM Go back to root directory
cd ..

REM Update client configuration with server URL
echo Updating client configuration...
powershell -Command "(gc client\firebase-config.js) -replace 'http://localhost:3000', '%SERVER_URL%' | Out-File -encoding ASCII client\firebase-config.js"
powershell -Command "(gc client\firebase.json) -replace 'YOUR_PROJECT_ID', '%PROJECT_ID%' | Out-File -encoding ASCII client\firebase.json"
powershell -Command "(gc client\.firebaserc) -replace 'YOUR_PROJECT_ID', '%PROJECT_ID%' | Out-File -encoding ASCII client\.firebaserc"

REM Deploy client to Firebase Hosting
echo Deploying client to Firebase Hosting...

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Firebase CLI not found. Installing...
    npm install -g firebase-tools
)

REM Deploy to Firebase Hosting
cd client
firebase deploy --only hosting --project %PROJECT_ID%

REM Get the client URL
set CLIENT_URL=https://%PROJECT_ID%.web.app
echo Client deployed to: %CLIENT_URL%

REM Go back to root directory
cd ..

REM Test deployment
echo Testing deployment...
echo Testing server health endpoint...

REM Display deployment summary
echo.
echo 🎉 Deployment completed successfully!
echo.
echo 📍 Your deployed URLs:
echo    🖥️  Server:  %SERVER_URL%
echo    🌐 Client:  %CLIENT_URL%
echo.
echo 🧪 Testing URLs:
echo    🔍 Health:  %SERVER_URL%/health
echo    📱 Send:    %SERVER_URL%/send-notification
echo.
echo 📋 Next steps:
echo    1. Open %CLIENT_URL% in your browser
echo    2. Allow notifications when prompted
echo    3. Copy the FCM token
echo    4. Test sending notifications
echo.
echo 📚 View logs:
echo    gcloud app logs tail -s default
echo.
echo 🔧 Update deployment:
echo    deploy.bat
echo.

echo Deployment complete! 🚀
pause
