var locations = initialData_js;
var map;

var MyViewModel = function(places) {
    'use strict';
    var self = this;
    var workingArray = ko.observableArray(); // for use in sorting and filtering
    // self.placeFinderView = true;
    self.places = ko.observableArray(ko.utils.arrayMap(places, function(place) {
        return { name: place.name,
            url: place.url,
            addr1: place.addr1,
            addr2: place.addr2,
            lat: place.lat,
            lng: place.lng,
            infoAry: ko.observableArray(place.infoAry)
        };
    }));
    self.workingArray = self.places;

    self.sortNames = function() {
        self.workingArray = self.places;
        console.log("workingArray:", self.workingArray());
        // self.places.sort(function(a,b) {
        self.workingArray.sort(function(a,b) {
            if (a.name > b.name) {
                return 1;
            } else if (a.name < b.name) {
                return -1;
            } else {
                return 0;
            }
        });
    }

    self.listByType = function(infoAry, type) {
        self.workingArray = self.places;
        // get all the types first
        var types = [];
        var testType;
        console.log("got here");
        for (var i = 0; i < self.workingArray().length; i++) {
            console.log("self.workingArray()[i].infoAry.length", self.workingArray()[i].infoAry());
            for (var j = 0; j < self.workingArray()[i].infoAry().length; j++) {
                console.log("self.workingArray()[i].infoAry", self.workingArray()[i].infoAry[j]);
                testType = self.workingArray()[i].infoAry()[j].type;
                console.log("self.workingArray()[i].infoAry:", self.workingArray()[i].infoAry);
                if (types.indexOf(testType) === -1) {
                    types.push(testType);
                }
            }
        }
        console.log("types:", types);
    }
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

function MyViewModel(places) {
    // 'use strict';
    var self = this;

}

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


ko.applyBindings(new MyViewModel(initialData_js));
// var viewModel = new MyViewModel(initialData);
