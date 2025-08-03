// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1NuBMgAaOW6WzA1P3_pQmR0ecyGclDhM",
  authDomain: "friendship-e96b6.firebaseapp.com",
  projectId: "friendship-e96b6",
  storageBucket: "friendship-e96b6.firebasestorage.app",
  messagingSenderId: "184428196598",
  appId: "1:184428196598:web:0d0170285b4a6af00572d7",
  measurementId: "G-M84TGYDY9M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const functions = getFunctions(app);

export { app, analytics, db, functions };
export default firebaseConfig;
