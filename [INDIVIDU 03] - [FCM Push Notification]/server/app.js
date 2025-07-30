const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const FCMService = require('./fcmservice');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(helmet());
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ? [
        /\.web\.app$/,
        /\.firebaseapp\.com$/,
        /\.appspot\.com$/,
        /localhost/
    ] : true,
    credentials: true
};
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

let firebaseApp;
console.log('🔄 Initializing Firebase Admin SDK...');
try {
    if (process.env.GAE_APPLICATION) {
        console.log('🌐 Running on App Engine, using default credentials');
        firebaseApp = admin.initializeApp({
            projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT
        });
    } else {
        console.log('💻 Local development mode, using service account key');
        const serviceAccount = require('./service-account-key.json');
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id
        });
    }
    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log(`📱 Project ID: ${firebaseApp.options.projectId}`);
} catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error.message);
    if (!process.env.GAE_APPLICATION) {
        console.error('💡 For local development, ensure service-account-key.json is in the server directory');
    } else {
        console.error('💡 For App Engine, ensure the default service account has Firebase Admin permissions');
    }
    if (process.env.NODE_ENV === 'production') {
        console.warn('⚠️ Starting server without Firebase (limited functionality)');
    } else {
        process.exit(1);
    }
}

let fcmService;
try {
    fcmService = new FCMService();
    console.log('✅ FCM Service initialized successfully');
} catch (error) {
    console.error('❌ Error initializing FCM Service:', error.message);
    fcmService = {
        sendNotification: () => Promise.reject(new Error('FCM not available')),
        sendMulticastNotification: () => Promise.reject(new Error('FCM not available')),
        validateToken: () => Promise.reject(new Error('FCM not available'))
    };
}

app.get('/health', (req, res) => {
    const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'FCM Push Notification Server',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        port: PORT,
        firebase: {
            initialized: !!firebaseApp,
            projectId: firebaseApp?.options?.projectId || 'not-available'
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid
    };
    console.log('🏥 Health check requested:', { timestamp: healthStatus.timestamp, status: healthStatus.status, firebase: healthStatus.firebase.initialized });
    res.json(healthStatus);
});

app.get('/', (req, res) => {
    res.json({
        message: 'FCM Push Notification Server',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            sendNotification: '/send-notification',
            sendMulticast: '/send-multicast',
            validateToken: '/validate-token'
        },
        documentation: 'https://firebase.google.com/docs/cloud-messaging'
    });
});

app.post('/send-notification', async (req, res) => {
    try {
        const { token, title, body, url, data } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'FCM registration token is required' });
        }
        const notificationTitle = title || 'FCM Notification';
        const notificationBody = body || 'You have a new message';
        const targetUrl = url || 'https://erabeacon-7e08e.web.app/';
        const result = await fcmService.sendNotification(token, notificationTitle, notificationBody, targetUrl, data || {});
        res.json({ success: true, message: 'Notification sent successfully', data: result });
    } catch (error) {
        console.error('❌ Error in /send-notification:', error);
        res.status(500).json({ error: 'Failed to send notification', details: error.message });
    }
});

app.post('/send-multicast', async (req, res) => {
    try {
        const { tokens, title, body, url, data } = req.body;
        if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
            return res.status(400).json({ error: 'Array of FCM registration tokens is required' });
        }
        const notificationTitle = title || 'FCM Notification';
        const notificationBody = body || 'You have a new message';
        const targetUrl = url || 'https://erabeacon-7e08e.web.app/';
        const result = await fcmService.sendMulticastNotification(tokens, notificationTitle, notificationBody, targetUrl, data || {});
        res.json({ success: true, message: 'Multicast notification sent', data: result });
    } catch (error) {
        console.error('❌ Error in /send-multicast:', error);
        res.status(500).json({ error: 'Failed to send multicast notification', details: error.message });
    }
});

app.post('/validate-token', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'FCM registration token is required' });
        }
        const result = await fcmService.validateToken(token);
        res.json({ success: true, valid: result.valid, error: result.error || null });
    } catch (error) {
        console.error('❌ Error in /validate-token:', error);
        res.status(500).json({ error: 'Failed to validate token', details: error.message });
    }
});

app.use((error, req, res, next) => {
    console.error('❌ Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found', message: `${req.method} ${req.path} is not a valid endpoint` });
});

module.exports = app;
module.exports.FCMService = FCMService;
