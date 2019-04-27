// Store our API endpoint inside queryUrl
//var queryUrl = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";
// Change the URL to the 7 day all earthquakes URL from the US Geological Survey
// https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
// This is ultra convenient

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  console.log(data.features)
});


function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
 // function onEachFeature(feature, layer) {
 //   layer.bindPopup("<h3>" + feature.properties.place +
 //   "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
 // } 
   
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array

  var earthquakes = L.geoJSON(earthquakeData, { 
    pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {        // circleMarker creates interactive bubbles, that size with the screen size
        radius: markerSize(feature.properties.mag),  
        fillcolor: fillcolor(feature.properties.mag),
        color: "black",   // the color of the outline shape
        weight: 0.6, 
        opacity: 0.4,     // this is the opacity of the outline shape
        fillOpacity: 0.6  // this is the opacity inside the shape
      });
      },

    // Create popups which show the features of each circle
    onEachFeature: function (feature, layer) {
      return layer.bindPopup(`<strong>Place:</strong> ${feature.properties.place}
    <br><strong>Magnitude:</strong> ${feature.properties.mag}`); 
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


// Setup the legend for the magnitude of the earthquakes
var legend = L.control({ position: "bottomright"});
  legend.onAdd = function() {
    var div = L.DomUtil.create('div', 'info legend'),
    magnitude = [0,1,2,3,4,5,6],
    labels = [];

    for (var i = 0; i < magnitude.length; i++)  {
      div.innerHTML +=
        '<i style="background:' + fillColor(magnitude[i] + 1) + '"></i> ' +
        magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>': '+');
    }

    return div;
};

// adding legend to the map

legend.addTo(myMap);
 };

// Define the colors depending on the quake magnitude
function fillColor(mag) {
    switch (true) {
      case mag >= 6.0:
        return 'red';
        break;

    case mag >= 5.0:
      return 'orangered';
      break;

    case mag >= 4.0:
      return 'darkorange';
      break;
      
    case mag >= 3.0:
      return 'orange';
      break;

    case mag >= 2.0:
      return 'gold';
      break;

    case mag >= 1.0:
      return 'yellow';
      break;

    default:
      return 'greenyellow';
    };
};

// Update the marker size

function markerSize(mag) {
  return mag*3;
}
