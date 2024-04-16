// Set the access token for Mapbox services.
mapboxgl.accessToken = 'pk.eyJ1IjoiZG93ZWxsYWYiLCJhIjoiY2x0cjJjc2VqMGVtZzJrbnYwZjcxczdkcCJ9.ljRbHHEIuM4J40yUamM8zg';

// Initialize the Mapbox map by specifying the HTML container ID, style URL, initial geographical center, and zoom level.
const map = new mapboxgl.Map({
    container: 'map', // ID of the HTML container where the map will be displayed.
    style: 'mapbox://styles/dowellaf/cltr2h0h0007y01p7akad96el', // URL for the map's visual style.
    center: [0, 0], // Longitude and latitude of the map's initial center.
    zoom: 1 // Initial zoom level of the map.
});

// Declare a variable to store GeoJSON data, which will be used to store and manipulate geographic data format.
let geojsonData;

// Define a function to update average rainfall information based on visible map area.
function updateAverageRainfall() {
    if (!geojsonData) return; // Exit if geojsonData is not loaded.

    let bounds = map.getBounds(); // Retrieve the current geographic boundaries of the visible map area.
    let visibleFeatures = geojsonData.features.filter(feature => {
        let [lng, lat] = feature.geometry.coordinates; // Destructure coordinates of each feature.
        return bounds.contains([lng, lat]); // Filter to include only features within the current map bounds.
    });

    let totalRainfall = 0;
    let stationsWithRainfall = 0;

    // Calculate total rainfall and count stations with rainfall.
    visibleFeatures.forEach(feature => {
        let rainfall = parseFloat(feature.properties.rainfall); // Parse rainfall values to floating point.
        if (!isNaN(rainfall)) { // Check if the rainfall value is a valid number.
            totalRainfall += rainfall; // Accumulate total rainfall.
            if (rainfall > 0) { // Check if there is rainfall.
                stationsWithRainfall++; // Increment count of stations with rainfall.
            }
        }
    });

    let averageRainfall = (visibleFeatures.length > 0) ? (totalRainfall / visibleFeatures.length).toFixed(2) : 'N/A'; // Compute average rainfall if there are visible features, otherwise 'N/A'.
    
    // Update the HTML content of the element with ID 'info' with rainfall data.
    document.getElementById('info').innerHTML = 'Average Rainfall: ' + averageRainfall + ' mm<br>' +
                                                 'Total Rainfall: ' + totalRainfall.toFixed(2) + ' mm<br>' +
                                                 'Total Stations: ' + visibleFeatures.length + '<br>' +
                                                 'Stations with Rainfall > 0mm: ' + stationsWithRainfall;
}

// Event handler for the 'load' event of the map.
map.on('load', () => {
    // Fetch GeoJSON data asynchronously from a URL.
    fetch('https://raw.githubusercontent.com/muimran/soundbath/main/web/data/myData.geojson')
        .then(response => response.json()) // Parse the fetched data as JSON.
        .then(data => {
            geojsonData = data; // Store the parsed GeoJSON data.

            // Add a source of type 'geojson' containing the rainfall data to the map.
            map.addSource('rainfall-data', {
                'type': 'geojson',
                'data': geojsonData
            });

            // Define a heatmap layer to visualize rainfall intensity.
            map.addLayer({
                'id': 'rainfall-heat',
                'type': 'heatmap',
                'source': 'rainfall-data',
                'maxzoom': 9,
                'paint': {
                    'heatmap-weight': [
                        'interpolate',
                        ['linear'],
                        ['to-number', ['get', 'rainfall'], 0],
                        0,
                        0,
                        1,
                        1
                    ], // Defines how the weight of each data point scales with its rainfall value.
                    'heatmap-intensity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0,
                        1,
                        9,
                        3
                    ], // Adjusts the intensity of the heatmap based on the map's zoom level.
                    'heatmap-color': [
                        'interpolate',
                        ['linear'],
                        ['heatmap-density'],
                        0,
                        'rgba(33,102,172,0)',
                        0.2,
                        'rgba(172, 159, 219, 0.8)',
                        0.4,
                        'rgba(142, 120, 217, 0.8)',
                        0.6,
                        'rgba(116, 86, 218, 0.8)',
                        0.8,
                        'rgba(92, 56, 214, 0.8)',
                        1,
                        'rgba(48, 0, 208, 0.8)'
                    ], // Sets the color gradient of the heatmap, varying with the data density.
                    'heatmap-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0,
                        2,
                        10,
                        30,
                        14,
                        80
                    ], // Changes the radius of heatmap points based on zoom level.
                    'heatmap-opacity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        7,
                        1,
                        10,
                        1,
                        14,
                        0
                    ] // Controls the opacity of the heatmap, reducing it as zoom level increases.
                }
            }, 'waterway-label');

            // Define a circle layer to represent individual points of rainfall data visually.
            map.addLayer({
              'id': 'rainfall-point',
              'type': 'circle',
              'source': 'rainfall-data',
              'minzoom': 7,
              'paint': {
                  'circle-radius': [
                      'interpolate',
                      ['linear'],
                      ['zoom'],
                      7,
                      ['interpolate', ['linear'], ['to-number', ['get', 'rainfall'], 0], 0, 1, 10, 10],
                      16,
                      ['interpolate', ['linear'], ['to-number', ['get', 'rainfall'], 0], 0, 5, 10, 50]
                  ], // Adjusts circle size based on zoom level and rainfall amount.
                  'circle-color': [
                      'interpolate',
                      ['linear'],
                      ['to-number', ['get', 'rainfall'], 0],
                      0,
                      'rgba(33,102,172,0)',
                      .8,
                      'rgb(103,169,207)',
                      3,
                      'rgb(178,24,43)'
                  ], // Colors circles based on rainfall value, with a gradient from blue to red.
                  'circle-stroke-color': 'white', // Sets the stroke color of circles to white.
                  'circle-stroke-width': 1, // Sets the stroke width of circles.
                  'circle-opacity': [
                      'interpolate',
                      ['linear'],
                      ['zoom'],
                      8,
                      1,
                      22,
                      1
                  ] // Controls the opacity of circles, keeping them fully opaque across zoom levels.
              }
          }, 'waterway-label');

            // Initialize and update the average rainfall calculation.
            updateAverageRainfall();
        });

    // Bind an event handler to update average rainfall whenever the map stops moving.
    map.on('moveend', updateAverageRainfall);
});
