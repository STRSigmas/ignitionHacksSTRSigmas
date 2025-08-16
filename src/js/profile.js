import { auth, db } from "./firebaseConfig.js"
import { collection, addDoc, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js"

if (localStorage.getItem("loggedInUserId") == null) {
    window.location.href = "register.html"
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
    const searchSubject = document.getElementById("dropdownSubjectProfileSearch")

    function handleCb() {
        let selected = []
        let selectedText = ""

        chBoxes.forEach((checkbox) => {
            if (checkbox.checked) {
                selected.push(checkbox.value)
                selectedText += checkbox.value + ", "
            }
        })
        
        editData(localStorage.getItem("loggedInUserId"), )
        dpBtn.innerText = selected.length > 0 ? selectedText.slice(0, -2) : "Your subjects"
    }

    chBoxes.forEach((checkbox) => {
        checkbox.addEventListener("change", handleCb)
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