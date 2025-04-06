// Main application logic

// DOM Elements
const flightListContainer = document.getElementById('flight-list');
const flightDetailsPanel = document.getElementById('flight-details-panel');
const flightDetailsContent = document.getElementById('flight-details-content');
const closeDetailsBtn = document.getElementById('close-details');
const searchInput = document.getElementById('search-flight');
const airportButtons = document.querySelectorAll('.airport-btn');

// Application state
let currentAirportFilter = 'all';
let updateInterval;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Initialize map
    initMap();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial flight data
    loadFlightData();
    
    // Set up periodic updates
    startPeriodicUpdates();
}

function setupEventListeners() {
    // Close details panel
    closeDetailsBtn.addEventListener('click', hideFlightDetails);
    
    // Search input
    searchInput.addEventListener('input', handleSearch);
    
    // Airport filter buttons
    airportButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            airportButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update filter
            currentAirportFilter = button.dataset.airport;
            
            // Update displayed flights
            const filteredFlights = filterFlightsByAirport(currentAirportFilter);
            updateFlightList(filteredFlights);
        });
    });
}

function loadFlightData() {
    // Show loading state
    flightListContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
        </div>
    `;
    
    // Fetch flight data
    fetchFlightData()
        .then(data => {
            if (data.length === 0) {
                flightListContainer.innerHTML = `
                    <div class="no-flights">
                        <p>No flights currently available in the selected area.</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error loading flight data:', error);
            flightListContainer.innerHTML = `
                <div class="error">
                    <p>Unable to load flight data. Please try again later.</p>
                </div>
            `;
        });
}

function startPeriodicUpdates() {
    // Clear any existing interval
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    // Set up new interval
    updateInterval = setInterval(() => {
        fetchFlightData();
    }, CONFIG.api.openSky.updateInterval);
}

function updateFlightList(flights) {
    // Clear current list
    flightListContainer.innerHTML = '';
    
    // Apply current airport filter
    const filteredFlights = currentAirportFilter === 'all' ? 
        flights : filterFlightsByAirport(currentAirportFilter);
    
    // If no flights, show message
    if (filteredFlights.length === 0) {
        flightListContainer.innerHTML = `
            <div class="no-flights">
                <p>No flights currently available for the selected filter.</p>
            </div>
        `;
        return;
    }
    
    // Add each flight to the list
    filteredFlights.forEach(flight => {
        const flightItem = createFlightListItem(flight);
        flightListContainer.appendChild(flightItem);
    });
}

function createFlightListItem(flight) {
    // Create DOM element for flight list item
    const item = document.createElement('div');
    item.className = 'flight-item';
    item.dataset.id = flight.icao24;
    
    // Add class if this is the selected flight
    if (flight.icao24 === selectedPlaneId) {
        item.classList.add('selected');
    }
    
    // Determine status class
    let statusClass = '';
    switch (flight.statusType) {
        case 'Arriving':
            statusClass = 'status-arriving';
            break;
        case 'Departing':
            statusClass = 'status-departing';
            break;
        default:
            statusClass = '';
    }
    
    // Create item content
    item.innerHTML = `
        <div>
            <div class="flight-callsign">${flight.callsign || 'Unknown'}</div>
            <div class="flight-route">${flight.origin_country || 'Unknown'}</div>
        </div>
        <div class="flight-status ${statusClass}">${flight.statusType}</div>
    `;
    
    // Add click handler
    item.addEventListener('click', () => {
        selectPlane(flight.icao24);
        showFlightDetails(flight);
    });
    
    return item;
}

function showFlightDetails(flight) {
    // Get additional info
    const additionalInfo = getAdditionalFlightInfo(flight);
    
    // Format altitude
    let altitude = 'Unknown';
    if (flight.geo_altitude !== null) {
        const altitudeFt = Math.round(flight.geo_altitude * 3.28084);
        altitude = `${altitudeFt.toLocaleString()} ft`;
    }
    
    // Format speed
    let speed = 'Unknown';
    if (flight.velocity !== null) {
        const speedKts = Math.round(flight.velocity * 1.94384);
        speed = `${speedKts} kts`;
    }
    
    // Create HTML content
    let html = `
        <div class="detail-group">
            <h4>Flight Information</h4>
            <div class="detail-item">
                <span class="detail-label">Callsign:</span>
                <span>${flight.callsign || 'Unknown'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Status:</span>
                <span>${flight.statusType}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Origin Country:</span>
                <span>${flight.origin_country || 'Unknown'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Nearest Airport:</span>
                <span>${flight.departureAirport === 'PRN' ? 'Pristina (PRN)' : 
                      flight.departureAirport === 'TIA' ? 'Tirana (TIA)' : 'Other'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">ETA:</span>
                <span>${additionalInfo.estimatedArrival}</span>
            </div>
        </div>
        
        <div class="detail-group">
            <h4>Aircraft Details</h4>
            <div class="detail-item">
                <span class="detail-label">Manufacturer:</span>
                <span>${additionalInfo.aircraftInfo.manufacturer}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Model:</span>
                <span>${additionalInfo.aircraftInfo.model}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">ICAO24:</span>
                <span>${flight.icao24}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Squawk:</span>
                <span>${flight.squawk || 'Unknown'}</span>
            </div>
        </div>
        
        <div class="detail-group">
            <h4>Current Position</h4>
            <div class="detail-item">
                <span class="detail-label">Altitude:</span>
                <span>${altitude}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Flight Level:</span>
                <span>${additionalInfo.flightLevel}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Speed:</span>
                <span>${speed}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Heading:</span>
                <span>${flight.true_track !== null ? `${Math.round(flight.true_track)}°` : 'Unknown'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Vertical Rate:</span>
                <span>${flight.vertical_rate !== null ? `${Math.round(flight.vertical_rate * 196.85)} ft/min` : 'Unknown'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Position:</span>
                <span>Lat: ${flight.latitude !== null ? flight.latitude.toFixed(4) : 'Unknown'}, 
                      Lon: ${flight.longitude !== null ? flight.longitude.toFixed(4) : 'Unknown'}</span>
            </div>
        </div>
    `;
    
    // Update panel content
    flightDetailsContent.innerHTML = html;
    
    // Show panel
    flightDetailsPanel.classList.add('active');
}

function updateFlightDetailsPanel(flight) {
    // Only update if details panel is open and this is the selected flight
    if (!flightDetailsPanel.classList.contains('active') || flight.icao24 !== selectedPlaneId) {
        return;
    }
    
    // Update with current flight data
    showFlightDetails(flight);
}

function hideFlightDetails() {
    // Hide panel
    flightDetailsPanel.classList.remove('active');
}

function handleSearch() {
    const query = searchInput.value.trim();
    const filteredFlights = searchFlights(query);
    
    // Apply airport filter if active
    const finalFiltered = currentAirportFilter === 'all' ? 
        filteredFlights : 
        filteredFlights.filter(f => f.departureAirport === (currentAirportFilter === 'pristina' ? 'PRN' : 'TIA'));
    
    // Update list
    updateFlightList(finalFiltered);
}
