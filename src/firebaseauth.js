// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";



const firebaseConfig = {
  apiKey: "AIzaSyBuj2S9dq0kJst8UeBu1s9MCtN8xgCY3MQ",
  authDomain: "login-215dc.firebaseapp.com",
  projectId: "login-215dc",
  storageBucket: "login-215dc.appspot.com",
  messagingSenderId: "629611864275",
  appId: "1:629611864275:web:007307fe5bbe5e763ff426"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

function showMessage(message, divId) {
  var messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(function () {
    messageDiv.style.opacity = 0;
  }, 5000);
}

const signUp = document.getElementById('submitSignUp');
signUp.addEventListener('click', (event) => {
  event.preventDefault();

  const email = document.getElementById('rEmail').value;
  const password = document.getElementById('rPassword').value;
  const firstName = document.getElementById('fName').value;
  const lastName = document.getElementById('lName').value;
  const username = document.getElementById('username').value;

  const auth = getAuth();
  const db = getFirestore();

  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      const user = userCredential.user;

      const userData = {
        email: email,
        firstName: firstName,
        lastName: lastName,
        username: username,
        defaultSubjects: ["Math", "Science", "English"]
      };
      const docRef = doc(db, "users", user.uid);
      return setDoc(docRef, userData);
    })
    .then(() => {
      showMessage('Account Created Successfully', 'signUpMessage');
      window.location.href = 'index.html';
    })
    .catch(error => {
      const errorCode = error.code;
      if (errorCode === 'auth/email-already-in-use') {
        showMessage('Email Address Already Exists !!!', 'signUpMessage');
      } else {
        console.error("Signup error", error);
        showMessage('Unable to create User', 'signUpMessage');
      }
    });
});

const signIn = document.getElementById('submitSignIn');
signIn.addEventListener('click', (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const auth = getAuth();

  signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      showMessage('Login is successful', 'signInMessage');
      const user = userCredential.user;
      localStorage.setItem('loggedInUserId', user.uid);
      window.location.href = 'index.html';
    })
    .catch(error => {
      const errorCode = error.code;
      if (errorCode === 'auth/invalid-credential') {
        showMessage('Incorrect Email or Password', 'signInMessage');
      } else {
        showMessage('Account does not exist', 'signInMessage');
      }
    });
});

const auth = getAuth();
const db = getFirestore();

onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        localStorage.setItem('loggedInUsername', userData.username || user.email);

        // Optionally update UI element with id 'navbarUsername' if it exists
        const usernameSpan = document.getElementById('navbarUsername');
        if (usernameSpan) {
          usernameSpan.textContent = userData.username || user.email || "User";
        }
      }
    } catch (error) {
      console.error("Error fetching user Firestore data:", error);
    }
  } else {
    // User logged out, clean up
    localStorage.removeItem('loggedInUsername');
    const usernameSpan = document.getElementById('navbarUsername');
    if (usernameSpan) {
      usernameSpan.textContent = "";
    }
  }
});