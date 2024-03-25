mapboxgl.accessToken = 'pk.eyJ1IjoiZG93ZWxsYWYiLCJhIjoiY2x0cjJjc2VqMGVtZzJrbnYwZjcxczdkcCJ9.ljRbHHEIuM4J40yUamM8zg';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/dowellaf/cltr2h0h0007y01p7akad96el', // style URL
    center: [0, 0], // starting position
    zoom: 1 // starting zoom
});

let geojsonData;

// Web Audio API setup
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Function to play a note
function playTone(freq, duration) {
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

// Map numbers to notes (frequencies) in Hz - C4 to B4 chromatic scale
const notes = [261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88];

// Generate and play a sequence based on a number
function generateMusic(number) {
    const rootFreq = notes[number];
    const duration = 0.5; // seconds
    const scale = [rootFreq, rootFreq * 1.12246, rootFreq * 1.18921, rootFreq * 1.33484]; // Example scale intervals

    scale.forEach((freq, index) => {
        setTimeout(() => playTone(freq, duration), index * 500);
    });
}

// Function to update average rainfall and play music
function updateAverageRainfall() {
    if (!geojsonData) return;

    let bounds = map.getBounds();
    let visibleFeatures = geojsonData.features.filter(feature => {
        let [lng, lat] = feature.geometry.coordinates;
        return bounds.contains([lng, lat]);
    });

    let totalRainfall = 0;
    visibleFeatures.forEach(feature => {
        let rainfall = parseFloat(feature.properties.rainfall);
        if (!isNaN(rainfall)) {
            totalRainfall += rainfall;
        }
    });

    let averageRainfall = (visibleFeatures.length > 0) ? (totalRainfall / visibleFeatures.length).toFixed(2) : 'N/A';

    // Update DOM element with rainfall information
    document.getElementById('info').innerHTML = 'Average Rainfall: ' + averageRainfall + ' mm';

    // Convert average rainfall to a number between 0 and 11 and play music
    let musicNumber = Math.abs(Math.round(averageRainfall)) % 12;
    generateMusic(musicNumber);
}

// Map setup and data fetching
map.on('load', () => {
    // Fetch GeoJSON data
    fetch('https://YOUR_GEOJSON_DATA_URL')
        .then(response => response.json())
        .then(data => {
            geojsonData = data;

            // Add a geojson point source for the rainfall data
            map.addSource('rainfall-data', {
                'type': 'geojson',
                'data': geojsonData
            });

            // Heatmap layer
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
                    ],
                    'heatmap-intensity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0,
                        1,
                        9,
                        3
                    ],
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
                    ],
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
                    ],
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
                    ]
                }
            }, 'waterway-label');


            // Circle layer to represent individual points
        map.addLayer({
          'id': 'rainfall-point',
          'type': 'circle',
          'source': 'rainfall-data',
          'minzoom': 7,
          'paint': {
              // Circle radius based on rainfall value
              'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  7,
                  ['interpolate', ['linear'], ['to-number', ['get', 'rainfall'], 0], 0, 1, 10, 10],
                  16,
                  ['interpolate', ['linear'], ['to-number', ['get', 'rainfall'], 0], 0, 5, 10, 50]
              ],
              // Circle color based on rainfall value
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
              ],
              'circle-stroke-color': 'white',
              'circle-stroke-width': 1,
              // Circle opacity adjustment based on zoom level
              'circle-opacity': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  8,
                  1,
                  22,
                  1
              ]
          }
      }, 'waterway-label');
            // Initialize and update the average rainfall calculation
            updateAverageRainfall();
        });

    // Update the average rainfall and play music when the map is moved
    map.on('moveend', updateAverageRainfall);
});
