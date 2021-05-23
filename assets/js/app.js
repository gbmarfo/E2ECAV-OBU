var autocomplete;
var locationInput = 'location'

autocomplete = new google.maps.places.Autocomplete((
    document.getElementById(locationInput)), 
        {types: ['geocode']
    });

google.maps.event.addListener(autocomplete, 'place_changed', function(){
    var near_place = autocomplete.getPlace();
    var latitude = near_place.geometry.location.lat();
    var longitude = near_place.geometry.location.lon();
    console.log(near_place.geometry.location.lat());
});