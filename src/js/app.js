let map;
let service;
let geocoder;
let autocompleteService

// map initialization
function initMap() {
    console.log("initializing map");
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 43.6532, lng: -79.3832 }, // default to toronto
        zoom: 13
    });

    service = new google.maps.places.PlacesService(map);
    geocoder = new google.maps.Geocoder();
    autocompleteService = new google.maps.places.AutocompleteService();
    console.log("map initialized. geocoder and autocomplete service ready");

    document.getElementById('findSpotsBtn').addEventListener('click', findStudySpots);
    document.getElementById('useLocationBtn').addEventListener('click', useCurrentLocation);
    document.getElementById('addressInput').addEventListener('input', handleAddressInput);

    // hide dropdown when clicking outside
    document.addEventListener('click', (event) => {
        const dropdown = document.getElementById('autocompleteDropdown');
        const addressInput = document.getElementById('addressInput');
        if (!dropdown.contains(event.target) && event.target !== addressInput) {
            dropdown.classList.add('hidden');
        }
    });

    // detail modal pops up when clicking on a location
    const modal = document.getElementById("detailModal");
    const closeBtn = modal.querySelector(".close");
    closeBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
    });

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.classList.add("hidden");
        }
    }); 

}
// address input handling
function handleAddressInput() {

}
// address autocomplete display
// handle autocomplete selection
// geocode selected address
// start finding study locations
function findStudySpots() {

}
// use current location
function useCurrentLocation() {

}
// search for study locations
// acquire specific location details
// calculate distance
// analyze study location reviews
// calculate score for study location hours
// calculate general score for study location
// get color corresponding to score (range from red to green)
// manage display of study locations in list and on map
// display spots in list
// display spots on map
// pan to location on map when clicked
// display detailed location information on map popup when clicked