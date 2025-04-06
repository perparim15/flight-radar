// Aircraft types database
const AIRCRAFT_TYPES = {
    // Airbus
    "A319": { manufacturer: "Airbus", model: "A319", type: "Passenger", category: "Narrow-body" },
    "A320": { manufacturer: "Airbus", model: "A320", type: "Passenger", category: "Narrow-body" },
    "A321": { manufacturer: "Airbus", model: "A321", type: "Passenger", category: "Narrow-body" },
    "A332": { manufacturer: "Airbus", model: "A330-200", type: "Passenger", category: "Wide-body" },
    "A333": { manufacturer: "Airbus", model: "A330-300", type: "Passenger", category: "Wide-body" },
    "A339": { manufacturer: "Airbus", model: "A330-900neo", type: "Passenger", category: "Wide-body" },
    "A343": { manufacturer: "Airbus", model: "A340-300", type: "Passenger", category: "Wide-body" },
    "A346": { manufacturer: "Airbus", model: "A340-600", type: "Passenger", category: "Wide-body" },
    "A359": { manufacturer: "Airbus", model: "A350-900", type: "Passenger", category: "Wide-body" },
    "A35K": { manufacturer: "Airbus", model: "A350-1000", type: "Passenger", category: "Wide-body" },
    "A388": { manufacturer: "Airbus", model: "A380-800", type: "Passenger", category: "Wide-body" },
    
    // Boeing
    "B737": { manufacturer: "Boeing", model: "737", type: "Passenger", category: "Narrow-body" },
    "B738": { manufacturer: "Boeing", model: "737-800", type: "Passenger", category: "Narrow-body" },
    "B739": { manufacturer: "Boeing", model: "737-900", type: "Passenger", category: "Narrow-body" },
    "B38M": { manufacturer: "Boeing", model: "737 MAX 8", type: "Passenger", category: "Narrow-body" },
    "B39M": { manufacturer: "Boeing", model: "737 MAX 9", type: "Passenger", category: "Narrow-body" },
    "B744": { manufacturer: "Boeing", model: "747-400", type: "Passenger/Cargo", category: "Wide-body" },
    "B748": { manufacturer: "Boeing", model: "747-8", type: "Passenger/Cargo", category: "Wide-body" },
    "B752": { manufacturer: "Boeing", model: "757-200", type: "Passenger", category: "Narrow-body" },
    "B753": { manufacturer: "Boeing", model: "757-300", type: "Passenger", category: "Narrow-body" },
    "B763": { manufacturer: "Boeing", model: "767-300", type: "Passenger/Cargo", category: "Wide-body" },
    "B764": { manufacturer: "Boeing", model: "767-400", type: "Passenger", category: "Wide-body" },
    "B772": { manufacturer: "Boeing", model: "777-200", type: "Passenger", category: "Wide-body" },
    "B77L": { manufacturer: "Boeing", model: "777-200LR", type: "Passenger", category: "Wide-body" },
    "B77W": { manufacturer: "Boeing", model: "777-300ER", type: "Passenger", category: "Wide-body" },
    "B788": { manufacturer: "Boeing", model: "787-8", type: "Passenger", category: "Wide-body" },
    "B789": { manufacturer: "Boeing", model: "787-9", type: "Passenger", category: "Wide-body" },
    "B78X": { manufacturer: "Boeing", model: "787-10", type: "Passenger", category: "Wide-body" },
    
    // Embraer
    "E170": { manufacturer: "Embraer", model: "E170", type: "Passenger", category: "Regional Jet" },
    "E190": { manufacturer: "Embraer", model: "E190", type: "Passenger", category: "Regional Jet" },
    "E195": { manufacturer: "Embraer", model: "E195", type: "Passenger", category: "Regional Jet" },
    "E290": { manufacturer: "Embraer", model: "E190-E2", type: "Passenger", category: "Regional Jet" },
    "E295": { manufacturer: "Embraer", model: "E195-E2", type: "Passenger", category: "Regional Jet" },
    
    // Bombardier
    "CRJ2": { manufacturer: "Bombardier", model: "CRJ200", type: "Passenger", category: "Regional Jet" },
    "CRJ7": { manufacturer: "Bombardier", model: "CRJ700", type: "Passenger", category: "Regional Jet" },
    "CRJ9": { manufacturer: "Bombardier", model: "CRJ900", type: "Passenger", category: "Regional Jet" },
    "CRJX": { manufacturer: "Bombardier", model: "CRJ1000", type: "Passenger", category: "Regional Jet" },
    
    // ATR
    "AT72": { manufacturer: "ATR", model: "ATR 72", type: "Passenger", category: "Regional Turboprop" },
    "AT76": { manufacturer: "ATR", model: "ATR 72-600", type: "Passenger", category: "Regional Turboprop" },
    
    // Default for unknown types
    "default": { manufacturer: "Unknown", model: "Unknown", type: "Unknown", category: "Unknown" }
};

// Function to get aircraft type info
function getAircraftTypeInfo(typeCode) {
    // If typeCode exists, return that aircraft type info, otherwise return default
    return AIRCRAFT_TYPES[typeCode] || AIRCRAFT_TYPES["default"];
}
