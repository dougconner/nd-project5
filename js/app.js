var wineries = [
    {"name": "Epoch Estate Wines",
    "lat": 35.5437,
    "lng": -120.8274
    },
    {"name": "Sculpterra Winery",
    "lat": 35.6064,
    "lng": -120.6073
    },
    {"name": "Ventuex Vineyards",
    "lat": 35.5557948,
    "lng": -120.73473939999997
    },
    {"name": "Paso Robles",
    "lat": 35.64222479297878,
    "lng": -120.68633100585936
    }
];

var initialData = [
    { name: "me",
    url: "www.solarheatengines.com",
    addr1: "12170 Cenegal Rd",
    addr2: "Atascadero, CA",
    zip: 93422,
    lat: "1",
    lng: "2"
    },
  {
    name: "Ventuex Vineyards",
    url: "www.ventuexvineyards.com",
    addr1: "1795 Las Tablas Road",
    addr2: "Templeton, CA ",
    zip: '93465',
    lat: "",
    lng: ""
  }
];

locations = [];

var map;

// Reference for Places table: http://jsfiddle.net/rniemeyer/gZC5k/

function MyViewModel(places) {
    // 'use strict';
    var self = this;
    self.placeFinderView = true;
    self.places = ko.observableArray(ko.utils.arrayMap(places, function(place) {
        return { name: place.name,
            url: place.url,
            addr1: place.addr1,
            addr2: place.addr2,
            zip: place.zip,
            lat: place.lat,
            lng: place.lng
        };
    }));

    self.addPlace = function() {
        self.places.push({
            name: "",
            url: "",
            addr1: "",
            addr2: "",
            zip: "",
            lat: "",
            lng: ""
        });
    };

    self.removePlace = function(place) {
        self.places.remove(place);
    };

    self.save = function() {
        self.lastSavedJson(JSON.stringify(ko.toJS(self.places), null, 2));
    };

    self.lastSavedJson = ko.observable("");

    self.logData = function() {
        console.log("locations.length: ", locations.length);
        for (var i = 0; i < locations.length; i++) {
            console.log("{");
            for (var item in locations[i]) {
                console.log("  " + item + ": " + '"' + locations[i][item] + '"');
            }
            if (i < locations.length - 1) {
                console.log("},");
            } else {
                console.log("}");
            }
        }
    };

    self.lookupPlace = function(places) {
        var locationData = [];
        console.log("here2");

        function locationFinder() {
            var locationData = [];
            for (var i = 0; i < self.places().length; i++) {
                // try city, state first, then full address
                locationData.push(self.places()[i].addr1 + ' ' + self.places()[i].addr2);
            }
            console.log("locationData: ", locationData);
            return locationData;
        }

        function getCoordinates(locationData) {
            var locations = [];
            var lat;
            var lng;
            // go through places array and look for places with lat <= 0
            for (var i = 0; i < self.places().length; i++) {
                var name = self.places()[i].name;
                var url = self.places()[i].url;
                var addr1 = self.places()[i].addr1;
                var addr2 = self.places()[i].addr2;
                var zip = self.places()[i].zip;

                if (self.places()[i].lat === "") {
                    // get geocode lat and lng
                    console.log("here3");
                    geocoder = new google.maps.Geocoder();
                    geocoder.geocode({ 'address': locationData[i] }, function(results, status) {
                      if (status == google.maps.GeocoderStatus.OK) {
                        console.log(results[0].geometry.location);
                        lat = results[0].geometry.location.A;
                        lng = results[0].geometry.location.F;
                        locations.push({
                            name: name,
                            url: url,
                            addr1: addr1,
                            addr2: addr2,
                            zip: zip,
                            lat: lat,
                            lng: lng
                        });

                        // locations[i].lng = results[0].geometry.location;
                        // self.places()[i].lng = results[0].geometry.location.F;
                        // map.setCenter(results[0].geometry.location);
                        // var marker = new google.maps.Marker({
                        // map: map,
                        // position: results[0].geometry.location
                      // });
                        console.log("lat-if: ", lat);
                      }
                    });
                } else {
                    // Use the existing lat and lng values
                    locations.push({
                        name: name,
                        url: url,
                        addr1: addr1,
                        addr2: addr2,
                        zip: zip,
                        lat: self.places()[i].lat,
                        lng: self.places()[i].lng
                    });
                    console.log("lat-else: ", lat);
                }
            }

            // for (var i = 0; i < locationData.length; i++) {
            //     // placeholder for location if status is not OK
            //     locations[i] = 0;
            // }
            return locations;
        }
        console.log("here4");
        locations = getCoordinates(locationFinder());
    };
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
   setMarkers(map, wineries);
});

// this.placefind;

ko.applyBindings(new MyViewModel(initialData));
// var viewModel = new MyViewModel(initialData);
