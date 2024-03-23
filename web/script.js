// a default starting location, doesn't really matter
let lat = 51.505;
let lng = -0.09;

// make a blank map and add some tiles
let map = L.map('map').setView([lat, lng], 4);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// a variable to store our data
let ourData = [];

// variable to keep a reference to all our markers
let markers = [];

// a function to retrieve the latest data from the repository
function getData() {
    fetch('data/data.csv')
    .then(response => response.text())
    .then(data => {
        Papa.parse(data, {
            skipEmptyLines: true,
            complete: function(results) {
                ourData = results.data;
                clearTable();
                writeTable(ourData);
                clearMarkers();
                drawMarkers(ourData);
            }
        });
    });
}

function clearTable() {
    document.getElementById('data').innerHTML = '';
}

function clearMarkers() {
    markers.forEach(marker => {
        marker.remove();
    });
    markers = [];
}

// draw markers on the map for each data point
function drawMarkers(data) {
    data.forEach(row => {
        let m = L.marker([+row[0], +row[1]]).bindPopup(`data: ${row[2]}`).addTo(map);
        markers.push(m);
    });
} 

// write the data into an HTML table
function writeTable(data) {
    const table = document.createElement('table');
    data.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(column => {
            const td = document.createElement('td');
            td.textContent = column;
            tr.appendChild(td);
        });
        table.appendChild(tr);
        document.getElementById('data').appendChild(table);
    });
}

// call the function that kicks it all off
getData();

// make the page update every hour
setInterval(getData, (1000 * 60 * 60)); // every hour