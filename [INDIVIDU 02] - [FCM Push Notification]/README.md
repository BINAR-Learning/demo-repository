# FCM Push Notification Demo

A full-stack web application demonstrating Firebase Cloud Messaging (FCM) capabilities for sending and receiving push notifications, specifically targeting Android devices with URL payloads.

## 🚀 Features

- **Frontend Web Client**: HTML/CSS/JavaScript web application with FCM integration
- **Backend Server**: Node.js/Express server using Firebase Admin SDK
- **FCM HTTP v1 Protocol**: Uses the latest FCM REST API
- **Service Worker**: Handles background notifications
- **URL Payload**: Opens target URL when notification is clicked
- **Real-time Token Display**: Shows FCM registration token for testing
- **Notification History**: Displays received notifications

## 📁 Project Structure

```
fcm-push-notification/
├── client/                          # Frontend web application
│   ├── index.html                   # Main HTML page
│   ├── styles.css                   # Styling
│   ├── app.js                       # Main application logic
│   ├── firebase-config.js           # Firebase configuration
│   └── firebase-messaging-sw.js     # Service worker for background notifications
├── server/                          # Backend server
│   ├── server.js                    # Main server file
│   ├── package.json                 # Node.js dependencies
│   ├── .env.example                 # Environment variables template
│   └── service-account-key.json.example  # Service account template
└── README.md                        # This file
```

## 🔧 Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Firebase project with FCM enabled
- Web server (for serving the client files)

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Cloud Messaging in the project settings
4. Generate a service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file as `service-account-key.json` in the `server/` directory
5. Get your web app configuration:
   - Go to Project Settings → General → Your apps
   - Add a web app if you haven't already
   - Copy the configuration object
6. Generate a VAPID key:
   - Go to Project Settings → Cloud Messaging
   - Generate a new key pair under "Web Push certificates"

### 2. Client Configuration

1. Open `client/firebase-config.js`
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id",
    measurementId: "your-measurement-id"
};

const vapidKey = "your-actual-vapid-key";
```

3. Update the same configuration in `client/firebase-messaging-sw.js`

### 3. Server Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Copy your service account key:
```bash
cp path/to/your/service-account-key.json ./service-account-key.json
```

4. (Optional) Create environment variables:
```bash
cp .env.example .env
# Edit .env with your values
```

5. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000`

### 4. Client Setup

1. Serve the client files using a web server (required for service workers):

**Option A: Using Python (if installed)**
```bash
cd client
python -m http.server 8080
```

**Option B: Using Node.js http-server**
```bash
npm install -g http-server
cd client
http-server -p 8080
```

**Option C: Using Live Server (VS Code extension)**
- Install the Live Server extension
- Right-click on `index.html` and select "Open with Live Server"

2. Open your browser and go to `http://localhost:8080`

## 🧪 Testing

### 1. Web Client Testing

1. Open the web application in your browser
2. Allow notification permissions when prompted
3. Copy the FCM registration token displayed on the page
4. The token will be used to send notifications from the server

### 2. Server API Testing

#### Send a single notification:
```bash
curl -X POST http://localhost:3000/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-fcm-token-here",
    "title": "Test Notification",
    "body": "This is a test message",
    "url": "https://erabeacon-7e08e.web.app/"
  }'
```

#### Send to multiple devices:
```bash
curl -X POST http://localhost:3000/send-multicast \
  -H "Content-Type: application/json" \
  -d '{
    "tokens": ["token1", "token2"],
    "title": "Multicast Test",
    "body": "This is a multicast message",
    "url": "https://erabeacon-7e08e.web.app/"
  }'
```

#### Validate a token:
```bash
curl -X POST http://localhost:3000/validate-token \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-fcm-token-here"
  }'
```

### 3. Android Testing

To test on Android devices:

1. Open the web application in Chrome on Android
2. Follow the same steps as web testing
3. When you receive a notification, tap it to open the target URL
4. The URL `https://erabeacon-7e08e.web.app/` should open in a new tab

## 📱 API Endpoints

### Server Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Server information |
| `/health` | GET | Health check |
| `/send-notification` | POST | Send notification to single device |
| `/send-multicast` | POST | Send notification to multiple devices |
| `/validate-token` | POST | Validate FCM token |

### Request/Response Examples

#### Send Notification Request:
```json
{
  "token": "fcm-registration-token",
  "title": "Notification Title",
  "body": "Notification body text",
  "url": "https://erabeacon-7e08e.web.app/",
  "data": {
    "custom_key": "custom_value"
  }
}
```

#### Send Notification Response:
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "data": {
    "success": true,
    "messageId": "projects/your-project/messages/0:1234567890",
    "token": "fcm-registration-token"
  }
}
```

## 🔒 Security Notes

1. **Service Account Key**: Keep your `service-account-key.json` file secure and never commit it to version control
2. **CORS**: Configure CORS settings in the server for production use
3. **API Authentication**: Add API key authentication for production
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **Input Validation**: Validate all input data on the server side

## 🐛 Troubleshooting

### Common Issues

1. **Service Worker Not Registering**
   - Ensure you're serving the client over HTTPS or localhost
   - Check that `firebase-messaging-sw.js` is in the root directory

2. **Notifications Not Appearing**
   - Check browser notification permissions
   - Verify Firebase configuration is correct
   - Check browser console for errors

3. **Server Connection Issues**
   - Verify service account key is valid
   - Check Firebase project settings
   - Ensure network connectivity

4. **Token Issues**
   - Tokens can expire or become invalid
   - Use the refresh token functionality
   - Validate tokens using the `/validate-token` endpoint

### Debug Tips

1. **Enable Debug Logging**:
   ```javascript
   // Add to firebase-config.js
   firebase.messaging().useServiceWorker(registration);
   ```

2. **Check Browser Console**: Look for FCM-related errors
3. **Check Server Logs**: Monitor server output for error messages
4. **Test with curl**: Use curl commands to test server endpoints directly

## 🚀 Deployment

### Client Deployment
- Deploy client files to any static hosting service (Netlify, Vercel, Firebase Hosting)
- Ensure HTTPS is enabled for service workers to work

### Server Deployment
- Deploy to any Node.js hosting platform (Heroku, Railway, Digital Ocean)
- Set environment variables for production
- Configure proper CORS settings

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Firebase documentation
3. Check browser console for errors
4. Verify server logs

---

Made with ❤️ for FCM Push Notification Demo
