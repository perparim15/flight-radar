// Initialize variables
let map;
let flights = [];
let planeMarkers = {};
let liveUpdates = true;
let countryLayers = {
    active: [],
    inactive: []
};

// Initialize map
function initMap() {
    // Create map centered on the region
        map = L.map('map').setView([42.0, 20.0], 8);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Set map bounds to Europe
    map.setMaxBounds([
        [MAP_BOUNDS.south, MAP_BOUNDS.west], // Southwest corner
        [MAP_BOUNDS.north, MAP_BOUNDS.east]  // Northeast corner
    ]);

    // Load GeoJSON data for countries
    loadCountryBoundaries();
}

// Load and process country boundaries from GeoJSON
function loadCountryBoundaries() {
    // If using a real service, you'd use this code:
    // const countriesLayer = new L.GeoJSON.AJAX(GEOJSON_PATH, {
    //     style: styleCountry,
    //     onEachFeature: onEachCountry
    // });
    // countriesLayer.addTo(map);
    
    // For the sake of this example, we'll create a simplified version
    // In a real implementation, you'd use the GeoJSON data from the URL

    // Create a simplified fetch for the GeoJSON file
    fetch(GEOJSON_PATH)
        .then(response => response.json())
        .then(data => {
            // Process the GeoJSON data
            L.geoJSON(data, {
                style: styleCountry,
                onEachFeature: onEachCountry
            }).addTo(map);
            
            // After adding countries, add airport markers
            addAirportMarkers();
        })
        .catch(error => {
            console.error("Error loading GeoJSON:", error);
            // If GeoJSON fails, still add airport markers
            addAirportMarkers();
        });
}

// Style function for countries
function styleCountry(feature) {
    const countryCode = feature.properties.ISO_A3;
    
    if (TARGET_COUNTRIES.includes(countryCode)) {
        return {
            fillColor: '#3498db',
            weight: 2,
            opacity: 1,
            color: '#2980b9',
            fillOpacity: 0.2,
            className: 'active-country'
        };
    } else {
        return {
            fillColor: '#000000',
            weight: 1,
            opacity: 0.5,
            color: '#666666',
            fillOpacity: 0.1,
            className: 'inactive-country'
        };
    }
}

// Process each country in the GeoJSON
function onEachCountry(feature, layer) {
    const countryCode = feature.properties.ISO_A3;
    const countryName = feature.properties.NAME;
    
    // Store reference to the layer
    if (TARGET_COUNTRIES.includes(countryCode)) {
        countryLayers.active.push(layer);
        
        // Add popup for active countries
        layer.bindPopup(`<b>${countryName}</b>`);
    } else {
        countryLayers.inactive.push(layer);
    }
}

