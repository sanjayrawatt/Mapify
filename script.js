mapboxgl.accessToken = 'pk.eyJ1Ijoic2FuamF5cmF3YXR0IiwiYSI6ImNtNWw0eDltbzFqM3kya3M3d2pld3Q3cWUifQ.4ApcVfCmk7Nblvn4px00EA';

let mapStyle = "mapbox://styles/mapbox/streets-v11"; // Default style

navigator.geolocation.getCurrentPosition(
    successLocation,
    errorLocation,
    { enableHighAccuracy: true }
);

function successLocation(position) {
    setupMap([position.coords.longitude, position.coords.latitude]);
}

function errorLocation() {
    setupMap([72.8777, 19.0760]); // Default to Bombay (Mumbai)
}

function setupMap(center) {
    const map = new mapboxgl.Map({
        container: "map",
        style: mapStyle,
        center: center,
        zoom: 17
    });

    map.on('load', function () {
        map.addLayer({
            'id': 'traffic',
            'type': 'line',
            'source': {
                'type': 'vector',
                'url': 'mapbox://mapbox.mapbox-traffic-v1'
            },
            'source-layer': 'traffic',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#ff0000',
                'line-width': 2
            }
        });
    });

    const nav = new mapboxgl.NavigationControl();
    map.addControl(nav);

    const directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken,
        unit: 'metric',
        profile: 'mapbox/driving-traffic', // Use traffic-aware driving profile
        alternatives: true // Enable alternative routes
    });
    map.addControl(directions, "top-left");

    // Add a marker to represent the current location
    const currentLocationMarker = new mapboxgl.Marker({
        color: "red", // Marker color
        draggable: false // Marker is not draggable
    })
        .setLngLat(center)
        .setPopup(new mapboxgl.Popup().setText("You are here")) // Add a popup
        .addTo(map);

    const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
            polygon: true,
            trash: true
        }
    });
    map.addControl(draw);

    // Save location functionality
    const saveButton = document.getElementById("save-location");
    saveButton.addEventListener("click", () => {
        const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        favorites.push(center);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        alert("Location saved!");
    });

    // Share location functionality
    const shareButton = document.getElementById("share-location");
    shareButton.addEventListener("click", () => {
        const url = `${window.location.origin}?lat=${center[1]}&lng=${center[0]}`;
        navigator.clipboard.writeText(url);
        alert("Location link copied!");
    });

    // Theme change functionality
    const themeSelector = document.getElementById("theme-selector");
    themeSelector.addEventListener("change", function () {
        map.setStyle(themeSelector.value);
    });

    // Add search functionality using Mapbox Geocoder
    const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: {
            color: "orange"
        },
        placeholder: "Search location..."
    });
    document.getElementById('geocoder-container').appendChild(geocoder.onAdd(map));

    geocoder.on('result', function (result) {
        map.flyTo({
            center: result.result.center,
            zoom: 15
        });
    });
}