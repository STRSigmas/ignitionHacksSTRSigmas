let map;
let service;
let geocoder;
let autocompleteService;
let markers = [];

function initMap() {
    console.log("initializing map");
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 43.6532, lng: -79.3832 },
        zoom: 13
    });

    service = new google.maps.places.PlacesService(map);
    geocoder = new google.maps.Geocoder();
    autocompleteService = new google.maps.places.AutocompleteService();
    console.log("map initialized. geocoder and autocomplete service ready");

    // document.getElementById('findSpotsBtn').addEventListener('click', findStudySpots);
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
    const input = event.target.value.trim();
    const dropdown = document.getElementById('autocompleteDropdown');

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
            
            console.log('found location:', userLocation);
            map.setCenter(userLocation);
            map.setZoom(15);
            
            // Clear previous user location marker
            markers.forEach(marker => {
                if (marker.getTitle() === 'Your Location') {
                    marker.setMap(null);
                }
            });
            
            new google.maps.Marker({
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
            
            console.log(`location set: ${results[0].formatted_address}`);
        } else {
            console.error('geocoding failed:', status);
            alert(`could not find the address: ${address}. error: ${status}`);
        }
    });
}
// start finding study locations
function findStudySpots() {

}
// use current location
function useCurrentLocation() {
    console.log("using current location");
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