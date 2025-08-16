import { auth, db } from "./firebaseConfig.js"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import{ setDoc, doc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js"

function showMessage(message, divId){
  var messageDiv = document.getElementById("messageDiv");
  // messageDiv.style.display="block";
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

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential)=>{
      const user = userCredential.user;
      const userData={
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
    })
  })