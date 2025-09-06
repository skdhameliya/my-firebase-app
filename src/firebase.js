// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // 👈 add this

// 🔹 Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBPvjQeVkLs-gxZdpVOq7AnKSPXhJqRJII",
  authDomain: "offer-near-me-10.firebaseapp.com",
  projectId: "offer-near-me-10",
  storageBucket: "offer-near-me-10.firebasestorage.app",
  messagingSenderId: "1040045814774",
  appId: "1:1040045814774:web:1829d4b10ebb3b5618cdd7",
  measurementId: "G-WNW6873GW6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // 👈 initialize auth
const analytics = getAnalytics(app);

// console.log(app)
// console.log(db)

export { db, auth, analytics };
