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

    map.setMaxBounds([[MAP_BOUNDS.south, MAP_BOUNDS.west], [MAP_BOUNDS.north, MAP_BOUNDS.east]]);
    addAirportMarkers();
}

// Add airport markers to the map
function addAirportMarkers() {
    AIRPORTS.forEach(airport => {
        const marker = L.marker([airport.lat, airport.lng]).addTo(map);
        marker.bindPopup(`<b>${airport.name}</b><br>${airport.city}, ${airport.country}<br>IATA: ${airport.iata}`);

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

// Fetch live flight data from OpenSky Network
function fetchLiveFlights() {
    // Define bounds for Albania, Kosovo, North Macedonia
    const bounds = {
        lamin: 40.5, // South
        lamax: 43.0, // North
        lomin: 19.0, // West
        lomax: 23.0  // East
    };

    fetch(`https://opensky-network.org/api/states/all?lamin=${bounds.lamin}&lomin=${bounds.lomin}&lamax=${bounds.lamax}&lomax=${bounds.lomax}`)
        .then(response => response.json())
        .then(data => {
            flights = [];
            if (data && data.states) {
                data.states.forEach(state => {
                    const [icao24, callsign, originCountry, timePosition, lastContact, longitude, latitude, baroAltitude, onGround, velocity, heading] = state;

                    if (latitude && longitude && !onGround) { // Only include airborne flights
                        flights.push({
                            id: icao24,
                            callsign: callsign ? callsign.trim() : 'Unknown',
                            aircraft: 'Unknown', // OpenSky nuk jep modelin e avionit
                            origin: { city: originCountry, iata: 'N/A' }, // Nuk ka origjinë të saktë nga API
                            destination: { city: 'Unknown', iata: 'N/A' }, // Nuk ka destinacion nga API
                            position: [latitude, longitude],
                            altitude: baroAltitude ? Math.round(baroAltitude * 3.28084) : 0, // Convert meters to feet
                            speed: velocity ? Math.round(velocity * 1.94384) : 0, // Convert m/s to knots
                            heading: heading || 0,
                            status: 'En Route',
                            eta: 'N/A' // ETA nuk ofrohet nga OpenSky
                        });
                    }
                });
            }
            updatePlanePositions();
        })
        .catch(error => console.error('Error fetching live flights:', error));
}

// Update airport flight lists (simplified, as API doesn't provide this)
function updateAirportFlights(airportId) {
    const airport = AIRPORTS.find(a => a.id === airportId);
    const flightListEl = document.getElementById(`flights-${airportId}`);
    flightListEl.innerHTML = '<div>Not available with live data</div>';
}

// Update plane positions
function updatePlanePositions() {
    flights.forEach(flight => {
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
            statusText.textContent = 'Live: Updating every 5 seconds';
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
    fetchLiveFlights();

    setInterval(() => {
        if (liveUpdates) fetchLiveFlights();
    }, 5000); // Update every 5 seconds (OpenSky ka kufizime, mos e ul shumë)
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);
