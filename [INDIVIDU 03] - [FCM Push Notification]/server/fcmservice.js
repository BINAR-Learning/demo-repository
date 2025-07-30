const admin = require('firebase-admin');

class FCMService {
    constructor() {
        this.messaging = admin.messaging();
    }

    async sendNotification(token, title, body, url, additionalData = {}) {
        try {
            const message = {
                token: token,
                notification: { title, body },
                data: { url, click_action: 'FLUTTER_NOTIFICATION_CLICK', ...additionalData },
                android: {
                    notification: { icon: 'ic_notification', sound: 'default', click_action: 'FLUTTER_NOTIFICATION_CLICK' },
                    data: { url, ...additionalData }
                },
                webpush: {
                    notification: { icon: '/icon-192x192.png', badge: '/icon-192x192.png', actions: [{ action: 'open', title: 'Open' }] },
                    data: { url, ...additionalData },
                    fcm_options: { link: url }
                }
            };
            const response = await this.messaging.send(message);
            console.log('✅ Notification sent successfully:', response);
            return { success: true, messageId: response, token };
        } catch (error) {
            console.error('❌ Error sending notification:', error);
            throw error;
        }
    }

    async sendMulticastNotification(tokens, title, body, url, additionalData = {}) {
        try {
            const message = {
                tokens,
                notification: { title, body },
                data: { url, click_action: 'FLUTTER_NOTIFICATION_CLICK', ...additionalData },
                android: {
                    notification: { icon: 'ic_notification', sound: 'default', click_action: 'FLUTTER_NOTIFICATION_CLICK' },
                    data: { url, ...additionalData }
                },
                webpush: {
                    notification: { icon: '/icon-192x192.png', badge: '/icon-192x192.png' },
                    data: { url, ...additionalData },
                    fcm_options: { link: url }
                }
            };
            const response = await this.messaging.sendMulticast(message);
            console.log('✅ Multicast notification sent:', response);
            return { success: true, successCount: response.successCount, failureCount: response.failureCount, responses: response.responses };
        } catch (error) {
            console.error('❌ Error sending multicast notification:', error);
            throw error;
        }
    }

    async validateToken(token) {
        try {
            const testMessage = {
                token,
                data: { test: 'validation' },
                android: { priority: 'high' }
            };
            await this.messaging.send(testMessage, true);
            return { valid: true };
        } catch (error) {
            console.error('❌ Token validation failed:', error);
            return { valid: false, error: error.message };
        }
    }
}

module.exports = FCMService;