// Add airport markers to the map
function addAirportMarkers() {
    AIRPORTS.forEach(airport => {
        const marker = L.marker([airport.lat, airport.lng], {
            icon: L.divIcon({
                html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#e74c3c" d="M22,16v-2l-8.5-5V3.5C13.5,2.67,12.83,2,12,2s-1.5,0.67-1.5,1.5V9L2,14v2l8.5-2.5V19L8,20.5L8,22l4-1l4,1l0-1.5L13.5,19v-5.5L22,16z"/>
                      </svg>`,
                className: 'airport-icon',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            })
        }).addTo(map);
        
        marker.bindPopup(`<b>${airport.name}</b><br>${airport.city}, ${airport.country}<br>IATA: ${airport.iata} / ICAO: ${airport.icao}`);
        
        // Add to airport list in sidebar
        const airportDiv = document.createElement('div');
        airportDiv.className = 'airport-item';
        airportDiv.innerHTML = `
            <strong>${airport.name}</strong> (${airport.iata})<br>
            ${airport.city}, ${airport.country}
            <button class="toggle-flights">Show Flights</button>
            <div class="flight-list" id="flights-${airport.id}"></div>
        `;
        document.getElementById('airport-list').appendChild(airportDiv);
        
        // Add event listener for toggling flights
        const toggleButton = airportDiv.querySelector('.toggle-flights');
        toggleButton.addEventListener('click', function() {
            const flightList = document.getElementById(`flights-${airport.id}`);
            if (flightList.style.display === 'none' || !flightList.style.display) {
                flightList.style.display = 'block';
                toggleButton.textContent = 'Hide Flights';
                updateAirportFlights(airport.id);
            } else {
                flightList.style.display = 'none';
                toggleButton.textContent = 'Show Flights';
            }
        });
    });
}

// Function to create airplane icon with rotation
function createAirplaneIcon(heading) {
    return L.divIcon({
        html: `<svg width="20" height="20" viewBox="0 0 24 24" style="transform: rotate(${heading}deg)">
                <path fill="#3498db" d="M22,16v-2l-8.5-5V3.5C13.5,2.67,12.83,2,12,2s-1.5,0.67-1.5,1.5V9L2,14v2l8.5-2.5V19L8,20.5L8,22l4-1l4,1l0-1.5L13.5,19v-5.5L22,16z"/>
              </svg>`,
        className: 'plane-icon',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
}

// Generate mock flight data
function generateMockFlights() {
    // Clear previous flights
    flights = [];
    
    // Generate 15-25 flights
    const flightCount = Math.floor(Math.random() * 11) + 15;
    
    for (let i = 0; i < flightCount; i++) {
        const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
        const flightNumber = airline + Math.floor(Math.random() * 9000 + 1000);
        const aircraft = AIRCRAFT_TYPES[Math.floor(Math.random() * AIRCRAFT_TYPES.length)];
        
        // Select origin/destination
        const homeAirport = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
        let destAirport;
        
        const isArrival = Math.random() > 0.5;
        
        if (isArrival) {
            const dest = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
            destAirport = {
                name: `${dest.city} Airport`,
                city: dest.city,
                iata: dest.iata,
                lat: null,
                lng: null
            };
        } else {
            const destIndex = Math.floor(Math.random() * DESTINATIONS.length);
            destAirport = {
                name: `${DESTINATIONS[destIndex].city} Airport`,
                city: DESTINATIONS[destIndex].city,
                iata: DESTINATIONS[destIndex].iata,
                lat: null,
                lng: null
            };
        }
        
        // Generate position based on origin/destination and progress
        let position, bearing, status, eta;
        
        if (isArrival) {
            // Flight is arriving to home airport
            const direction = Math.random() * 360;
            const distance = Math.random() * 50 + 10; // 10-60 km away
            
            // Calculate position based on direction and distance
            const lat = homeAirport.lat + (distance / 111) * Math.cos(direction * Math.PI / 180);
            const lng = homeAirport.lng + (distance / (111 * Math.cos(homeAirport.lat * Math.PI / 180))) * Math.sin(direction * Math.PI / 180);
            
            position = [lat, lng];
            
            // Calculate bearing to airport (opposite of direction)
            bearing = (direction + 180) % 360;
            
            // Set status and ETA
            if (distance < 20) {
                status = 'Approaching';
                eta = `${Math.floor(distance * 3 + 5)} minutes`;
            } else {
                status = 'En Route';
                eta = `${Math.floor(distance * 3 + 15)} minutes`;
            }
            
            // Add to airport arrivals
            const airport = AIRPORTS.find(a => a.id === homeAirport.id);
            if (airport) {
                airport.arrivals.push({
                    flight: flightNumber,
                    from: destAirport.city,
                    eta: eta,
                    status: status
                });
            }
        } else {
            // Flight is departing from home airport
            const direction = Math.random() * 360;
            const distance = Math.random() * 30; // 0-30 km away
            
            // Calculate position based on direction and distance
            const lat = homeAirport.lat + (distance / 111) * Math.cos(direction * Math.PI / 180);
            const lng = homeAirport.lng + (distance / (111 * Math.cos(homeAirport.lat * Math.PI / 180))) * Math.sin(direction * Math.PI / 180);
            
            position = [lat, lng];
            
            // Calculate bearing from airport (same as direction)
            bearing = direction;
            
            // Set status and ETA
            if (distance < 5) {
                status = 'Departing';
                eta = `Just departed`;
            } else {
                status = 'En Route';
                eta = `${Math.floor(120 + Math.random() * 60)} minutes to ${destAirport.city}`;
            }
            
            // Add to airport departures
            const airport = AIRPORTS.find(a => a.id === homeAirport.id);
            if (airport) {
                airport.departures.push({
                    flight: flightNumber,
                    to: destAirport.city,
                    departed: `${Math.floor(distance * 3)} minutes ago`,
                    status: status
                });
            }
        }
        
        // Add flight to list
        flights.push({
            id: i,
            callsign: flightNumber,
            airline: airline,
            flightNumber: flightNumber.substring(airline.length),
            aircraft: aircraft,
            origin: isArrival ? destAirport : homeAirport,
            destination: isArrival ? homeAirport : destAirport,
            position: position,
            altitude: Math.floor(Math.random() * 30000) + 5000,
            speed: Math.floor(Math.random() * 300) + 400,
            heading: bearing,
            status: status,
            eta: eta
        });
    }
    
    return flights;
}

// Update airport flight lists
function updateAirportFlights(airportId) {
    const airport = AIRPORTS.find(a => a.id === airportId);
    const flightListEl = document.getElementById(`flights-${airportId}`);
    
    if (!flightListEl) return;
    
    // Clear existing flight items
    flightListEl.innerHTML = '';
    
    // Add arrivals
    if (airport.arrivals.length > 0) {
        const arrivalsHeading = document.createElement('h3');
        arrivalsHeading.textContent = 'Arrivals';
        flightListEl.appendChild(arrivalsHeading);
        
        airport.arrivals.forEach(flight => {
            const flightItem = document.createElement('div');
            flightItem.className = 'flight-item arrival';
            flightItem.innerHTML = `
                <strong>${flight.flight}</strong> from ${flight.from}<br>
                ETA: ${flight.eta} | ${flight.status}
            `;
            flightListEl.appendChild(flightItem);
        });
    }
    
    // Add departures
    if (airport.departures.length > 0) {
        const departuresHeading = document.createElement('h3');
        departuresHeading.textContent = 'Departures';
        flightListEl.appendChild(departuresHeading);
        
        airport.departures.forEach(flight => {
            const flightItem = document.createElement('div');
            flightItem.className = 'flight-item departure';
            flightItem.innerHTML = `
                <strong>${flight.flight}</strong> to ${flight.to}<br>
                Departed: ${flight.departed} | ${flight.status}
            `;
            flightListEl.appendChild(flightItem);
        });
    }
}

// Update plane positions
function updatePlanePositions() {
    // For each flight
    flights.forEach(flight => {
        // Update position slightly (simulate movement)
        const direction = flight.heading * Math.PI / 180;
        const speedFactor = flight.speed / 3600; // Convert knots to deg/s approximately
        
        flight.position = [
            flight.position[0] + Math.cos(direction) * speedFactor * 0.0002,
            flight.position[1] + Math.sin(direction) * speedFactor * 0.0002
        ];
        
        // Update or create marker
        if (planeMarkers[flight.id]) {
            planeMarkers[flight.id].setLatLng(flight.position);
            
            // Update icon rotation
            const icon = createAirplaneIcon(flight.heading);
            planeMarkers[flight.id].setIcon(icon);
        } else {
            const icon = createAirplaneIcon(flight.heading);
            const marker = L.marker(flight.position, { icon: icon }).addTo(map);
            
            // Add click handler
            marker.on('click', function() {
                showPlaneDetails(flight);
            });
            
            // Store marker reference
            planeMarkers[flight.id] = marker;
        }
    });
}

// Show plane details
function showPlaneDetails(flight) {
    const detailsDiv = document.getElementById('plane-details');
    detailsDiv.style.display = 'block';
    
    document.getElementById('detail-flight').textContent = flight.callsign;
    document.getElementById('detail-aircraft').textContent = flight.aircraft;
    document.getElementById('detail-origin').textContent = `${flight.origin.city} (${flight.origin.iata})`;
    document.getElementById('detail-destination').textContent = `${flight.destination.city} (${flight.destination.iata})`;
    document.getElementById('detail-altitude').textContent = `${flight.altitude} ft`;
    document.getElementById('detail-speed').textContent = `${flight.speed} knots`;
    document.getElementById('detail-status').textContent = flight.status;
    document.getElementById('detail-eta').textContent = flight.eta;
    
    // Center map on plane
    map.setView(flight.position, 10);
}

// Set up event listeners
function setupEventListeners() {
    // Handle close details button
    document.getElementById('close-details').addEventListener('click', function() {
        document.getElementById('plane-details').style.display = 'none';
    });
    
    // Handle toggle live updates button
    document.getElementById('toggle-live').addEventListener('click', function() {
        liveUpdates = !liveUpdates;
        
        const statusDot = document.getElementById('status-dot');
        const statusText = document.getElementById('status-text');
        const toggleButton = document.getElementById('toggle-live');
        
        if (liveUpdates) {
            statusDot.className = 'status-indicator status-live';
            statusText.textContent = 'Live: Updating every 2 seconds';
            toggleButton.textContent = 'Pause';
        } else {
            statusDot.className = 'status-indicator status-paused';
            statusText.textContent = 'Updates paused';
            toggleButton.textContent = 'Resume';
        }
    });
}

// Initial setup
function init() {
    // Initialize map
    initMap();
    
    // Set up event listeners
    setupEventListeners();
    
    // Generate initial flight data
    generateMockFlights();
    
    // Update plane positions initially
    updatePlanePositions();
    
    // Start the live update interval
    setInterval(function() {
        if (liveUpdates) {
            updatePlanePositions();
        }
    }, POSITION_UPDATE_INTERVAL);
    
    // Refresh flight data periodically
    setInterval(function() {
        if (liveUpdates) {
            // Clear arrivals/departures for all airports
            AIRPORTS.forEach(airport => {
                airport.arrivals = [];
                airport.departures = [];
            });
            
            // Clear existing plane markers
            for (const id in planeMarkers) {
                map.removeLayer(planeMarkers[id]);
            }
            planeMarkers = {};
            
            // Generate new flight data
            generateMockFlights();
            
            // Update plane positions
            updatePlanePositions(); } 
        }
     )};
