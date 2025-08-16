import { auth, db } from "./firebaseConfig.js"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import{ setDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js"

function showMessage(message, divId){
  var messageDiv = document.getElementById("messageDiv");
  messageDiv.innerHTML=message;
  messageDiv.style.opacity=1;
  setTimeout(function(){
    messageDiv.style.opacity=0;
  }, 5000);
}

  const signUp = document.getElementById('submitSignUp');
  signUp.addEventListener('click', (event)=>{
    event.preventDefault();

  const email = document.getElementById('rEmail').value;
  const password = document.getElementById('rPassword').value;
  const firstName = document.getElementById('fName').value;
  const lastName = document.getElementById('lName').value;
  const username = document.getElementById('username').value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      const user = userCredential.user;

      const userData = {
        email: email,
        firstName: firstName,
        lastName: lastName,
        subjects: [],
        anonymous: true,
        description: "",
        level: 0
      };
      showMessage('Account created successfully', 'signUpMessage');
      const docRef=doc(db, "users", user.uid);
      setDoc(docRef, userData)
      .then(()=>{
        window.location.href='index.html';
      })
      .catch((error)=>{
        console.error("error writing document", error);
      });
    })
    .catch((error)=>{
      const errorCode=error.code;
      if(errorCode=='auth/email-already-in-use'){
        showMessage('Email already exists', 'signUpMessage');
      }
      else {
        showMessage('Unable to create user', 'signUpMessage');
      }
    })
  });

  const signIn=document.getElementById('submitSignIn');
  signIn.addEventListener('click', (event)=>{
    event.preventDefault();
    const email= document.getElementById('email').value;
    const password= document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential)=>{
      console.log("login success")
      showMessage('Login successful', 'signInMessage');
      const user=userCredential.user;
      localStorage.setItem('loggedInUserId', user.uid);
      window.location.href='index.html';
    })
    .catch((error)=>{
      const errorCode = error.code;
      if (errorCode==='auth/invalid-credential'){
        showMessage('Incorrect credentials', 'signInMessage');
      }
      else{
        showMessage('Account does not exist', 'signInMessage');
      }
    });
});

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

document.addEventListener("DOMContentLoaded", function() {
    const levelOptions = document.querySelectorAll('.level-option');
    const levelButton = document.getElementById('levelDropdown');
    let selectedLevel = '';

    if (levelButton && levelOptions.length > 0) {
        levelOptions.forEach((option) => {
            option.addEventListener('click', function(e) {
                e.preventDefault();
                
                levelButton.textContent = this.textContent;
                selectedLevel = this.getAttribute('data-value');
                
                console.log('Selected level:', selectedLevel);
            });
        });
    }

    const signInButton = document.getElementById('signInButton');
    const signUpButton = document.getElementById('signUpButton');
    const signUpForm = document.getElementById('signup');
    const signInForm = document.getElementById('signIn');

    if (signInButton && signUpForm && signInForm) {
        signInButton.addEventListener('click', function(e) {
            e.preventDefault();
            signUpForm.style.display = 'none';
            signInForm.style.display = 'block';
        });
    }

    if (signUpButton && signInForm && signUpForm) {
        signUpButton.addEventListener('click', function(e) {
            e.preventDefault();
            signInForm.style.display = 'none';
            signUpForm.style.display = 'block';
        });
    }
});