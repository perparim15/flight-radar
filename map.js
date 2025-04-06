// Map initialization and functions
let map, regionLayer, planeLayerGroup;
let planeMarkers = {};
let selectedPlaneId = null;

function initMap() {
    // Create map instance
    map = L.map('map', {
        center: CONFIG.map.center,
        zoom: CONFIG.map.defaultZoom,
        maxZoom: CONFIG.map.maxZoom,
        minZoom: CONFIG.map.minZoom
    });
    
    // Add base tile layer
    L.tileLayer(CONFIG.map.tileLayer, {
        attribution: CONFIG.map.attribution
    }).addTo(map);
    
    // Add layer for regions (Kosovo and Albania highlighted)
    regionLayer = L.layerGroup().addTo(map);
    
    // Add layer for planes
    planeLayerGroup = L.layerGroup().addTo(map);
    
    // Draw Kosovo and Albania regions
    drawRegions();
    
    // Add airport markers
    addAirportMarkers();
}

function drawRegions() {
    // Get region bounds
    const kosovoBounds = CONFIG.regions.kosovo.bounds;
    const albaniaBounds = CONFIG.regions.albania.bounds;
    
    // Create polygon for Kosovo
    const kosovoPolygon = L.polygon([
        [kosovoBounds.north, kosovoBounds.west],
        [kosovoBounds.north, kosovoBounds.east],
        [kosovoBounds.south, kosovoBounds.east],
        [kosovoBounds.south, kosovoBounds.west]
    ], {
        color: '#003366',
        weight: 2,
        fillColor: '#003366',
        fillOpacity: 0.1
    }).addTo(regionLayer);
    
    // Create polygon for Albania
    const albaniaPolygon = L.polygon([
        [albaniaBounds.north, albaniaBounds.west],
        [albaniaBounds.north, albaniaBounds.east],
        [albaniaBounds.south, albaniaBounds.east],
        [albaniaBounds.south, albaniaBounds.west]
    ], {
        color: '#003366',
        weight: 2,
        fillColor: '#003366',
        fillOpacity: 0.1
    }).addTo(regionLayer);
    
    // Create surrounding grayed-out area
    const outerBounds = [
        [CONFIG.api.openSky.bounds.lamax, CONFIG.api.openSky.bounds.lomin],
        [CONFIG.api.openSky.bounds.lamax, CONFIG.api.openSky.bounds.lomax],
        [CONFIG.api.openSky.bounds.lamin, CONFIG.api.openSky.bounds.lomax],
        [CONFIG.api.openSky.bounds.lamin, CONFIG.api.openSky.bounds.lomin]
    ];
    
    const kosovoCoords = kosovoPolygon.getLatLngs()[0];
    const albaniaCoords = albaniaPolygon.getLatLngs()[0];
    
    L.polygon(outerBounds, {
        color: '#666',
        weight: 1,
        fillColor: '#666',
        fillOpacity: 0.5
    }).addTo(regionLayer);
    
    L.polygon(kosovoCoords, {
        color: '#003366',
        weight: 2,
        fillColor: '#003366',
        fillOpacity: 0.1
    }).addTo(regionLayer);
    
    L.polygon(albaniaCoords, {
        color: '#003366',
        weight: 2,
        fillColor: '#003366',
        fillOpacity: 0.1
    }).addTo(regionLayer);
}

function addAirportMarkers() {
    // Add Pristina Airport marker
    const pristinaAirport = CONFIG.airports.pristina;
    L.marker(pristinaAirport.position)
        .addTo(map)
        .bindTooltip(`<strong>${pristinaAirport.name}</strong><br>IATA: ${pristinaAirport.code}`);
    
    // Add Tirana Airport marker
    const tiranaAirport = CONFIG.airports.tirana;
    L.marker(tiranaAirport.position)
        .addTo(map)
        .bindTooltip(`<strong>${tiranaAirport.name}</strong><br>IATA: ${tiranaAirport.code}`);
}

function updatePlanePositions(planes) {
    // Clear existing markers if no planes are found
    if (!planes || planes.length === 0) {
        clearAllPlaneMarkers();
        return;
    }
    
    // Track IDs to detect removed planes
    const currentIds = new Set();
    
    // Update or create markers for each plane
    planes.forEach(plane => {
        // Generate a unique ID
        const id = plane.icao24;
        currentIds.add(id);
        
        // Create or update marker
        if (planeMarkers[id]) {
            updatePlaneMarker(id, plane);
        } else {
            createPlaneMarker(id, plane);
        }
    });
    
    // Remove markers for planes no longer in the data
    Object.keys(planeMarkers).forEach(id => {
        if (!currentIds.has(id)) {
            removePlaneMarker(id);
        }
    });
}

