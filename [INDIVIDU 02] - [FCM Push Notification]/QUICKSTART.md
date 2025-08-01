# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Firebase Setup (2 minutes)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Cloud Messaging
4. Get your web app config and VAPID key
5. Download service account key

### 2. Client Setup (1 minute)
1. Edit `client/firebase-config.js` with your Firebase config
2. Edit `client/firebase-messaging-sw.js` with the same config
3. Serve client files: `cd client && python -m http.server 8080`

### 3. Server Setup (2 minutes)
1. `cd server && npm install`
2. Copy your service account key to `server/service-account-key.json`
3. `npm start`

### 4. Test (30 seconds)
1. Open `http://localhost:8080` in your browser
2. Allow notifications
3. Copy the FCM token
4. Use the "Send Test Notification" button

## 📋 Checklist

- [ ] Firebase project created
- [ ] Cloud Messaging enabled
- [ ] Web app config copied to `firebase-config.js`
- [ ] VAPID key copied to `firebase-config.js`
- [ ] Service account key saved as `service-account-key.json`
- [ ] Client dependencies installed (none needed - uses CDN)
- [ ] Server dependencies installed (`npm install`)
- [ ] Client server running on port 8080
- [ ] Backend server running on port 3000
- [ ] Browser notifications allowed
- [ ] FCM token displayed in web app

## 🔧 Development Commands

### Client
```bash
# Serve client files
cd client
python -m http.server 8080
# OR
npx http-server -p 8080
```

### Server
```bash
# Install dependencies
cd server
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## 🧪 API Testing

### Test with curl:
```bash
# Get your FCM token from the web app first, then:
curl -X POST http://localhost:3000/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "token": "PASTE_YOUR_FCM_TOKEN_HERE",
    "title": "Test Notification",
    "body": "Hello from FCM!",
    "url": "https://erabeacon-7e08e.web.app/"
  }'
```

### Test with the web app:
1. Open `http://localhost:8080`
2. Copy the displayed FCM token
3. Click "Send Test Notification"
4. Check for the notification

## 🚨 Common Issues

1. **`Notification permission denied` error?**
   - **Solution 1**: Click the 🔒 lock icon in browser address bar → Allow notifications
   - **Solution 2**: Go to browser settings → Privacy/Security → Site Settings → Notifications → Allow for localhost
   - **Solution 3**: Try in incognito/private mode and allow notifications when prompted
   - **Solution 4**: Clear browser data and reload the page
   - **For Chrome**: chrome://settings/content/notifications → Add localhost:8080 to "Allow" list
   - **For Firefox**: about:preferences#privacy → Permissions → Notifications → Settings → Allow localhost

2. **`usePublicVapidKey is not a function` error?**
   - This is fixed in the latest version - VAPID key is now passed to getToken()
   - Make sure you're using the updated app.js file
   - Clear browser cache and reload

3. **Notifications not working?**
   - Check browser allows notifications
   - Verify you're using HTTPS or localhost
   - Check browser console for errors

3. **Server won't start?**
   - Ensure `service-account-key.json` exists
   - Check Firebase project ID matches
   - Verify Node.js version (16+)

4. **Service worker issues?**
   - Ensure files are served over HTTP/HTTPS
   - Check `firebase-messaging-sw.js` is in root
   - Clear browser cache and reload

## 📱 Mobile Testing

### Android Chrome:
1. Open `http://your-ip:8080` on mobile
2. Allow notifications
3. Test sending notifications
4. Tap notifications to open URL

### iOS Safari:
- Limited support for web push notifications
- Use Chrome on iOS for better compatibility

## 🔍 Debugging

### Client Debug:
```javascript
// Add to console in browser
localStorage.debug = 'firebase:*';
```

### Server Debug:
```bash
# Enable debug logging
DEBUG=* npm start
```

## 🎯 Next Steps

1. **Production Setup**:
   - Deploy client to static hosting
   - Deploy server to cloud platform
   - Set up proper environment variables

2. **Deploy to Google Cloud**:
   - Follow the complete guide in `DEPLOYMENT.md`
   - Quick deploy: `deploy.bat` (Windows) or `deploy.sh` (Linux/Mac)
   - Server: App Engine or Cloud Run
   - Client: Firebase Hosting or Cloud Storage

3. **Security**:
   - Add API authentication
   - Implement rate limiting
   - Validate all inputs

4. **Features**:
   - Add notification scheduling
   - Implement user subscriptions
   - Add notification analytics

## 🚀 Quick Deploy to Google Cloud

### Prerequisites
1. Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. Install [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`
3. Create a Google Cloud project
4. Authenticate: `gcloud auth login`
5. Set project: `gcloud config set project YOUR_PROJECT_ID`

### Deploy Commands
```bash
# Windows
deploy.bat

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

### Manual Deploy
```bash
# Deploy server to App Engine
cd server
gcloud app deploy

# Deploy client to Firebase Hosting  
cd ../client
firebase deploy --only hosting
```

Your deployed URLs:
- **Server**: `https://your-project-id.appspot.com`
- **Client**: `https://your-project-id.web.app`

## 📞 Need Help?

1. Check the main README.md for detailed instructions
2. Review Firebase documentation
3. Check browser developer tools
4. Verify server logs
