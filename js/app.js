var wineries = [
    {"name": "Epoch Estate Wines",
    "lat": 35.5437,
    "lng": -120.8274
    },
    {"name": "Sculpterra Winery",
    "lat": 35.6064,
    "lng": -120.6073
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
    addr2: "Atas, CA",
    zip: 93422,
    lat: "",
    lng: ""
    }
];

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

    self.lookupPlace = function(place) {
        console.log("lookupPlace code here");
    };

    self.save = function() {
        self.lastSavedJson(JSON.stringify(ko.toJS(self.places), null, 2));
    };

    self.lastSavedJson = ko.observable("");
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
   var map = initialize();
   setMarkers(map, wineries);
});

// this.placefind;

ko.applyBindings(new MyViewModel(initialData));
// var viewModel = new MyViewModel(initialData);
