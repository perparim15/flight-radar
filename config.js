// Configuration file for Flight Tracker

const CONFIG = {
    // Map configuration
    map: {
        center: [42.0, 20.5], // Center between Kosovo and Albania
        defaultZoom: 7,
        maxZoom: 12,
        minZoom: 5,
        tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    
    // Region boundaries
    regions: {
        kosovo: {
            name: 'Kosovo',
            bounds: {
                north: 43.25,
                south: 41.85,
                east: 21.80,
                west: 20.00
            },
            center: [42.55, 20.90]
        },
        albania: {
            name: 'Albania',
            bounds: {
                north: 42.65,
                south: 39.65,
                east: 21.05,
                west: 19.25
            },
            center: [41.15, 20.15]
        }
    },
    
    // Airport information
    airports: {
        pristina: {
            name: 'Pristina International Airport',
            code: 'PRN',
            position: [42.5728, 21.0358],
            bounds: {
                radius: 50 // km radius around the airport
            }
        },
        tirana: {
            name: 'Tirana International Airport',
            code: 'TIA',
            position: [41.4146, 19.7206],
            bounds: {
                radius: 50 // km radius around the airport
            }
        }
    },
    
    // API configuration
    api: {
        openSky: {
            url: 'https://opensky-network.org/api',
            endpoints: {
                states: '/states/all',
                arrivals: '/flights/arrival',
                departures: '/flights/departure'
            },
            updateInterval: 15000, // 15 seconds in milliseconds
            bounds: {
                // Bounding box covering Kosovo and Albania with some margin
                lamin: 39.5,  // southern border
                lamax: 43.5,  // northern border
                lomin: 19.0,  // western border
                lomax: 22.0   // eastern border
            }
        }
    },
    
    // UI configuration
    ui: {
        refreshInterval: 30000, // 30 seconds in milliseconds
        planeIconSize: 20,
        selectedPlaneIconSize: 26
    }
};
