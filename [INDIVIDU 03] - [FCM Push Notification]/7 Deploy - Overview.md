# 🚀 Google Cloud Deployment Overview

## Quick Deploy Process

### 1. One-Click Deploy
```bash
# Windows
deploy.bat

# Linux/Mac
./deploy.sh
```

### 2. Manual Deploy Steps

#### Setup (One-time)
1. Install Google Cloud SDK
2. Install Firebase CLI: `npm install -g firebase-tools`
3. Login: `gcloud auth login`
4. Set project: `gcloud config set project YOUR_PROJECT_ID`
5. **Enable billing**: [Link billing account](https://console.cloud.google.com/billing/linkedaccount)
6. Enable APIs: `gcloud services enable appengine.googleapis.com`

#### Server (App Engine)
```bash
cd server
gcloud app deploy
```

#### Client (Firebase Hosting)
```bash
cd client
firebase deploy --only hosting
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Firebase      │    │   Google Cloud  │
│   Hosting       │────│   App Engine    │
│   (Frontend)    │    │   (Backend)     │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
                   │
         ┌─────────────────┐
         │   Firebase      │
         │   Cloud         │
         │   Messaging     │
         └─────────────────┘
```

## Deployment Files

- `server/app.yaml` - App Engine configuration (Node.js 20 runtime)
- `server/.gcloudignore` - Files to exclude from deployment
- `server/Dockerfile` - Docker configuration (Cloud Run)
- `client/firebase.json` - Firebase Hosting configuration
- `client/.firebaserc` - Firebase project configuration
- `deploy.sh` / `deploy.bat` - Deployment scripts

## URLs After Deployment

- **Client**: `https://your-project-id.web.app`
- **Server**: `https://your-project-id.appspot.com`
- **Health Check**: `https://your-project-id.appspot.com/health`

## Testing Deployment

1. Open client URL in browser
2. Allow notifications
3. Copy FCM token
4. Test notification sending

## Troubleshooting

- **Runtime error**: "Runtime nodejs18 is end of support and no longer allowed"
  - Fixed: We now use Node.js 20 runtime
  - Make sure you have Node.js 20+ installed locally
- **skip_files error**: "skip_files cannot be used with the [nodejs20] runtime"
  - Fixed: We now use `.gcloudignore` file instead
  - Make sure you're using the updated `app.yaml` file
- **Billing error**: "The project must have a billing account attached"
  - Go to [Google Cloud Console](https://console.cloud.google.com/billing)
  - Link a billing account to your project
  - Note: Free tier includes $300 credit, no charges for basic usage
- **Build fails**: Check Node.js version (must be 20+)
- **Permission errors**: Check IAM roles
- **CORS issues**: Update server CORS configuration
- **404 errors**: Check routing and file paths

## Cost Optimization

- App Engine: Automatic scaling
- Firebase Hosting: Static hosting
- Cloud Messaging: Pay per message
- Estimated cost: $0-5/month for development

## Security Features

- HTTPS everywhere
- CORS protection
- Rate limiting
- Input validation
- Service account authentication
