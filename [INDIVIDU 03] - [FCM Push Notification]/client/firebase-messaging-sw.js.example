// Firebase Messaging Service Worker
// This file must be served from the root domain (e.g., https://yoursite.com/firebase-messaging-sw.js)

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Firebase configuration (must match your main app config)
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id",
    measurementId: "your-measurement-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Background message received:', payload);

    // Customize notification
    const notificationTitle = payload.notification?.title || 'FCM Notification';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new message',
        icon: payload.notification?.icon || '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: {
            ...payload.data,
            url: payload.data?.url || 'https://erabeacon-7e08e.web.app/'
        },
        actions: [
            {
                action: 'open',
                title: 'Open'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ],
        requireInteraction: false,
        silent: false
    };

    // Show notification
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);
    
    // Close the notification
    event.notification.close();
    
    // Handle different actions
    if (event.action === 'dismiss') {
        console.log('Notification dismissed');
        return;
    }
    
    // Get the URL from notification data
    const urlToOpen = event.notification.data?.url || 'https://erabeacon-7e08e.web.app/';
    
    // Open URL in new tab/window
    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((clientList) => {
            // Check if there's already a window/tab open with the target URL
            for (const client of clientList) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // If no existing window/tab, open new one
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Handle notification close events
self.addEventListener('notificationclose', (event) => {
    console.log('Notification closed:', event);
    
    // Optional: Track notification dismissal
    // You can send analytics or other tracking data here
});

// Handle push events (for additional custom processing)
self.addEventListener('push', (event) => {
    console.log('Push event received:', event);
    
    // This is handled automatically by Firebase Messaging
    // but you can add custom logic here if needed
});

// Handle service worker installation
self.addEventListener('install', (event) => {
    console.log('Service Worker installing');
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating');
    // Take control of all clients immediately
    event.waitUntil(self.clients.claim());
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
    console.log('Service Worker received message:', event.data);
    
    // Handle different message types
    switch (event.data?.type) {
        case 'GET_REGISTRATION_TOKEN':
            // Return the current registration token
            event.ports[0].postMessage({
                type: 'REGISTRATION_TOKEN',
                token: self.registration.token
            });
            break;
            
        case 'CLEAR_NOTIFICATIONS':
            // Clear all notifications
            self.registration.getNotifications().then((notifications) => {
                notifications.forEach(notification => notification.close());
            });
            break;
            
        default:
            console.log('Unknown message type:', event.data?.type);
    }
});
