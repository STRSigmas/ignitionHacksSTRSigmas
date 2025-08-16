document.addEventListener("DOMContentLoaded", function() {
    const chBoxes = document.querySelectorAll('.dropdown-menu input.locationDrop[type="checkbox"]')
    const chSubjectBoxes = document.querySelectorAll('.dropdown-menu input.subjectDrop[type="checkbox"]')
    const dpBtn = document.getElementById("multiSelectDropdown")
    const dpSubjectBtn = document.getElementById("multiSelectSubjectDropdown")
    const searchSubject = document.getElementById("dropdownSubjectSearch")

    function handleCb() {
        let selected = []
        let selectedText = ""

        chBoxes.forEach((checkbox) => {
            if (checkbox.checked) {
                selected.push(checkbox.value)
                selectedText += checkbox.value + ", "
            }
        })

        dpBtn.innerText = selected.length > 0 ? selectedText.slice(0, -2) : "Location types"
    }

    function handleSubjectCb() {
        let selected = []
        let selectedText = ""

        chSubjectBoxes.forEach((checkbox) => {
            if (checkbox.checked) {
                selected.push(checkbox.value)
                selectedText += checkbox.value + ", "
            }
        })

        dpSubjectBtn.innerText = selected.length > 0 ? selectedText.slice(0, -2) : "Subjects"
    }

    chBoxes.forEach((checkbox) => {
        checkbox.addEventListener("change", handleCb)
    })

    chSubjectBoxes.forEach((checkbox) => {
        checkbox.addEventListener("change", handleSubjectCb)
    })
    
    if (searchSubject) {
        searchSubject.addEventListener("input", function() {
            const filter = searchSubject.value.toLowerCase()

            document.querySelectorAll(".dropdown-menu li").forEach(function(li, idx) {
                if (li.classList.contains("dropdown-search")) return
                const label = li.textContent.toLowerCase()
                li.style.display = label.includes(filter) ? "" : "none"
            })
        })
    }
})