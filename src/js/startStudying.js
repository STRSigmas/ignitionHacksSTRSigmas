import { auth, db } from "./firebaseConfig.js"
import { collection, addDoc, getDocs, updateDoc, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js"

async function checkDocumentExists(collectionName, documentId) {
    try {
        const docRef = doc(db, collectionName, documentId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            console.log("Document exists! Data:", docSnap.data());
            return { exists: true, data: docSnap.data() };
        } else {
            console.log("Document does not exist");
            return { exists: false, data: null };
        }
    } catch (error) {
        console.error("Error checking document:", error);
        return { exists: false, data: null };
    }
}

async function editData(placeId, newData) {
    try {
        const placeRef = doc(db, "places", placeId);
        await updateDoc(placeRef, newData);
        console.log("Document updated successfully");
    } catch (e) {
        console.error("Error updating document: ", e);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const startBtn = document.getElementById("startButton")

    startBtn.addEventListener("click", async function() {
        window.location.href="index.html" 
        const placeId = localStorage.getItem("selectedPlaceId");
          
        
        if (placeId) {
            console.log("Checking place:", placeId);
            const result = await checkDocumentExists("places", placeId);
            
            if (result.exists) {
                const currentStudiers = result.data.studiers || 0;
                await editData(placeId, {studiers: currentStudiers + 1});
                console.log(`Updated studiers to: ${currentStudiers + 1}`);
            } else {
                const placeRef = doc(db, "places", placeId);
                await setDoc(placeRef, {
                    studiers: 1,
                    placeId: placeId,
                    createdAt: new Date()
                });
                console.log("Created new place document with 1 studier");
            }
        } else {
            console.log("No placeId found in localStorage");
        }
    })
})