function createPlaneMarker(id, plane) {
    // Skip if missing critical data
    if (!plane.latitude || !plane.longitude) return;
    
    // Create aircraft icon
    const iconSize = CONFIG.ui.planeIconSize;
    const icon = createAircraftIcon(plane, iconSize);
    
    // Create marker
    const marker = L.marker([plane.latitude, plane.longitude], {
        icon: icon,
        rotationAngle: plane.true_track || 0
    }).addTo(planeLayerGroup);
    
    // Add tooltip
    marker.bindTooltip(createTooltipContent(plane), {
        className: 'aircraft-tooltip',
        offset: [0, -10]
    });
    
    // Add click handler
    marker.on('click', () => {
        selectPlane(id);
        showFlightDetails(plane);
    });
    
    // Store marker
    planeMarkers[id] = {
        marker: marker,
        data: plane
    };
}

function updatePlaneMarker(id, newData) {
    const marker = planeMarkers[id].marker;
    
    // Skip if missing critical data
    if (!newData.latitude || !newData.longitude) return;
    
    // Update position
    marker.setLatLng([newData.latitude, newData.longitude]);
    
    // Update rotation if available
    if (newData.true_track !== undefined) {
        marker.setRotationAngle(newData.true_track);
    }
    
    // Update tooltip
    marker.getTooltip().setContent(createTooltipContent(newData));
    
    // Update icon if this is the selected plane
    if (id === selectedPlaneId) {
        const iconSize = CONFIG.ui.selectedPlaneIconSize;
        marker.setIcon(createAircraftIcon(newData, iconSize, true));
    }
    
    // Update stored data
    planeMarkers[id].data = newData;
    
    // If this is the selected plane, update details panel
    if (id === selectedPlaneId) {
        updateFlightDetailsPanel(newData);
    }
}

function removePlaneMarker(id) {
    // Remove from map
    if (planeMarkers[id] && planeMarkers[id].marker) {
        planeLayerGroup.removeLayer(planeMarkers[id].marker);
    }
    
    // Delete from tracking object
    delete planeMarkers[id];
    
    // If this was the selected plane, close the details panel
    if (id === selectedPlaneId) {
        hideFlightDetails();
        selectedPlaneId = null;
    }
}

function clearAllPlaneMarkers() {
    // Clear all markers from map
    planeLayerGroup.clearLayers();
    
    // Reset tracking object
    planeMarkers = {};
    
    // Hide details panel
    hideFlightDetails();
    selectedPlaneId = null;
}

function createAircraftIcon(plane, size, isSelected = false) {
    // Determine icon class
    const iconClass = isSelected ? 'aircraft-icon selected' : 'aircraft-icon';
    
    // Create HTML element for icon
    const iconHtml = `<div class="${iconClass}" style="width: ${size}px; height: ${size}px;">✈</div>`;
    
    // Create Leaflet divIcon
    return L.divIcon({
        html: iconHtml,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size/2, size/2]
    });
}

function createTooltipContent(plane) {
    // Create tooltip HTML
    let html = `<div class="tooltip-callsign">${plane.callsign || 'Unknown'}</div>`;
    
    // Add basic flight info
    if (plane.origin_country) {
        html += `<div class="tooltip-info">Country: ${plane.origin_country}</div>`;
    }
    
    // Add altitude if available
    if (plane.geo_altitude) {
        const altitudeFt = Math.round(plane.geo_altitude * 3.28084);
        html += `<div class="tooltip-info">Altitude: ${altitudeFt.toLocaleString()} ft</div>`;
    }
    
    // Add speed if available
    if (plane.velocity) {
        const speedKts = Math.round(plane.velocity * 1.94384);
        html += `<div class="tooltip-info">Speed: ${speedKts} kts</div>`;
    }
    
    return html;
}

function selectPlane(id) {
    // Deselect previously selected plane
    if (selectedPlaneId && planeMarkers[selectedPlaneId]) {
        const prevMarker = planeMarkers[selectedPlaneId].marker;
        const prevData = planeMarkers[selectedPlaneId].data;
        prevMarker.setIcon(createAircraftIcon(prevData, CONFIG.ui.planeIconSize));
    }
    
    // Select new plane
    selectedPlaneId = id;
    
    if (planeMarkers[id]) {
        const marker = planeMarkers[id].marker;
        const data = planeMarkers[id].data;
        marker.setIcon(createAircraftIcon(data, CONFIG.ui.selectedPlaneIconSize, true));
        
        // Highlight the corresponding list item
        highlightFlightListItem(id);
    }
}

function highlightFlightListItem(id) {
    // Remove highlight from all items
    document.querySelectorAll('.flight-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Add highlight to selected item
    const selectedItem = document.querySelector(`.flight-item[data-id="${id}"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
        selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}
