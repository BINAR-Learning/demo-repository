const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080; // Changed to 8080 for App Engine

// Middleware
app.use(helmet());

// Updated CORS configuration for production
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

// Firebase Admin SDK initialization
let firebaseApp;

console.log('🔄 Initializing Firebase Admin SDK...');

try {
    // Check if running on App Engine with default credentials
    if (process.env.GAE_APPLICATION) {
        console.log('🌐 Running on App Engine, using default credentials');
        firebaseApp = admin.initializeApp({
            projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT
        });
    } else {
        // Local development - use service account key
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
    
    // In production, we might want to start the server anyway with limited functionality
    if (process.env.NODE_ENV === 'production') {
        console.warn('⚠️ Starting server without Firebase (limited functionality)');
    } else {
        process.exit(1);
    }
}

// FCM Service Class
class FCMService {
    constructor() {
        this.messaging = admin.messaging();
    }

    /**
     * Send a push notification to a specific device
     * @param {string} token - FCM registration token
     * @param {string} title - Notification title
     * @param {string} body - Notification body
     * @param {string} url - URL to open when notification is clicked
     * @param {object} additionalData - Additional data to send with notification
     */
    async sendNotification(token, title, body, url, additionalData = {}) {
        try {
            // Construct the message payload according to FCM HTTP v1 Protocol
            const message = {
                token: token,
                notification: {
                    title: title,
                    body: body
                },
                data: {
                    url: url,
                    click_action: 'FLUTTER_NOTIFICATION_CLICK',
                    ...additionalData
                },
                android: {
                    notification: {
                        icon: 'ic_notification',
                        sound: 'default',
                        click_action: 'FLUTTER_NOTIFICATION_CLICK'
                    },
                    data: {
                        url: url,
                        ...additionalData
                    }
                },
                webpush: {
                    notification: {
                        icon: '/icon-192x192.png',
                        badge: '/icon-192x192.png',
                        actions: [
                            {
                                action: 'open',
                                title: 'Open'
                            }
                        ]
                    },
                    data: {
                        url: url,
                        ...additionalData
                    },
                    fcm_options: {
                        link: url
                    }
                }
            };

            // Send the message using FCM HTTP v1 API
            const response = await this.messaging.send(message);
            
            console.log('✅ Notification sent successfully:', response);
            return {
                success: true,
                messageId: response,
                token: token
            };
        } catch (error) {
            console.error('❌ Error sending notification:', error);
            throw error;
        }
    }

    /**
     * Send notifications to multiple devices
     * @param {Array<string>} tokens - Array of FCM registration tokens
     * @param {string} title - Notification title
     * @param {string} body - Notification body
     * @param {string} url - URL to open when notification is clicked
     * @param {object} additionalData - Additional data to send with notification
     */
    async sendMulticastNotification(tokens, title, body, url, additionalData = {}) {
        try {
            const message = {
                tokens: tokens,
                notification: {
                    title: title,
                    body: body
                },
                data: {
                    url: url,
                    click_action: 'FLUTTER_NOTIFICATION_CLICK',
                    ...additionalData
                },
                android: {
                    notification: {
                        icon: 'ic_notification',
                        sound: 'default',
                        click_action: 'FLUTTER_NOTIFICATION_CLICK'
                    },
                    data: {
                        url: url,
                        ...additionalData
                    }
                },
                webpush: {
                    notification: {
                        icon: '/icon-192x192.png',
                        badge: '/icon-192x192.png'
                    },
                    data: {
                        url: url,
                        ...additionalData
                    },
                    fcm_options: {
                        link: url
                    }
                }
            };

            const response = await this.messaging.sendMulticast(message);
            
            console.log('✅ Multicast notification sent:', response);
            return {
                success: true,
                successCount: response.successCount,
                failureCount: response.failureCount,
                responses: response.responses
            };
        } catch (error) {
            console.error('❌ Error sending multicast notification:', error);
            throw error;
        }
    }

    /**
     * Validate FCM registration token
     * @param {string} token - FCM registration token to validate
     */
    async validateToken(token) {
        try {
            // Send a test message to validate the token
            const testMessage = {
                token: token,
                data: {
                    test: 'validation'
                },
                android: {
                    priority: 'high'
                }
            };

            await this.messaging.send(testMessage, true); // dry_run = true
            return { valid: true };
        } catch (error) {
            console.error('❌ Token validation failed:', error);
            return { valid: false, error: error.message };
        }
    }
}

// Initialize FCM Service
let fcmService;

try {
    fcmService = new FCMService();
    console.log('✅ FCM Service initialized successfully');
} catch (error) {
    console.error('❌ Error initializing FCM Service:', error.message);
    // Create a dummy service for health checks
    fcmService = {
        sendNotification: () => Promise.reject(new Error('FCM not available')),
        sendMulticastNotification: () => Promise.reject(new Error('FCM not available')),
        validateToken: () => Promise.reject(new Error('FCM not available'))
    };
}

// Routes

// Health check endpoint
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

    console.log('🏥 Health check requested:', {
        timestamp: healthStatus.timestamp,
        status: healthStatus.status,
        firebase: healthStatus.firebase.initialized
    });

    res.json(healthStatus);
});

