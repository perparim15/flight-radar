// Initialize variables
let map;
let flights = [];
let planeMarkers = {};
let liveUpdates = true;

// Initialize map
function initMap() {
    map = L.map('map').setView(MAP_CENTER, DEFAULT_ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Set map bounds
    map.setMaxBounds([[MAP_BOUNDS.south, MAP_BOUNDS.west], [MAP_BOUNDS.north, MAP_BOUNDS.east]]);

    // Add airport markers
    addAirportMarkers();
}

// Add airport markers to the map
function addAirportMarkers() {
    AIRPORTS.forEach(airport => {
        const marker = L.marker([airport.lat, airport.lng]).addTo(map);
        marker.bindPopup(`<b>${airport.name}</b><br>${airport.city}, ${airport.country}<br>IATA: ${airport.iata}`);

        // Add to sidebar
        const airportDiv = document.createElement('div');
        airportDiv.className = 'airport-item';
        airportDiv.innerHTML = `
            <strong>${airport.name}</strong> (${airport.iata})<br>
            ${airport.city}, ${airport.country}
            <button class="toggle-flights">Show Flights</button>
            <div class="flight-list" id="flights-${airport.id}"></div>
        `;
        document.getElementById('airport-list').appendChild(airportDiv);

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

// Create airplane icon with rotation
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
    flights = [];
    const flightCount = Math.floor(Math.random() * 11) + 15;

    for (let i = 0; i < flightCount; i++) {
        const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
        const flightNumber = airline + Math.floor(Math.random() * 9000 + 1000);
        const aircraft = AIRCRAFT_TYPES[Math.floor(Math.random() * AIRCRAFT_TYPES.length)];
        const homeAirport = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
        const isArrival = Math.random() > 0.5;
        let destAirport = isArrival ? DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)] : homeAirport;
        let originAirport = isArrival ? homeAirport : DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];

        const direction = Math.random() * 360;
        const distance = Math.random() * 50 + 10;
        const lat = homeAirport.lat + (distance / 111) * Math.cos(direction * Math.PI / 180);
        const lng = homeAirport.lng + (distance / (111 * Math.cos(homeAirport.lat * Math.PI / 180))) * Math.sin(direction * Math.PI / 180);
        const position = [lat, lng];
        const bearing = (direction + (isArrival ? 180 : 0)) % 360;
        const status = distance < 20 ? 'Approaching' : 'En Route';
        const eta = `${Math.floor(distance * 3 + (distance < 20 ? 5 : 15))} minutes`;

        flights.push({
            id: i,
            callsign: flightNumber,
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

        const airport = AIRPORTS.find(a => a.id === homeAirport.id);
        if (isArrival) {
            airport.arrivals.push({ flight: flightNumber, from: destAirport.city, eta: eta, status: status });
        } else {
            airport.departures.push({ flight: flightNumber, to: destAirport.city, departed: `${Math.floor(distance * 3)} minutes ago`, status: status });
        }
    }
}

// Update airport flight lists
function updateAirportFlights(airportId) {
    const airport = AIRPORTS.find(a => a.id === airportId);
    const flightListEl = document.getElementById(`flights-${airportId}`);
    flightListEl.innerHTML = '';

    if (airport.arrivals.length > 0) {
        const arrivalsHeading = document.createElement('h3');
        arrivalsHeading.textContent = 'Arrivals';
        flightListEl.appendChild(arrivalsHeading);
        airport.arrivals.forEach(flight => {
            const flightItem = document.createElement('div');
            flightItem.className = 'flight-item arrival';
            flightItem.innerHTML = `<strong>${flight.flight}</strong> from ${flight.from}<br>ETA: ${flight.eta} | ${flight.status}`;
            flightListEl.appendChild(flightItem);
        });
    }

    if (airport.departures.length > 0) {
        const departuresHeading = document.createElement('h3');
        departuresHeading.textContent = 'Departures';
        flightListEl.appendChild(departuresHeading);
        airport.departures.forEach(flight => {
            const flightItem = document.createElement('div');
            flightItem.className = 'flight-item departure';
            flightItem.innerHTML = `<strong>${flight.flight}</strong> to ${flight.to}<br>Departed: ${flight.departed} | ${flight.status}`;
            flightListEl.appendChild(flightItem);
        });
    }
}

// Update plane positions
function updatePlanePositions() {
    flights.forEach(flight => {
        const direction = flight.heading * Math.PI / 180;
        const speedFactor = flight.speed / 3600;
        flight.position = [
            flight.position[0] + Math.cos(direction) * speedFactor * 0.0002,
            flight.position[1] + Math.sin(direction) * speedFactor * 0.0002
        ];

        if (planeMarkers[flight.id]) {
            planeMarkers[flight.id].setLatLng(flight.position);
            planeMarkers[flight.id].setIcon(createAirplaneIcon(flight.heading));
        } else {
            const marker = L.marker(flight.position, { icon: createAirplaneIcon(flight.heading) }).addTo(map);
            marker.on('click', () => showPlaneDetails(flight));
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
    map.setView(flight.position, 10);
}

// Set up event listeners
function setupEventListeners() {
    document.getElementById('close-details').addEventListener('click', () => {
        document.getElementById('plane-details').style.display = 'none';
    });

    document.getElementById('toggle-live').addEventListener('click', () => {
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
    initMap();
    setupEventListeners();
    generateMockFlights();
    updatePlanePositions();

    setInterval(() => {
        if (liveUpdates) updatePlanePositions();
    }, POSITION_UPDATE_INTERVAL);

    setInterval(() => {
        if (liveUpdates) {
            AIRPORTS.forEach(airport => { airport.arrivals = []; airport.departures = []; });
            for (const id in planeMarkers) map.removeLayer(planeMarkers[id]);
            planeMarkers = {};
            generateMockFlights();
            updatePlanePositions();
        }
    }, FLIGHT_DATA_REFRESH_INTERVAL);
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);
