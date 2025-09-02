// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: "AIzaSyChoaOV6LOc1euDzx2ZNQrB4N7SPcmKkC0",
//   authDomain: "trendnest-otpauth-321.firebaseapp.com",
//   projectId: "trendnest-otpauth-321",
//   storageBucket: "trendnest-otpauth-321.firebasestorage.app",
//   messagingSenderId: "59295419657",
//   appId: "1:59295419657:web:c3d7b541d2391f89c057d8",
//   measurementId: "G-HXQXTVZVVC"
// };

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { auth };
