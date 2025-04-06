// Flight data handling and API calls
let flightData = [];

async function fetchFlightData() {
    try {
        // Fetch data from OpenSky API
        const response = await fetch(`${CONFIG.api.openSky.url}${CONFIG.api.openSky.endpoints.states}?` + 
            `lamin=${CONFIG.api.openSky.bounds.lamin}&` + 
            `lamax=${CONFIG.api.openSky.bounds.lamax}&` + 
            `lomin=${CONFIG.api.openSky.bounds.lomin}&` + 
            `lomax=${CONFIG.api.openSky.bounds.lomax}`);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        if (!data || !data.states || data.states.length === 0) {
            console.log('No flight data available');
            return [];
        }
        
        // Process the raw data into a more usable format
        const processedData = processFlightData(data.states);
        flightData = processedData;
        
        // Update UI with new data
        updateFlightList(processedData);
        updatePlanePositions(processedData);
        
        return processedData;
    } catch (error) {
        console.error('Error fetching flight data:', error);
        return [];
    }
}

function processFlightData(states) {
    // Process raw API data into a more structured format
    return states.map(state => {
        return {
            icao24: state[0],                  // ICAO24 unique identifier
            callsign: state[1] ? state[1].trim() : 'N/A',
            origin_country: state[2],
            time_position: state[3],
            last_contact: state[4],
            longitude: state[5],
            latitude: state[6],
            baro_altitude: state[7],          // Barometric altitude in m
            on_ground: state[8],
            velocity: state[9],               // Velocity in m/s
            true_track: state[10],            // Heading in decimal degrees (0-359)
            vertical_rate: state[11],         // Vertical rate in m/s
            sensors: state[12],
            geo_altitude: state[13],          // Geometric altitude in m
            squawk: state[14],                // Transponder code
            spi: state[15],                   // Special purpose indicator
            position_source: state[16],       // Source of position data
            // Add derived data
            category: 'Unknown',
            aircraftType: 'Unknown',
            departureAirport: determineAirport(state[5], state[6]),
            statusType: determineStatusType(state[5], state[6], state[11])
        };
    });
}

function determineAirport(longitude, latitude) {
    // Simple distance calculation to determine if plane is near Pristina or Tirana airport
    if (!longitude || !latitude) return 'Unknown';
    
    const pristinaDistance = calculateDistance(
        latitude, longitude, 
        CONFIG.airports.pristina.position[0], CONFIG.airports.pristina.position[1]
    );
    
    const tiranaDistance = calculateDistance(
        latitude, longitude, 
        CONFIG.airports.tirana.position[0], CONFIG.airports.tirana.position[1]
    );
    
    // If within radius of Pristina
    if (pristinaDistance <= CONFIG.airports.pristina.bounds.radius) {
        return 'PRN';
    }
    
    // If within radius of Tirana
    if (tiranaDistance <= CONFIG.airports.tirana.bounds.radius) {
        return 'TIA';
    }
    
    return 'Other';
}

function determineStatusType(longitude, latitude, verticalRate) {
    // Determine if a flight is arriving or departing based on its position and vertical rate
    if (!longitude || !latitude) return 'Unknown';
    
    const pristinaDistance = calculateDistance(
        latitude, longitude, 
        CONFIG.airports.pristina.position[0], CONFIG.airports.pristina.position[1]
    );
    
    const tiranaDistance = calculateDistance(
        latitude, longitude, 
        CONFIG.airports.tirana.position[0], CONFIG.airports.tirana.position[1]
    );
    
    // If within radius of either airport and has vertical rate info
    if ((pristinaDistance <= CONFIG.airports.pristina.bounds.radius || 
         tiranaDistance <= CONFIG.airports.tirana.bounds.radius) && 
        verticalRate !== null) {
        
        // Negative vertical rate means descending (arriving)
        if (verticalRate < 0) {
            return 'Arriving';
        }
        
        // Positive vertical rate means climbing (departing)
        if (verticalRate > 0) {
            return 'Departing';
        }
    }
    
    return 'En-Route';
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula to calculate distance between two points on Earth
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
        
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    
    return distance;
}

function filterFlightsByAirport(airport) {
    if (airport === 'all') {
        return flightData;
    }
    
    const airportCode = airport === 'pristina' ? 'PRN' : 'TIA';
    
    return flightData.filter(flight => {
        return flight.departureAirport === airportCode;
    });
}

function searchFlights(query) {
    if (!query) {
        return flightData;
    }
    
    const searchTerm = query.toLowerCase();
    
    return flightData.filter(flight => {
        return (
            (flight.callsign && flight.callsign.toLowerCase().includes(searchTerm)) ||
            (flight.origin_country && flight.origin_country.toLowerCase().includes(searchTerm))
        );
    });
}

function getAdditionalFlightInfo(flight) {
    // Get aircraft type info if available
    let aircraftInfo = { manufacturer: "Unknown", model: "Unknown" };
    
    if (flight.callsign) {
        // Extract aircraft type from callsign (this is a simplified approach)
        // In reality, you would need a more complex lookup or additional API
        const typeCode = flight.callsign.substring(0, 3);
        aircraftInfo = getAircraftTypeInfo(typeCode);
    }
    
    return {
        aircraftInfo,
        estimatedArrival: calculateEstimatedArrival(flight),
        flightLevel: calculateFlightLevel(flight.baro_altitude)
    };
}

function calculateEstimatedArrival(flight) {
    // This is a simplified calculation
    // In reality, you would need more data and complex calculations
    
    if (!flight.latitude || !flight.longitude || !flight.velocity) {
        return 'Unknown';
    }
    
    // Find closest airport
    const pristinaDistance = calculateDistance(
        flight.latitude, flight.longitude, 
        CONFIG.airports.pristina.position[0], CONFIG.airports.pristina.position[1]
    );
    
    const tiranaDistance = calculateDistance(
        flight.latitude, flight.longitude, 
        CONFIG.airports.tirana.position[0], CONFIG.airports.tirana.position[1]
    );
    
    const closestAirport = pristinaDistance < tiranaDistance ? 
        { name: 'Pristina', distance: pristinaDistance } : 
        { name: 'Tirana', distance: tiranaDistance };
    
    // If already very close to airport
    if (closestAirport.distance < 5) {
        return 'Landing/Taking off';
    }
    
    // Calculate rough ETA based on current speed and distance
    const speedKmh = flight.velocity * 3.6; // Convert m/s to km/h
    if (speedKmh < 50) return 'Stationary';
    
    const timeHours = closestAirport.distance / speedKmh;
    const timeMinutes = Math.round(timeHours * 60);
    
    if (timeMinutes < 60) {
        return `~${timeMinutes} minutes`;
    } else {
        const hours = Math.floor(timeHours);
        const minutes = Math.round((timeHours - hours) * 60);
        return `~${hours}h ${minutes}m`;
    }
}

function calculateFlightLevel(baroAltitude) {
    if (baroAltitude === null) return 'Unknown';
    
    // Convert meters to feet and divide by 100 to get flight level
    const altitudeFeet = baroAltitude * 3.28084;
    return `FL${Math.round(altitudeFeet / 100)}`;
}
