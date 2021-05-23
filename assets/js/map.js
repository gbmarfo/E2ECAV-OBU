let L = require('leaflet');  
let geoL = require('esri-leaflet');
let routing = require('leaflet-routing-machine');
let $ = require('jquery');
let map;
let currentLocation = [45.528, -122.680]
let originCoords = [];
let destCoords = [];
let routingControl;

$(function() {
    init();
    addressAutoComplete();
});

function init(){

    $('#originInput, #destinationInput').hide();  

    map = L.map('map', {
        zoomControl: false,
        attributionControl: false})
    .setView([45.528, -122.680], 13);
    geoL.basemapLayer('Streets').addTo(map);

    $('#btnLocation').on('click', function(){
        $('#originInput, #destinationInput').show();  
        $('#displayMain').hide();
    });
}

function getCurrentLocation(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          latit = position.coords.latitude;
          longit = position.coords.longitude;
          // this is just a marker placed in that position
          var abc = L.marker([position.coords.latitude, position.coords.longitude]).addTo(map);
          // move the map to have the location in its center
          map.panTo(new L.LatLng(latit, longit));
      });
    } 
}

function addressAutoComplete(){
    var originComplete, destinationComplete;

    originComplete = new google.maps.places.Autocomplete((
        document.getElementById('originInput')), 
            {types: ['geocode']
        });
    
    destinationComplete = new google.maps.places.Autocomplete(
        document.getElementById('destinationInput'), 
        { types: [ 'geocode' ] 
    });

    google.maps.event.addListener(originComplete, 'place_changed', function(){
        var origin = originComplete.getPlace();
        var latitude = origin.geometry.location.lat();
        var longitude = origin.geometry.location.lng();

        originCoords = [latitude, longitude]

        var marker = L.marker(originCoords).addTo(map);
        map.setView(new L.LatLng(latitude, longitude), map.getZoom(), { animation: true } );
        var address = origin.formatted_address.split(",");
        $('#titleOrigin').text(address[0]);
        $('#titleDestination').get(0).focus();
    });

    

    google.maps.event.addListener(destinationComplete, 'place_changed', function() {
        var destination = destinationComplete.getPlace();
        var latitude = destination.geometry.location.lat();
        var longitude = destination.geometry.location.lng();

        destCoords = [latitude, longitude]

        var marker = L.marker(destCoords).addTo(map);
        var address = destination.formatted_address.split(",");
        $('#titleDestination').text(address[0]);
        $('#originInput, #destinationInput').hide();  
        $('#displayMain').show();
        showRoute();
    });
}

function showRoute() {
    var fromLat, fromLng = originCoords;
    var toLat, toLng = destCoords;

    // clear routing traces
    if (routingControl) {
        map.removeControl(routingControl);
    }

    if (originCoords != null & destCoords != null) {
        routingControl = L.Routing.control({
            waypoints: [
                L.latLng(originCoords[0], originCoords[1]),
                L.latLng(destCoords[0], destCoords[1])
            ],
            routeWhileDragging: false,
            router: L.Routing.osrmv1({
                serviceUrl: 'http://ec2-52-87-17-58.compute-1.amazonaws.com:5000/route/v1'
            }),
            show: false,
            autoRoute: true
        }).addTo(map);
    }

    // update route distance and time
    routingControl.on('routesfound', function(e) {
        var routes = e.routes;
        var summary = routes[0].summary;

        $('#distanceLabel').text(Math.round(summary.totalDistance/1000) + ' km');
        $('#timeLabel').text(Math.round(summary.totalTime % 3600 / 60) + ' min');
    });
}

