    var storedData = JSON.parse(localStorage.getItem('workingData'));
    if (storedData != null) {
        // console.log("storedData:\n", storedData);
        // load storedData as initialData
        initialData = storedData
    } else {
        console.log("No local data found");
        // Use initialData_js in data.js
        initialData = initialData_js;
    }

var workingData = [];
var locations = [];
/*
var map;

function getGeocode(address, k) {
    // k is index for locations
    geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': address }, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        console.log("status OK", results[0].geometry.location);

        // map.setCenter(results[0].geometry.location);
        // var marker = new google.maps.Marker({
        // map: map,
        // position: results[0].geometry.location
        locations[k]["lat"] = results[0].geometry.location.A;
        locations[k].lng = results[0].geometry.location.F;

      } else {
        console.log("status not okay on item:", status);
        return results[0].geometry.location;
      }
    });
}
*/



// Reference for Places table: http://jsfiddle.net/rniemeyer/gZC5k/
var MyViewModel = function(places) {
    'use strict';
    var self = this;
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

    self.addPlace = function() {
        self.places.push({
            name: "",
            url: "",
            addr1: "",
            addr2: "",
            lat: "",
            lng: "",
            infoAry: ko.observableArray()
        });
    };

    self.removePlace = function(place) {
        self.places.remove(place);
    };

    self.addInfo = function(place) {
        place.infoAry.push({
            type: "",
            infoText: ""
        });
    };

    self.removeInfo = function(info) {
        $.each(self.places(), function() {
            this.infoAry.remove(info)
        });
    };

    // Generates text for textarea display
    // Stores data locally
    // Does not lookup the lat-lng values
    self.generateDataArray = function() {

        // zero workingData
        workingData =[];

        // The current data used by KO
        var nameD;
        var urlD;
        var addr1D;
        var addr2D;
        var latD;
        var lngD;
        var infoAryD;

        for (var j = 0; j < self.places().length; j++) {
            nameD = self.places()[j].name;
            urlD = self.places()[j].url;
            addr1D = self.places()[j].addr1;
            addr2D = self.places()[j].addr2;
            latD = self.places()[j].lat;
            lngD = self.places()[j].lng;
            infoAryD = self.places()[j].infoAry();

            // load current data into workingData array
            workingData.push({
                name: nameD,
                url: urlD,
                addr1: addr1D,
                addr2: addr2D,
                lat: latD,
                lng: lngD,
                infoAry: infoAryD
            });
        }
        // workingData is stored locallly as the new initialData
        localStorage.setItem('workingData', JSON.stringify(workingData));

        // The following string result is displayed in the textarea and may
        // be copied & pasted into the data.js file, overwriting the previous
        // version for the initialData_js data. Might want to keep the old
        // version as backup
        var string = "var initialData_js = \n[\n";
        // var string = "";
        for (var i = 0; i < workingData.length; i++) {
            string += "  {\n";
            for (var item in workingData[i]) {

                if (item === 'infoAry') {
                    string += "  " + item + ": ";
                    string += "[\n";
                    for (var j = 0; j < workingData[i][item].length; j++) {
                            string += "    {type: "  + '"' + workingData[i][item][j]["type"] + '", ';
                            string += "infoText: "  + '"' + workingData[i][item][j]["infoText"] + '"}';
                            string += ",\n";
                    }
                    string += "    ]";
                } else {
                    string += "  " + item + ": " + '"' + workingData[i][item] + '"';
                    string += ",\n";
                }
            }
            if (i < workingData.length - 1) {
                string += "\n  },\n";
            } else {
                string += "\n  }\n";
            }
        }
        string += "];";

        // place the string in the textarea
        var textarea = document.getElementById("textarea");
        textarea.value = string;
        return string;
        // console.log("generateLocationsObj output: ");
        // console.log(string);
    };
/*
    self.showInitialData = function() {
        string = self.generateLocationsObj(self.places());
        var textarea = document.getElementById("textarea");
        textarea.value = string;
        console.log("string: ", string);
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
            locations = [];

            var nameD;
            var urlD;
            var addr1D;
            var addr2D;
            var infoD;
            var latD;
            var lngD;

            console.log("self.places.length(): ", self.places().length);
            // The starting data
            for (var j = 0; j < self.places().length; j++) {
                nameD = self.places()[j].name;
                urlD = self.places()[j].url;
                addr1D = self.places()[j].addr1;
                addr2D = self.places()[j].addr2;
                infoD = self.places()[j].info;
                latD = self.places()[j].lat;
                lngD = self.places()[j].lng;

                // load current data into locations array
                locations.push({
                    name: nameD,
                    url: urlD,
                    addr1: addr1D,
                    addr2: addr2D,
                    info: infoD,
                    lat: latD,
                    lng: lngD
                });
                console.log("locations[j]:", locations[j]);
                console.log("locations[j].lat", locations[j].lat);
            }

            // Update lat and lng values for cases where none exists and lookup sucessful
            for (var k = 0; k < locations.length; k++) {

                // Don't overwrite existing values, only ones where lat is 0
                if (locations[k].lat === "0") {
                    var results = getGeocode(locationData[k], k);
                }
            }
            // probably not using the return, locations written in getGeocode()
            return locations;
        }
        // probably use the return above or this, but shouldn't need both
        locations = getCoordinates(locationFinder());
    };
*/
};



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

/*
$(document).ready(function () {
   map = initialize();
   // var map = initialize();
   setMarkers(map, wineries);
});

// this.placefind;
*/
ko.applyBindings(new MyViewModel(initialData));
// var viewModel = new MyViewModel(initialData);
