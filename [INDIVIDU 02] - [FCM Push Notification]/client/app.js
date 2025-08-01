// FCM Web Client Application
class FCMClient {
    constructor() {
        this.messaging = null;
        this.currentToken = null;
        this.notifications = [];
        this.init();
    }

    async init() {
        try {
            // Check if browser supports service workers and notifications
            if (!('serviceWorker' in navigator)) {
                throw new Error('Service Worker not supported');
            }

            if (!('Notification' in window)) {
                throw new Error('Notifications not supported');
            }

            // Register service worker
            const registration = await this.registerServiceWorker();

            // Initialize Firebase Messaging with the service worker registration
            this.messaging = firebase.messaging();
            
            // Use the service worker registration for messaging
            if (registration) {
                console.log('Using service worker registration for messaging');
                // The service worker will handle background messages
            }

            // Configure VAPID key - use getToken method with vapidKey parameter instead
            // this.messaging.usePublicVapidKey(window.vapidKey);

            // Setup message listeners
            this.setupMessageListeners();

            // Request notification permission and get token
            await this.requestPermissionAndGetToken();

            // Update UI
            this.updateStatus('connected', 'Connected and ready to receive notifications');
            this.setupEventListeners();

        } catch (error) {
            console.error('FCM initialization failed:', error);
            this.updateStatus('error', `Error: ${error.message}`);
            
            // Show permission helper if it's a permission issue
            if (error.message.includes('permission')) {
                this.showPermissionHelper();
            }
        }
    }

    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('Service Worker registered successfully:', registration);
            
            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;
            console.log('Service Worker is ready');
            
