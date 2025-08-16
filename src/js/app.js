let map;
let service;

// map initialization
function initMap() {
    console.log("initializing map");
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 43.6532, lng: -79.3832 }, // default to toronto
        zoom: 13
    });

    service = new google.maps.places.PlacesService(map);
    geocoder = new google.maps.Geocoder();
}
// address input handling
// address autocomplete display
// handle autocomplete selection
// geocode selected address
// start finding study locations
// use current location
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