// Get server info
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

// Send notification to a single device
app.post('/send-notification', async (req, res) => {
    try {
        const { token, title, body, url, data } = req.body;

        // Validate required fields
        if (!token) {
            return res.status(400).json({
                error: 'FCM registration token is required'
            });
        }

        // Set default values
        const notificationTitle = title || 'FCM Notification';
        const notificationBody = body || 'You have a new message';
        const targetUrl = url || 'https://erabeacon-7e08e.web.app/';

        // Send notification
        const result = await fcmService.sendNotification(
            token,
            notificationTitle,
            notificationBody,
            targetUrl,
            data || {}
        );

        res.json({
            success: true,
            message: 'Notification sent successfully',
            data: result
        });

    } catch (error) {
        console.error('❌ Error in /send-notification:', error);
        res.status(500).json({
            error: 'Failed to send notification',
            details: error.message
        });
    }
});

// Send notification to multiple devices
app.post('/send-multicast', async (req, res) => {
    try {
        const { tokens, title, body, url, data } = req.body;

        // Validate required fields
        if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
            return res.status(400).json({
                error: 'Array of FCM registration tokens is required'
            });
        }

        // Set default values
        const notificationTitle = title || 'FCM Notification';
        const notificationBody = body || 'You have a new message';
        const targetUrl = url || 'https://erabeacon-7e08e.web.app/';

        // Send multicast notification
        const result = await fcmService.sendMulticastNotification(
            tokens,
            notificationTitle,
            notificationBody,
            targetUrl,
            data || {}
        );

        res.json({
            success: true,
            message: 'Multicast notification sent',
            data: result
        });

    } catch (error) {
        console.error('❌ Error in /send-multicast:', error);
        res.status(500).json({
            error: 'Failed to send multicast notification',
            details: error.message
        });
    }
});

// Validate FCM token
app.post('/validate-token', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                error: 'FCM registration token is required'
            });
        }

        const result = await fcmService.validateToken(token);
        
        res.json({
            success: true,
            valid: result.valid,
            error: result.error || null
        });

    } catch (error) {
        console.error('❌ Error in /validate-token:', error);
        res.status(500).json({
            error: 'Failed to validate token',
            details: error.message
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('❌ Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        details: error.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `${req.method} ${req.path} is not a valid endpoint`
    });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 FCM Push Notification Server started successfully!');
    console.log(`📍 Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📱 Send notifications to: http://localhost:${PORT}/send-notification`);
    console.log(`🔍 Health check: http://localhost:${PORT}/health`);
    console.log(`⏰ Server started at: ${new Date().toISOString()}`);
    
    if (process.env.GAE_APPLICATION) {
        console.log(`🎯 App Engine URL: https://${process.env.GOOGLE_CLOUD_PROJECT}.appspot.com`);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('👋 SIGINT received, shutting down gracefully');
    process.exit(0);
});

module.exports = app;