            // Listen for messages from service worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'FCM_NOTIFICATION') {
                    this.handleForegroundMessage(event.data.notification);
                }
            });
            
            return registration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            throw error;
        }
    }

    setupMessageListeners() {
        // Handle foreground messages
        this.messaging.onMessage((payload) => {
            console.log('Message received (foreground):', payload);
            this.handleForegroundMessage(payload);
        });
    }

    async requestPermissionAndGetToken() {
        try {
            // Check current notification permission
            let permission = Notification.permission;
            
            if (permission === 'default') {
                // Request notification permission
                permission = await Notification.requestPermission();
            }
            
            if (permission === 'granted') {
                console.log('Notification permission granted');
                
                // Small delay to ensure service worker is fully ready
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Get FCM registration token with VAPID key
                const token = await this.messaging.getToken({
                    vapidKey: window.vapidKey,
                    serviceWorkerRegistration: await navigator.serviceWorker.ready
                });
                
                if (token) {
                    this.currentToken = token;
                    this.displayToken(token);
                    console.log('FCM Registration Token:', token);
                } else {
                    throw new Error('No registration token available. Please check your Firebase configuration.');
                }
            } else if (permission === 'denied') {
                throw new Error('Notification permission denied. Please enable notifications in your browser settings for this site.');
            } else {
                throw new Error('Notification permission not granted. Please allow notifications when prompted.');
            }
        } catch (error) {
            console.error('Error getting token:', error);
            throw error;
        }
    }

    async refreshToken() {
        try {
            this.updateStatus('', 'Refreshing token...');
            
            // Delete current token
            if (this.currentToken) {
                await this.messaging.deleteToken();
            }
            
            // Get new token with VAPID key
            const token = await this.messaging.getToken({
                vapidKey: window.vapidKey,
                serviceWorkerRegistration: await navigator.serviceWorker.ready
            });
            
            if (token) {
                this.currentToken = token;
                this.displayToken(token);
                this.updateStatus('connected', 'Token refreshed successfully');
            } else {
                throw new Error('Failed to get new token');
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            this.updateStatus('error', `Error refreshing token: ${error.message}`);
        }
    }

    displayToken(token) {
        const tokenElement = document.getElementById('fcmToken');
        tokenElement.value = token;
    }

    handleForegroundMessage(payload) {
        console.log('Handling foreground message:', payload);
        
        // Add to notifications list
        this.addNotification(payload);
        
        // Show browser notification if not already shown
        if (payload.notification) {
            this.showBrowserNotification(payload.notification, payload.data);
        }
    }

    showBrowserNotification(notification, data) {
        const options = {
            body: notification.body || 'No message body',
            icon: notification.icon || '/icon-192x192.svg',
            badge: '/icon-192x192.svg',
            data: data || {},
            actions: [
                {
                    action: 'open',
                    title: 'Open'
                }
            ]
        };

        // Show notification
        const notificationInstance = new Notification(notification.title || 'FCM Notification', options);
        
        // Handle notification click
        notificationInstance.onclick = () => {
            console.log('Notification clicked');
            
            // Open target URL if provided
            if (data && data.url) {
                window.open(data.url, '_blank');
            } else {
                // Default URL
                window.open('https://erabeacon-7e08e.web.app/', '_blank');
            }
            
            notificationInstance.close();
        };
    }

    addNotification(payload) {
        const notification = {
            id: Date.now(),
            title: payload.notification?.title || 'FCM Notification',
            body: payload.notification?.body || 'No message body',
            data: payload.data || {},
            timestamp: new Date().toLocaleString(),
            payload: payload
        };

        this.notifications.unshift(notification);
        this.updateNotificationsList();
    }

    updateNotificationsList() {
        const container = document.getElementById('notifications');
        
        if (this.notifications.length === 0) {
            container.innerHTML = '<p class="placeholder">No notifications received yet...</p>';
            return;
        }

        container.innerHTML = this.notifications.map(notification => `
            <div class="notification-item">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-body">${notification.body}</div>
                <div class="notification-time">${notification.timestamp}</div>
                ${Object.keys(notification.data).length > 0 ? `
                    <div class="notification-data">
                        Data: ${JSON.stringify(notification.data, null, 2)}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    updateStatus(type, message) {
        const statusElement = document.getElementById('status');
        const indicatorElement = document.getElementById('statusIndicator');
        const textElement = document.getElementById('statusText');

        statusElement.className = `status ${type}`;
        textElement.textContent = message;
    }

    showPermissionHelper() {
        const helper = document.getElementById('permissionHelper');
        if (helper) {
            helper.style.display = 'block';
        }
    }

    hidePermissionHelper() {
        const helper = document.getElementById('permissionHelper');
        if (helper) {
            helper.style.display = 'none';
        }
    }

    async retryPermission() {
        try {
            this.hidePermissionHelper();
            this.updateStatus('', 'Retrying notification permission...');
            
            // Request notification permission and get token
            await this.requestPermissionAndGetToken();
            
            // Update UI
            this.updateStatus('connected', 'Connected and ready to receive notifications');
            
        } catch (error) {
            console.error('Permission retry failed:', error);
            this.updateStatus('error', `Error: ${error.message}`);
            
            if (error.message.includes('permission')) {
                this.showPermissionHelper();
            }
        }
    }

    setupEventListeners() {
        // Copy token button
        document.getElementById('copyToken').addEventListener('click', () => {
            const tokenElement = document.getElementById('fcmToken');
            tokenElement.select();
            document.execCommand('copy');
            
            const button = document.getElementById('copyToken');
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        });

        // Refresh token button
        document.getElementById('refreshToken').addEventListener('click', () => {
            this.refreshToken();
        });

        // Send test notification button
        document.getElementById('sendTest').addEventListener('click', () => {
            this.sendTestNotification();
        });

        // Clear notifications button
        document.getElementById('clearNotifications').addEventListener('click', () => {
            this.notifications = [];
            this.updateNotificationsList();
        });

        // Retry permission button
        document.getElementById('retryPermission').addEventListener('click', () => {
            this.retryPermission();
        });
    }

    async sendTestNotification() {
        try {
            const serverUrl = document.getElementById('serverUrl').value;
            const button = document.getElementById('sendTest');
            
            if (!this.currentToken) {
                alert('No FCM token available. Please refresh the page.');
                return;
            }

            if (!serverUrl) {
                alert('Please enter a server URL.');
                return;
            }

            button.disabled = true;
            button.textContent = 'Sending...';

            const response = await fetch(`${serverUrl}/send-notification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: this.currentToken,
                    title: 'Test Notification',
                    body: 'This is a test notification from FCM Demo',
                    url: 'https://erabeacon-7e08e.web.app/'
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                alert('Test notification sent successfully!');
            } else {
                alert(`Error sending notification: ${result.error}`);
            }
        } catch (error) {
            console.error('Error sending test notification:', error);
            alert(`Error: ${error.message}`);
        } finally {
            const button = document.getElementById('sendTest');
            button.disabled = false;
            button.textContent = 'Send Test Notification';
        }
    }
}

// Initialize the FCM client when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FCMClient();
});
