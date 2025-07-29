// Firebase configuration
// Updated to match server project: even-trainer-464609-d1
const firebaseConfig = {
  apiKey: "AIzaSyCiaXUNxKWBmdWRk_IVSDe43Zy63aaoy3o",
  authDomain: "even-trainer-464609-d1.firebaseapp.com",
  projectId: "even-trainer-464609-d1",
  storageBucket: "even-trainer-464609-d1.firebasestorage.app",
  messagingSenderId: "1030502293200",
  appId: "1:1030502293200:web:bf03918e94d1dd6f8348d5"
    //measurementId: "your-measurement-id"
};

// VAPID Key for FCM
// Get this from Firebase Console for even-trainer-464609-d1 project
const vapidKey = "BNyF43jKNOdOASmZb3bEDkmsdaNp5jKmdV-RT8waAbZTvAU3iDhnEVlgH4Zuu6kQAD0Owv_y-NiD2y3GKl49gZg";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export for use in other files
window.firebaseConfig = firebaseConfig;
window.vapidKey = vapidKey;
