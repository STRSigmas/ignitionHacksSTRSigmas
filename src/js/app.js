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

    // add event listeners to location type checkboxes for filtering
    document.querySelectorAll('.locationDrop').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            // re-display spots with new filters if we have scored spots
            if (window.currentScoredSpots && window.currentScoredSpots.length > 0) {
                displaySpots(window.currentScoredSpots);
                addMarkersToMap(window.currentScoredSpots);
            }
        });
    });

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
            markers.forEach(marker => {
                if (marker.getTitle() === 'Your Location') {
                    marker.setMap(null);
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
    // const loading = document.getElementById('loading');
    const button = document.getElementById('findSpotsBtn');
    const addressInput = document.getElementById('addressInput');
    
    // loading.classList.remove('hidden');
    button.disabled = true;
    addressInput.value = '';
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                map.setCenter(userLocation);
                
                // clear previous user location marker
                markers.forEach(marker => {
                    if (marker.getTitle() === 'Your Location') {
                        marker.setMap(null);
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
                
                searchForStudySpots();
            },
            (error) => {
                console.error('geolocation error:', error);
                alert('Unable to get your location. Please enter an address manually.');
                // loading.classList.add('hidden');
                button.disabled = false;
            }
        );
    } else {
        alert('Geolocation is not supported by this browser. Please enter an address manually.');
        // loading.classList.add('hidden');
        button.disabled = false;
    }
}
// search for study locations
function searchForStudySpots() {
    studySpots = [];
    const searchPromises = [];

    const placeTypes = ['library', 'cafe', 'university', 'school', 'lodging', 'establishment'];

    const radiusSelect = document.getElementById('radiusSelect');
    const radiusValue = radiusSelect ? parseInt(radiusSelect.value, 10) : NaN;
    const selectedRadius = (!isNaN(radiusValue) && radiusValue > 0) ? Math.min(1000 * radiusValue, 5000) : 5000; // default to 5km, cap at 5km

    // create a search request for each place type
    placeTypes.forEach(type => {
        const request = {
            location: userLocation,
            radius: selectedRadius,
            type: type,
            keyword: type === 'cafe' ? 'cafe coffee' :
                    type === 'library' ? 'book books read reading' :
                    type === 'university' ? 'university' :
                    type === 'school' ? 'tutoring enroll learn' :
                    type === 'lodging' ? 'lobby rooms' :
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
                                placeType: type  // Store the type string, not the place object
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
        console.log(studySpots.length, 'study spots found');
        getDetailedPlaceInfo();
        studySpots.forEach(element => {
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
function analyzeReviewsForStudyKeywords(reviews) {
    if (!reviews || reviews.length === 0) return { score: 0, keywords: [] }; // if no reviews, return 0 score

    const studyKeywords = [
        'wifi', 'internet', 'laptop', 'study', 'studying', 'quiet', 'peaceful',
        'work', 'working', 'outlets', 'power', 'charging', 'table', 'desk',
        'focused', 'concentration', 'homework', 'reading', 'library-like',
        'cozy', 'comfortable seating', 'spacious', 'good lighting'
    ];
    
    const negativeKeywords = [
        'loud', 'noisy', 'crowded', 'busy', 'no wifi', 'poor wifi', 'slow internet',
        'no outlets', 'uncomfortable', 'cramped', 'dark', 'distracting'
    ];
    
    let positiveCount = 0;
    let negativeCount = 0;
    const foundKeywords = [];

    // analyze each review for pos or neg keywords then add them to the corresponding counters
    reviews.forEach(review => {
        const text = review.text.toLowerCase();
        
        studyKeywords.forEach(keyword => {
            if (text.includes(keyword)) {
                positiveCount++;
                if (!foundKeywords.includes(keyword)) {
                    foundKeywords.push(keyword);
                }
            }
        });
        
        negativeKeywords.forEach(keyword => {
            if (text.includes(keyword)) {
                negativeCount++;
            }
        });
    });
    
    // calculate a net score from -15 to +15 based on the difference between pos and neg keywords
    const netScore = Math.max(0, Math.min(15, (positiveCount - negativeCount) * 2));
    
    return {
        score: netScore,
        keywords: foundKeywords.slice(0, 5),
        positiveCount,
        negativeCount
    };
}
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

    // rating scoring
    const rating = place.rating || 3;
    const ratingScore = (rating / 5) * 25;
    score += ratingScore;
    factors.rating = {
        value: rating + '/5 stars (' + (place.user_ratings_total || 0) + ' reviews)'
    };

    // review analysis scoring
    const reviewAnalysis = analyzeReviewsForStudyKeywords(place.reviews);
    score += reviewAnalysis.score;
    factors.studyFriendly = {
        value: reviewAnalysis.keywords.length > 0 ? 
               `Study features mentioned: ${reviewAnalysis.keywords.join(', ')}` : 
               'No specific study features mentioned in reviews'
    };

    // place type scoring with priorties
    const typeScores = {
        'library': 25,
        'cafe': 20,
        'university': 15,
        'lodging': 12,
        'school': 8,
        'establishment': 3
    };
    // determine type score and add to score accumulator
    const typeScore = typeScores[place.placeType] || 2;
    score += typeScore;
    // add type to factors
    factors.placeType = {
        value: place.placeType.charAt(0).toUpperCase() + place.placeType.slice(1)
    };

    // scoring based on hours (if it's open or closed rn)
    const isOpen = place.opening_hours?.open_now;
    const statusScore = isOpen ? 5 : 0;
    score += statusScore;
    factors.openStatus = {
        value: isOpen ? 'Currently open' : 'Currently closed'
    };
    
    return {
        totalScore: Math.min(100, score),
        factors: factors,
        distance: distance,
        reviewAnalysis: reviewAnalysis
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
    
    // store scored spots globally for filtering
    window.currentScoredSpots = scoredSpots;
    
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

    // get selected location types from dropdown
    const selectedTypes = getSelectedLocationTypes();
    
    // filter spots based on selected types (if any are selected)
    let filteredSpots = spots;
    if (selectedTypes.length > 0) {
        filteredSpots = spots.filter(spot => {
            // normalize the spot's place type for comparison
            const spotType = spot.placeType.toLowerCase();
            return selectedTypes.some(selectedType => {
                const normalizedSelectedType = selectedType.toLowerCase();
                // directly compare place types
                return spotType === normalizedSelectedType;
            });
        });
    }

    if (filteredSpots.length === 0) {
        spotsList.innerHTML = '<p>No study spots match your selected filters. Try adjusting your location type preferences.</p>';
        return;
    }

    // polish inner html later
    spotsList.innerHTML = filteredSpots.map((spot, index) => `
        <div style="border: 1px solid #ccc; margin: 10px; padding: 10px; border-radius: 5px; cursor: pointer;" onclick="panToLocation('${spot.place_id}')">
            <h4>${spot.name || 'Unknown Name'}</h4>
            <p><strong>Score:</strong> ${spot.scoreData.totalScore.toFixed(1)}/100</p>
            <p><strong>Distance:</strong> ${spot.scoreData.distance.toFixed(2)} km</p>
            <p><strong>Rating:</strong> ${spot.rating || 'No rating'} ⭐ (${spot.user_ratings_total || 0} reviews)</p>
            <p><strong>Address:</strong> ${spot.vicinity || 'No address'}</p>
            <p><strong>Type:</strong> ${spot.placeType}</p>
            <p><strong>Status:</strong> ${spot.opening_hours ? (spot.opening_hours.open_now ? '🟢 Open Now' : '🔴 Closed') : '❓ Hours Unknown'}</p>
        </div>
    `).join('');
    
    console.log(`Displayed ${filteredSpots.length} out of ${spots.length} spots after filtering`);
    return;
}

// helper function to get selected location types from dropdown
function getSelectedLocationTypes() {
    const checkboxes = document.querySelectorAll('.locationDrop:checked');
    return Array.from(checkboxes).map(checkbox => checkbox.value);
}
// display spots on map
function addMarkersToMap(spots) {
    // clear only study spot markers, preserve user location marker
    markers.forEach(marker => {
        if (marker.getTitle() !== 'Your Location') {
            marker.setMap(null);
        }
    });
    // keep only the user location marker
    markers = markers.filter(marker => marker.getTitle() === 'Your Location');
    
    // get selected location types from dropdown
    const selectedTypes = getSelectedLocationTypes();
    
    // filter spots based on selected types (if any are selected)
    let filteredSpots = spots;
    if (selectedTypes.length > 0) {
        filteredSpots = spots.filter(spot => {
            // normalize the spot's place type for comparison
            const spotType = spot.placeType.toLowerCase();
            return selectedTypes.some(selectedType => {
                const normalizedSelectedType = selectedType.toLowerCase();
                // directly compare place types
                return spotType === normalizedSelectedType;
            });
        });
    }
    
    // add markers for each filtered study spot
    filteredSpots.forEach((spot, index) => {
        const score = spot.scoreData.totalScore.toFixed(0);
        const color = getScoreColor(score);
        
        const marker = new google.maps.Marker({
            position: spot.geometry.location,
            map: map,
            title: `${spot.name} (Score: ${score}/100)`,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: color,
                fillOpacity: 0.9,
                strokeColor: '#ffffff',
                strokeWeight: 2
            }
        });
        
        // create info window for each marker
        const infoWindow = new google.maps.InfoWindow({
            content: createInfoWindowContent(spot)
        });
        
        // add click listener to marker to open info window
        marker.addListener('click', () => {
            markers.forEach(m => {
                if (m.infoWindow) m.infoWindow.close();
            });
            infoWindow.open(map, marker);
        });
        
        marker.infoWindow = infoWindow;
        markers.push(marker);
    });
    
    console.log(`Displayed ${filteredSpots.length} out of ${spots.length} markers after filtering`);
}
// pan to location on map when clicked
function panToLocation(placeId) {
    const spot = studySpots.find(s => s.place_id === placeId);
    if (!spot) return;
    
    const marker = markers.find(m => 
        m.getPosition().lat() === spot.geometry.location.lat() &&
        m.getPosition().lng() === spot.geometry.location.lng()
    );
    
    map.panTo(spot.geometry.location);
    map.setZoom(16);
    
    if (marker && marker.infoWindow) {
        markers.forEach(m => {
            if (m.infoWindow) m.infoWindow.close();
        });
        marker.infoWindow.open(map, marker);
    }
}
// display detailed location information on map popup when clicked
function createInfoWindowContent(spot) {
    const score = spot.scoreData.totalScore.toFixed(0);
    const color = getScoreColor(score);
    const factors = spot.scoreData.factors;
    
    return `
        <div style="max-width: 300px; font-family: Arial, sans-serif;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${spot.name}</h3>
            
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="background-color: ${color}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; margin-right: 10px;">
                    ${score}/100
                </span>
                <span style="color: #666;">Study Score</span>
            </div>
            
            <div style="margin-bottom: 8px;">
                <strong>📍 Distance:</strong> ${factors.distance?.value || 'Unknown'}
            </div>
            
            <div style="margin-bottom: 8px;">
                <strong>⭐ Rating:</strong> ${factors.rating?.value || 'No rating'}
            </div>
            
            <div style="margin-bottom: 8px;">
                <strong>🏢 Type:</strong> ${factors.placeType?.value || 'Unknown'}
            </div>
            
            <div style="margin-bottom: 8px;">
                <strong>🕒 Status:</strong> ${factors.openStatus?.value || 'Unknown'}
            </div>
            
            ${factors.studyFriendly?.value && factors.studyFriendly.value !== 'No specific study features mentioned in reviews' ? 
                `<div style="margin-bottom: 8px;">
                    <strong>📚 Study Features:</strong> ${factors.studyFriendly.value}
                </div>` : ''
            }
            
            ${spot.vicinity ? `<div style="margin-bottom: 8px; color: #666; font-size: 12px;">${spot.vicinity}</div>` : ''}
            
            ${spot.website ? `<div style="margin-top: 10px;"><a href="${spot.website}" target="_blank" style="color: #007bff;">Visit Website</a></div>` : ''}
        </div>
    `;
}