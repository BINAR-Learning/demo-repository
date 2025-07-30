const app = require('./app');
const PORT = process.env.PORT || 8080;
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

process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('👋 SIGINT received, shutting down gracefully');
    process.exit(0);
});

module.exports = server;
