var locations = initialData_js;
var map;
var placeTypes = ["All"];

// Temp to remove jshint issues
var ko, console, google, show;

// Sets 'show' array values for visibility control
// Also creates "types" list and sorts it by name
// Could move this to place-data app for pre-processing

function computeShowArray() {
    var testType;
    for (var i = 0; i < locations.length; i++) {
        show = ["All"];
        for (var j = 0; j < locations[i].infoAry.length; j++) {
            testType = locations[i].infoAry[j].type;
            // Store types in  array
            show.push(testType);
            // Store unique types in placeTypes array
            if (placeTypes.indexOf(testType) === -1) {
                placeTypes.push(testType);
            }
        }
        locations[i].show = show;
        placeTypes.sort();
    }
}
computeShowArray();

var MyViewModel = function(places) {
    'use strict';
    var self = this;
    self.placeTypes = ko.observableArray(placeTypes);
    // self.placeTypes = ko.observableArray([]);

    // Holds the currently selected place type
    self.selectedPlaceType = ko.observableArray(['All']);

    // self.placeFinderView = true;
    self.places = ko.observableArray(ko.utils.arrayMap(places, function(place) {
        return { name: place.name,
            url: place.url,
            addr1: place.addr1,
            addr2: place.addr2,
            lat: place.lat,
            lng: place.lng,
            infoAry: ko.observableArray(place.infoAry),
            show: ko.observableArray(place.show)
        };
    }));

    // Sort places by name
    self.sortNames = function() {
        // console.log("workingArray:", self.places());
        self.places.sort(function(a,b) {
            if (a.name > b.name) {
                return 1;
            } else if (a.name < b.name) {
                return -1;
            } else {
                return 0;
            }
        });
    };
    self.sortNames();

    // Find out if the current item includes the selected type
    // Enables/disables visible
    self.includesSelectedType = function (selected, show) {
        if (show.indexOf(selected()[0]) >= 0) {
            return true;
        } else {
            return false;
        }
    };


    // self.enableSelectedType();
    self.debug = function() {
        console.log("debug");
        console.log("self.selectedPlaceType:", self.selectedPlaceType());
    };
};


// function getGeocode(address, k) {
//     // k is index for locations
//     geocoder = new google.maps.Geocoder();
//     geocoder.geocode({ 'address': address }, function(results, status) {
//       if (status === google.maps.GeocoderStatus.OK) {
//         console.log("status OK", results[0].geometry.location);

//         // map.setCenter(results[0].geometry.location);
//         // var marker = new google.maps.Marker({
//         // map: map,
//         // position: results[0].geometry.location
//         locations[k]["lat"] = results[0].geometry.location.A;
//         locations[k].lng = results[0].geometry.location.F;

//       } else {
//         console.log("status not okay on item:", status);
//         return results[0].geometry.location;
//       }
//     });
// }

// Reference for Places table: http://jsfiddle.net/rniemeyer/gZC5k/

function setMarkers(map, locations) {
    // add markers to map
    for (var i = 0; i < locations.length; i++) {
        var location = locations[i];
        var latLng = new google.maps.LatLng(location.lat, location.lng);
        var marker = new google.maps.Marker({
            position: latLng,
            map: map,
            title: location.name
        });
    }
}


function initialize() {
    var mapCanvas = document.getElementById('map-canvas');
    var mapOptions = {
        center: new google.maps.LatLng(35.64222479297878, -120.68633100585936),
        zoom: 11,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(mapCanvas, mapOptions);
    return map;
}

$(document).ready(function () {
   map = initialize();
   // var map = initialize();
   // (map, wineries);
});


ko.applyBindings(new MyViewModel(locations));
// var viewModel = new MyViewModel(initialData);
