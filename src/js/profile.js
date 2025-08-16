import { auth, db } from "./firebaseConfig.js"
import { collection, addDoc, getDocs, updateDoc, doc, getDoc, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js"

if (localStorage.getItem("loggedInUserId") == null) {
    window.location.href = "register.html"
}

async function logoutUser() {
    try {
        await signOut(auth);
        localStorage.removeItem("loggedInUserId");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error logging out:", error);
    }
}

async function loadData(userId) {
    try {
        const userRef = doc(db, "users", userId);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
            const userData = docSnap.data();
            console.log("User data loaded:", userData);
            return userData;
        } else {
            console.log("No user document found");
            return null;
        }
    } catch (e) {
        console.error("Error loading user data: ", e);
        return null;
    }
}

async function editData(userId, newData) {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, newData);
        console.log("Document updated successfully");
    } catch (e) {
        console.error("Error updating document: ", e);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const chBoxes = document.querySelectorAll('.dropdown-menu input.subjectProfileDrop[type="checkbox"]')
    const dpBtn = document.getElementById("multiSelectSubjectProfileDropdown")
    const logOutBtn = document.getElementById("logOutButton")
    const descriptionProfile = document.getElementById("descriptionProfile")
    const searchSubject = document.getElementById("dropdownSubjectProfileSearch")
    const userId = localStorage.getItem("loggedInUserId")
    if (userId) {
        const userData = loadData(userId)

        if (userData) {
            descriptionProfile.value = userData.description
            chBoxes.forEach((checkbox) => {
                if (userData.subjects.includes(checkbox.value)) {
                    checkbox.checked = true;
                }
            });
            
            const selectedText = userData.subjects.join(", ");
            dpBtn.innerText = selectedText;
        }
    }

    function handleCb() {
        let selected = []
        let selectedText = ""

        chBoxes.forEach((checkbox) => {
            if (checkbox.checked) {
                selected.push(checkbox.value)
                selectedText += checkbox.value + ", "
            }
        })
        
        editData(localStorage.getItem("loggedInUserId"), {subjects: selected})
        dpBtn.innerText = selected.length > 0 ? selectedText.slice(0, -2) : "Your subjects"
    }

    chBoxes.forEach((checkbox) => {
        checkbox.addEventListener("change", handleCb)
    })

    descriptionProfile.addEventListener("input", function() {
        editData(localStorage.getItem("loggedInUserId"), {description: descriptionProfile.value})
    })

    logOutBtn.addEventListener("click", function() {
        console.log("hihihi")
        logoutUser()
    })

    if (searchSubject) {
        searchSubject.addEventListener("input", function() {
            const filter = searchSubject.value.toLowerCase()
            
            document.querySelectorAll(".dropdown-menu li").forEach(function(li, idx) {
                if (li.classList.contains("dropdown-search")) return
                console.log("found input")
                const label = li.textContent.toLowerCase()
                const shouldShow = label.includes(filter)
                li.style.setProperty('display', shouldShow ? 'flex' : 'none', 'important')
            })
        })
    }
})