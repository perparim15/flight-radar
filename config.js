// Configuration file for Flight Tracker

// Target countries to highlight
const TARGET_COUNTRIES = ['ALB', 'MKD', 'KOS', 'UNK']; // Albania, North Macedonia, Kosovo (may be UNK in some datasets)

// Map bounds for Europe
const MAP_BOUNDS = {
    north: 60, // Northern limit
    south: 35, // Southern limit
    east: 30,  // Eastern limit
    west: -10  // Western limit
};

// Map center and default zoom
const MAP_CENTER = [41.6, 20.5]; // Center of Albania/Kosovo/N Macedonia
const DEFAULT_ZOOM = 7;

// Airport data
const AIRPORTS = [
    {
        id: 'TIA',
        name: 'Tirana International Airport',
        city: 'Tirana',
        country: 'Albania',
        iata: 'TIA',
        icao: 'LATI',
        lat: 41.4147,
        lng: 19.7206,
        arrivals: [],
        departures: []
    },
    {
        id: 'PRN',
        name: 'Pristina International Airport',
        city: 'Pristina',
        country: 'Kosovo',
        iata: 'PRN',
        icao: 'BKPR',
        lat: 42.5728,
        lng: 21.0358,
        arrivals: [],
        departures: []
    },
    {
        id: 'OHD',
        name: 'Ohrid St. Paul the Apostle Airport',
        city: 'Ohrid',
        country: 'North Macedonia',
        iata: 'OHD',
        icao: 'LWOH',
        lat: 41.1799,
        lng: 20.7422,
        arrivals: [],
        departures: []
    },
    {
        id: 'SKP',
        name: 'Skopje International Airport',
        city: 'Skopje',
        country: 'North Macedonia',
        iata: 'SKP',
        icao: 'LWSK',
        lat: 41.9616,
        lng: 21.6214,
        arrivals: [],
        departures: []
    }
];

// Sample destinations for mock data
const DESTINATIONS = [
    { city: 'Vienna', iata: 'VIE' },
    { city: 'Rome', iata: 'FCO' },
    { city: 'Istanbul', iata: 'IST' },
    { city: 'Frankfurt', iata: 'FRA' },
    { city: 'London', iata: 'LHR' },
    { city: 'Munich', iata: 'MUC' },
    { city: 'Zurich', iata: 'ZRH' },
    { city: 'Athens', iata: 'ATH' },
    { city: 'Budapest', iata: 'BUD' },
    { city: 'Milan', iata: 'MXP' },
    { city: 'Paris', iata: 'CDG' },
    { city: 'Brussels', iata: 'BRU' },
    { city: 'Amsterdam', iata: 'AMS' },
    { city: 'Stockholm', iata: 'ARN' }
];

// Airlines for mock data
const AIRLINES = [
    'ALB', // Air Albania
    'WZZ', // Wizz Air
    'RYR', // Ryanair
    'LFT', // Lufthansa
    'AHY', // Azerbaijan Airlines
    'THY', // Turkish Airlines
    'ASL', // Air Serbia
    'AUA', // Austrian Airlines
    'SWR', // Swiss International Air Lines
    'AFR'  // Air France
];

// Aircraft types for mock data
const AIRCRAFT_TYPES = [
    'A320', // Airbus A320
    'B738', // Boeing 737-800
    'A319', // Airbus A319
    'E190', // Embraer E190
    'DH8D', // Bombardier Dash 8
    'CRJ9', // Bombardier CRJ900
    'A321', // Airbus A321
    'B77W', // Boeing 777-300ER
    'A333', // Airbus A330-300
    'A359'  // Airbus A350-900
];

// Update intervals
const POSITION_UPDATE_INTERVAL = 2000; // 2 seconds for plane movement
const FLIGHT_DATA_REFRESH_INTERVAL = 60000; // 1 minute for new flight data

// Path to GeoJSON files
const GEOJSON_PATH = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';