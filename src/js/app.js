let map;
let service;
let geocoder;
let autocompleteService;
let markers = [];
let userLocation;
let studySpots = [];
let autocompleteResults = [];

function initMap() {
    console.log("initializing map");
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 43.6532, lng: -79.3832 },
        zoom: 13
    });

    service = new google.maps.places.PlacesService(map); // for searceshing nearby plac
    geocoder = new google.maps.Geocoder(); // for converting addresses to coordinates
    autocompleteService = new google.maps.places.AutocompleteService(); // for address autocomplete
    console.log("map initialized. geocoder and autocomplete service ready");

    // add event listeners to neccessary elements
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

    // detail modal pops up in the map when clicking on a location
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
    const input = event.target.value.trim(); // get the input value from the address input field
    const dropdown = document.getElementById('autocompleteDropdown');

    // hide dropdown if input is too short
    if (input.length < 3) {
        dropdown.classList.add('hidden');
        return;
    }

    if (!autocompleteService) {
        console.error("autocompleteService not available");
        return;
    }

    const request = {
        input: input,
        types: ['geocode'] // only return geographic locations
    };

    autocompleteService.getPlacePredictions(request, (predictions, status) => {
        console.log("autocomplete status: ", status, "predictions: ", predictions);

        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            autocompleteResults = predictions;
            displayAutocompleteResults(predictions);
        } else {
            dropdown.classList.add('hidden');
        }
    });
}
// address autocomplete display
function displayAutocompleteResults(predictions) {
    const dropdown = document.getElementById('autocompleteDropdown');
    
    dropdown.innerHTML = predictions.slice(0, 5).map((prediction, index) => `
        <div class="autocomplete-item" data-index="${index}">
            <div class="prediction-main">${prediction.structured_formatting.main_text}</div>
            <div class="prediction-secondary">${prediction.structured_formatting.secondary_text || ''}</div>
        </div>
    `).join('');

    // add click listeners to autocomplete items
    dropdown.querySelectorAll('.autocomplete-item').forEach((item, index) => {
        item.addEventListener('click', () => selectAutocompleteItem(index));
    });
    
    dropdown.classList.remove('hidden');
}
// handle autocomplete selection
function selectAutocompleteItem(index) {
    const prediction = autocompleteResults[index];
    const addressInput = document.getElementById('addressInput');
    const dropdown = document.getElementById('autocompleteDropdown');
    
    // set input value to the selected address
    addressInput.value = prediction.description;
    dropdown.classList.add('hidden');
    
    // geocode selected address
    geocodeSelectedAddress(prediction.description);
}
// geocode selected address
function geocodeSelectedAddress(address) {
    console.log('geocoding selected address:', address);
    
    if (!geocoder) {
        alert('geocoding service not available');
        return;
    }
    
    
    geocoder.geocode({ address: address }, (results, status) => {
        console.log('geocoding status:', status, 'results:', results);
        if (status === 'OK' && results[0]) {
            userLocation = {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng()
            };
            
            // pan to user location
            console.log('found location:', userLocation);
            map.setCenter(userLocation);
            map.setZoom(15);
            
            // clear previous user location marker
            markers.forEach((marker, index) => {
                if (marker.getTitle() === 'Your Location') {
                    marker.setMap(null);
                    markers.splice(index, 1); // remove from array
                }
            });
            
            // add new user location marker
            const userMarker = new google.maps.Marker({
                position: userLocation,
                map: map,
                title: 'Your Location',
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="blue">
                            <circle cx="12" cy="12" r="8"/>
                            <circle cx="12" cy="12" r="3" fill="white"/>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(48, 48)
                }
            });
            
            // add to markers array so it can be cleared later
            markers.push(userMarker);
            
            console.log(`location set: ${results[0].formatted_address}`);
        } else {
            console.error('geocoding failed:', status);
            alert(`could not find the address: ${address}. error: ${status}`);
        }
    });
}
// start handling finding study locations
function findStudySpots() {
    console.log("finding study spots");
    const button = document.getElementById('findSpotsBtn');
    const addressInput = document.getElementById('addressInput');

    if (!userLocation) {
        alert("Please search for a location or use your own location first.");
        return;
    }

    button.disabled = true;

    searchForStudySpots();
}
// use current location
function useCurrentLocation() {
    console.log("using current location");
}
// search for study locations
function searchForStudySpots() {
    studySpots = [];
    const searchPromises = [];

    const placeTypes = ['library', 'cafe', 'university', 'book_store', 'restaurant', 'school', 'lodging', 'establishment'];

    const radiusSelect = document.getElementById('radiusSelect');
    const radiusValue = radiusSelect ? parseInt(radiusSelect.value, 10) : NaN;
    const selectedRadius = (!isNaN(radiusValue) && radiusValue > 0) ? Math.min(1000 * radiusValue, 5000) : 5000; // default to 5km, cap at 5km

    // create a search request for each place type
    placeTypes.forEach(type => {
        const request = {
            location: userLocation,
            radius: selectedRadius,
            type: type,
            keyword: type === 'cafe' ? 'wifi quiet study' :
                    type === 'library' ? 'quiet study book books' :
                    type === 'university' ? 'study group' :
                    type === 'book_store' ? 'reading nook' :
                    type === 'restaurant' ? 'study friendly' :
                    type === 'school' ? 'tutoring' :
                    type === 'lodging' ? 'lobby study retreat wifi' :
                    type === 'establishment' ? 'coworking study spot space' : 'study'
        };

        // put google api calls for nearbySearch in an array of promises
        // this is to avoid using a million callbacks and so all searches happen at once
        const promise = new Promise((resolve) => {
            service.nearbySearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    results.forEach(place => {
                        if (!studySpots.find(spot => spot.place_id === place.place_id)) { // avoid duplicates
                            studySpots.push({
                                ...place,
                                placeType: place
                            });
                        }
                    });
                }
                resolve();
            });
        });

        searchPromises.push(promise); // add promise to array
    });

    Promise.all(searchPromises).then(() => { // when all promises resolve
        console.log(studySpots.length, "study spots found");
        getDetailedPlaceInfo();
        studySpots.forEach(element => {
            console.log("found study spot:", element.name, "at", element.vicinity);
        });
    });
}
// acquire specific location details
function getDetailedPlaceInfo() {
    // create a detail promise for each study spot. the details are listed in the fields property in the request
    const detailPromises = studySpots.map(spot => {
        return new Promise((resolve) => { 
            const request = {
                placeId: spot.place_id,
                fields: [
                    'name', 'rating', 'user_ratings_total', 'price_level',
                    'opening_hours', 'formatted_phone_number', 'website',
                    'reviews', 'types', 'editorial_summary', 'business_status'
                ]
            };
            
            // use the google places service to get details for each spot
            service.getDetails(request, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    Object.assign(spot, place);
                }
                resolve();
            });
        });
    });
    
    Promise.all(detailPromises).then(() => { // when all promises resolve
        scoreAndDisplaySpots();
    });
}
// calculate distance
function calculateDistance(lat1, lng1, lat2, lng2) {
    // use the haversine formula; distance between two points on a sphere depending on lat/long
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}
// analyze study location reviews
// calculate score for study location hours
// calculate general score for study location
function calculateScore(place) {
    const distance = calculateDistance(
        userLocation.lat, userLocation.lng,
        place.geometry.location.lat(), place.geometry.location.lng()
    );
    
    let score = 0;
    const factors = {};
    
    // account for radius selection in distance scoring
    const radiusSelect = document.getElementById('radiusSelect');
    const radiusValue = radiusSelect ? parseInt(radiusSelect.value, 10) : 5; // default to 5km
    const searchRadius = (!isNaN(radiusValue) && radiusValue > 0) ? radiusValue : 5; // ensure valid number
    const maxDistance = searchRadius;
    
    let distanceScore;
    const optimalDistance = Math.min(2, searchRadius * 0.4); // lowkey arbitrarily chosen numbers; optimal distance is 40% of search radius or 2km, whichever is smaller
    
    if (distance <= optimalDistance) {
        distanceScore = 30; // full points close locations (30)
    } else {
        distanceScore = Math.max(0, (maxDistance - distance) / (maxDistance - optimalDistance) * 30);
    }
    score += distanceScore;
    factors.distance = {
        value: distance.toFixed(2) + ' km away'
    };

    // implement all other scoring later
    
    console.log("calculated score for", place.name, ":", score);
    return {
        totalScore: Math.min(100, score),
        factors: factors,
        distance: distance,
        // reviewAnalysis: reviewAnalysis
    };
}
// get color corresponding to score (range from red to green)
function getScoreColor(score) {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    if (score >= 40) return '#e67e22';
    return '#e74c3c';
}
// manage display of study locations in list and on map
function scoreAndDisplaySpots() {
    // map study spots to their scores
    const scoredSpots = studySpots.map(place => {
        const scoreData = calculateScore(place);
        return {
            ...place,
            scoreData: scoreData
        };
    });
    
    // sort scored spots by total score in descending order
    scoredSpots.sort((a, b) => b.scoreData.totalScore - a.scoreData.totalScore);
    
    // call our functions to display the scored spots in the list and on the map
    displaySpots(scoredSpots);
    addMarkersToMap(scoredSpots);
    
    // manage loading ui elements
    // const loading = document.getElementById('loading');
    const button = document.getElementById('findSpotsBtn');
    // loading.classList.add('hidden');
    button.disabled = false;
}
// display spots in list
function displaySpots(spots) {
    const spotsList = document.getElementById('spotsList');
    
    if (spots.length === 0) {
        spotsList.innerHTML = '<p>No study spots found nearby. Try a different location.</p>';
        return;
    }

    // write inner html later
    return;
}
// display spots on map
function addMarkersToMap(spots) {
    
}
// pan to location on map when clicked
// display detailed location information on map popup when clicked