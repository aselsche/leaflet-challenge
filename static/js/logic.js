// Visualizing-Data-with-Leaflet 

// Earthquakes GeoJSON URL Variables
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
let platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Initialize & Create earthquake layerGroup
let earthquakes = new L.layerGroup();
let tectonicplates = new L.layerGroup();

// Define Variables for Tile Layers
let satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
});

let dark = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 18,
    accessToken: API_KEY
});

let streetmap = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 18,
    accessToken: API_KEY
});

var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Define baseMaps Object to Hold Base Layers
let baseMaps = {
    "Satellite": satelliteMap,
    "Dark": dark,
    "Street": streetmap,
    "Topographic Map": topo
};

// Create Overlay Object to Hold Overlay Layers
let overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": tectonicplates

};

// Create map
let map = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [satelliteMap, earthquakes]
});

// Create a Layer Control + Pass in baseMaps and overlayMaps + Add the Layer Control to the Map
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(map);

// Function to determine size of marker based on the magnitude of the earthquake
function markerSize(magnitude) {
    if (magnitude === 0) {
        return 1;
    }
    return magnitude * 3;
}
// Function to determine style of marker based on the magnitude of the earthquake
function styleInfo(feature) {
    return {
        opacity: 1,
        fillOpacity: 1,
        fillColor: chooseColor(feature.properties.mag),
        color: "#000000",
        radius: markerSize(feature.properties.mag),
        stroke: true,
        weight: 0.5
    };
}

// Function to determine color of marker based on the magnitude of the earthquake
function chooseColor(magnitude) {
    switch (true) {
        case magnitude > 5:
            return "#FF0000";
        case magnitude > 4:
            return "#FF6900";
        case magnitude > 3:
            return "#FFC100";
        case magnitude > 2:
            return "#E5FF00";
        case magnitude > 1:
            return "#8DFF00";
        default:
            return "#DAF7A6";
    }
}

// Retrieve earthquakesURL (USGS Earthquakes GeoJSON Data) with D3
d3.json(queryUrl).then(function (earthquakeData) {
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        // give each feature a Popup 
        onEachFeature: function (feature, layer) {
            layer.bindPopup(`
                <h4>Location: ${feature.properties.place}</h4>
                <hr><p>Date & Time: ${new Date(feature.properties.time)}</p>
                <hr><p>Magnitude: ${feature.properties.mag}</p>`);
        }
        // Add earthquakeData to earthquakes LayerGroups 
    }).addTo(earthquakes);
    // Add earthquakes layer to the map
    earthquakes.addTo(map);
});

// Retrieve platesURL (Tectonic plates GeoJSON data) with d3
d3.json(platesUrl).then(function (platedata) {
    // Adding our geoJSON data, along with style information, to the tectonicplates      
    // layer.      
    L.geoJson(platedata,
        {
            color: "#ff6700",
            weight: 2
        }
    )
        .addTo(tectonicplates);
    // Then add the tectonicplates layer to the map.      
    tectonicplates.addTo(map);
});


// Set Up Legend
let legend = L.control({ position: "bottomleft" });
legend.onAdd = function (map) {
    let div = L.DomUtil.create("div", "info legend leaflet-control-layers leaflet-control-layers-expanded"),
        magnitudeLevels = [0, 1, 2, 3, 4, 5];
    div.innerHTML += "<h3>Magnitude</h3>"
    for (let i = 0; i < magnitudeLevels.length; i++) {
        div.innerHTML +=
            `<p><span style="background-color: ${chooseColor(magnitudeLevels[i] + 1)}"></span>
            ${magnitudeLevels[i]} ${(magnitudeLevels[i + 1] ? '&ndash;' + magnitudeLevels[i + 1] + '' : '+')}</p>`;
    }
    console.log(div);
    return div;
};
// Add Legend to the Map
legend.addTo(map);
