import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import{ getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY",
  authDomain: "login-215dc.firebaseapp.com",
  projectId: "login-215dc",
  storageBucket: "login-215dc.firebasestorage.app",
  messagingSenderId: "629611864275",
  appId: "1:629611864275:web:007307fe5bbe5e763ff426"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const db = getFirestore(app)