import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import{ getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBuj2S9dq0kJst8UeBu1s9MCtN8xgCY3MQ",
  authDomain: "login-215dc.firebaseapp.com",
  projectId: "login-215dc",
  storageBucket: "login-215dc.firebasestorage.app",
  messagingSenderId: "629611864275",
  appId: "1:629611864275:web:007307fe5bbe5e763ff426"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const db = getFirestore(app)