# Google Cloud Deployment Guide

## 🚀 Deploy FCM Push Notification Project to Google Cloud

This guide covers deploying both the client (static files) and server (Node.js) to Google Cloud Platform.

### 📋 Prerequisites

1. **Google Cloud Account**: [Create one here](https://cloud.google.com/)
2. **Google Cloud SDK**: [Install gcloud CLI](https://cloud.google.com/sdk/docs/install)
3. **Project Setup**: Create a new GCP project or use existing one

### 🔧 Initial Setup

#### 1. Install and Configure gcloud CLI
```bash
# Install gcloud CLI (if not already installed)
# Download from: https://cloud.google.com/sdk/docs/install

# Authenticate with Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID
```

#### 2. Enable Billing (CRITICAL - Do this FIRST)
```bash
# Step 1: Go to Google Cloud Console Billing
# URL: https://console.cloud.google.com/billing/linkedaccount

# Step 2: Select your project and link a billing account
# Note: New users get $300 free credit

# Step 3: Verify billing is enabled (run this command until it succeeds)
gcloud beta billing projects describe YOUR_PROJECT_ID

# If you get an error, wait 1-2 minutes and try again
# Billing activation can take a few minutes
```

#### 3. Enable Required APIs (ONLY after billing is confirmed)
```bash
# These commands will fail if billing is not enabled
gcloud services enable appengine.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable storage-api.googleapis.com
```

#### 2. Get Your Project ID
```bash
gcloud config get-value project
```

## ⚠️ IMPORTANT: Billing Setup Required

**Before proceeding with deployment, you MUST:**

1. **Enable Billing**: Go to [Google Cloud Console Billing](https://console.cloud.google.com/billing/linkedaccount)
2. **Link Account**: Select your project and link a billing account
3. **Wait**: Billing activation can take 1-2 minutes
4. **Verify**: Run `gcloud beta billing projects describe YOUR_PROJECT_ID` until it succeeds

**Common Error**: `FAILED_PRECONDITION: Billing account for project is not found`
- **Solution**: Complete billing setup first, then wait for activation

## 🖥️ Server Deployment (Backend)

### Option 1: App Engine (Recommended)

#### 1. Create App Engine Configuration
The `app.yaml` file is already created in the server directory.

#### 2. Deploy to App Engine
```bash
# Navigate to server directory
cd server

# Deploy the application
gcloud app deploy

# View your deployed app
gcloud app browse

# Expected Response: You should see a JSON response like:
# {
#   "message": "FCM Push Notification Server",
#   "version": "1.0.0",
#   "endpoints": {
#     "health": "/health",
#     "sendNotification": "/send-notification",
#     "sendMulticast": "/send-multicast",
#     "validateToken": "/validate-token"
#   },
#   "documentation": "https://firebase.google.com/docs/cloud-messaging"
# }
```

### Option 2: Cloud Run

#### 1. Build and Deploy with Cloud Run
```bash
# Navigate to server directory
cd server

# Deploy to Cloud Run
gcloud run deploy fcm-server \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Get the service URL
gcloud run services describe fcm-server --region us-central1 --format 'value(status.url)'
```

## 🌐 Client Deployment (Frontend)

### Option 1: Firebase Hosting (Recommended)

#### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

#### 2. Login to Firebase
```bash
firebase login
```

#### 3. Initialize Firebase Hosting
```bash
# Navigate to client directory
cd client

# Initialize Firebase
firebase init hosting

# Select your Firebase project
# Choose 'client' as your public directory
# Configure as single-page app: No
# Set up automatic builds: No
```

#### 4. Deploy to Firebase Hosting
```bash
# Deploy the client
firebase deploy --only hosting

# Get your hosting URL
firebase hosting:sites:list
```

### Option 2: Google Cloud Storage + CDN

#### 1. Create Storage Bucket
```bash
# Create bucket (must be globally unique)
gsutil mb gs://YOUR_BUCKET_NAME

# Make bucket publicly readable
gsutil iam ch allUsers:objectViewer gs://YOUR_BUCKET_NAME

# Enable website configuration
gsutil web set -m index.html -e index.html gs://YOUR_BUCKET_NAME
```

#### 2. Upload Client Files
```bash
# Navigate to client directory
cd client

# Upload all files
gsutil -m cp -r * gs://YOUR_BUCKET_NAME/

# Set correct content types
gsutil -m setmeta -h "Content-Type:text/html" gs://YOUR_BUCKET_NAME/*.html
gsutil -m setmeta -h "Content-Type:text/css" gs://YOUR_BUCKET_NAME/*.css
gsutil -m setmeta -h "Content-Type:application/javascript" gs://YOUR_BUCKET_NAME/*.js
```

## 🔐 Environment Configuration

### 1. Update Firebase Configuration
Update `client/firebase-config.js` with your deployed server URL:

```javascript
// Update this after server deployment
const serverUrl = 'https://your-project-id.appspot.com'; // App Engine URL
// OR
const serverUrl = 'https://fcm-server-xxxxx.run.app'; // Cloud Run URL
```

### 2. Update Client Configuration
Update the server URL in your client application:

```javascript
// In client/app.js, update the default server URL
document.getElementById('serverUrl').value = 'https://your-deployed-server-url.com';
```

### 3. Configure Environment Variables (App Engine)
Create `server/.env` file:
```bash
NODE_ENV=production
PORT=8080
```

### 4. Configure CORS
Update `server/server.js` to allow your client domain:
```javascript
// Update CORS configuration
app.use(cors({
    origin: [
        'https://your-project-id.web.app', // Firebase Hosting
        'https://your-bucket-name.storage.googleapis.com' // Cloud Storage
    ]
}));
```

## 🧪 Testing Deployment

### 1. Test Server Endpoints
```bash
# Test health endpoint
curl https://your-server-url.com/health

# Test notification endpoint
curl -X POST https://your-server-url.com/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "token": "test-token",
    "title": "Test Deploy",
    "body": "Testing deployed server"
  }'
```

### 2. Test Client Application
1. Open your deployed client URL: `https://erabeacon-customer.web.app`
2. Allow notifications when prompted
3. Wait for the service worker to initialize (may take a few seconds)
4. Copy the FCM token that appears
5. Test sending notifications using the interface

**Common Issue**: "Failed to execute 'subscribe' on 'PushManager': Subscription failed - no active Service Worker"
**Solution**: 
- Clear browser cache and reload the page
- Check browser dev tools (F12) → Application → Service Workers
- Use the debug tool: `https://erabeacon-customer.web.app/debug-sw.html`
- Wait a few seconds for the service worker to fully activate before requesting permissions

## 🔧 Deployment Commands Summary

### Quick Deploy Script
```bash
#!/bin/bash
# Deploy both client and server

echo "Deploying FCM Push Notification Project..."

# Deploy server to App Engine
echo "Deploying server..."
cd server
gcloud app deploy --quiet

# Deploy client to Firebase
echo "Deploying client..."
cd ../client
firebase deploy --only hosting

echo "Deployment complete!"
echo "Server: https://$(gcloud config get-value project).appspot.com"
echo "Client: https://$(gcloud config get-value project).web.app"
```

### Individual Commands
```bash
# Server deployment
cd server && gcloud app deploy

# Client deployment
cd client && firebase deploy --only hosting

# View logs
gcloud app logs tail -s default

# Update server
gcloud app deploy --version v2

# Delete version
gcloud app versions delete v1
```

## 📊 Monitoring and Logs

### View Server Logs
```bash
# App Engine logs
gcloud app logs tail -s default

# Cloud Run logs
gcloud run services logs read fcm-server --region us-central1
```

### Monitor Performance
```bash
# App Engine metrics
gcloud app services browse default

# Cloud Run metrics
gcloud run services describe fcm-server --region us-central1
```

## 🚨 Troubleshooting

### Common Issues:

1. **Runtime Error**: "Runtime nodejs18 is end of support and no longer allowed"
   - **Solution**: This is fixed - we now use Node.js 20 runtime
   - Make sure you're using the updated `app.yaml` with `runtime: nodejs20`
   - Ensure your local Node.js version is 20 or higher

2. **skip_files Error**: "skip_files cannot be used with the [nodejs20] runtime"
   - **Solution**: This is fixed - we use `.gcloudignore` file instead
   - The `.gcloudignore` file is already created in the server directory
   - If you see this error, make sure you're using the updated `app.yaml`

3. **Billing Error**: "The project must have a billing account attached"
   - **Solution**: Go to [Google Cloud Console Billing](https://console.cloud.google.com/billing/linkedaccount)
   - Link a billing account to your project
   - Note: Google provides $300 free credit for new accounts
   - App Engine requires billing even for free tier usage

4. **Build Fails**: Check Node.js version compatibility (must be Node.js 20+)
5. **CORS Errors**: Update CORS configuration in server
6. **Service Account**: Ensure service account key is properly configured
7. **Permissions**: Check IAM permissions for deployment

### Debug Commands:
```bash
# Check deployment status
gcloud app versions list

# Check service account
gcloud auth list

# Check project configuration
gcloud config list
```

## 🔒 Security Considerations

1. **Environment Variables**: Use Google Cloud Secret Manager for sensitive data
2. **API Authentication**: Implement API keys for production
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **HTTPS**: Ensure all communications use HTTPS
5. **CORS**: Configure proper CORS policies

## 💰 Cost Optimization

1. **App Engine**: Use automatic scaling
2. **Cloud Run**: Set appropriate CPU and memory limits
3. **Storage**: Use appropriate storage classes
4. **CDN**: Enable Cloud CDN for better performance

## 📈 Next Steps

1. **Custom Domain**: Configure custom domain for your application
2. **SSL Certificate**: Set up SSL certificates
3. **Monitoring**: Set up monitoring and alerts
4. **Backup**: Configure automated backups
5. **CI/CD**: Set up continuous deployment

---

**Your deployed URLs will be:**
- **Server**: `https://erabeacon-customer.appspot.com`
- **Client**: `https://erabeacon-customer.web.app`

Happy deploying! 🚀
