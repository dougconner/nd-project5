var locations = initialData_js;
var map;
var placeTypes = ["All"];
var markerArray = [];
var infowindowArray = [];
// var infowindow;

// Temp to remove jshint issues
var ko, console, google, show;

// sort locations by name
var sortNames = function() {
    // console.log("workingArray:", self.places());
    locations.sort(function(a,b) {
        if (a.name > b.name) {
            return 1;
        } else if (a.name < b.name) {
            return -1;
        } else {
            return 0;
        }
    });
};
sortNames();


// Sets 'show' array values for visibility control
// Also creates "types" list and sorts it by name
// Could move this to place-data app for pre-processing

var computeShowArray = function() {
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
        locations[i].index = i;
        placeTypes.sort();
    }
};
computeShowArray();

var computeContentString = function() {
    for (var i = 0; i < locations.length; i++) {
        var contentString = "";
        for (var j = 0; j < locations[i].infoAry.length; j++) {
            contentString += "<p>";
            contentString += locations[i].infoAry[j].type + ": ";
            contentString += locations[i].infoAry[j].infoText + "</p>";
        }
        locations[i].infoWindowContent = contentString;
        // console.log("conent stored:", contentString);
        locations[i].latLng = new google.maps.LatLng(locations[i].lat, locations[i].lng);
    }
};
computeContentString();

var closeInfoWindows = function() {
    for (var i = 0; i < markerArray.length; i++) {
        infowindowArray[i].close(markerArray[i].get('map'), markerArray[i]);
    }
};


var MyViewModel = function(places) {
    'use strict';
    var self = this;
    self.placeTypes = ko.observableArray(placeTypes);
    // self.placeTypes = ko.observableArray([]);

    // Holds the currently selected place type
    self.selectedPlaceType = ko.observableArray(['All']);

    // search text
    self.searchText = ko.observable("");

    self.places = ko.observableArray(ko.utils.arrayMap(places, function(place) {
        return { name: place.name,
            index: place.index,
            url: place.url,
            addr1: place.addr1,
            addr2: place.addr2,
            lat: place.lat,
            lng: place.lng,
            infoAry: ko.observableArray(place.infoAry),
            show: ko.observableArray(place.show),
            infoWindowContent: place.infoWindowContent
        };
    }));

    // Find out if the current item includes the selected type
    // Enables/disables visible
    self.includesSelectedType = function (selected, index, show) {

        if (show.indexOf(selected()[0]) >= 0) {
            self.showMarker(index);
            // return true;

            // search code
            if(self.places()[index].name.indexOf(self.searchText()) !== -1) {
                return true;
            }
        }
            self.hideMarker(index);
            return false;
    };

    // search action
    self.searchForText = function() {
        console.log("self.searchText:", self.searchText());
        // search through all names for match
        // look for string and selected type match
        for (var i = 0; i < self.places().length; i++) {
            // console.log(self.places()[i].name);
            // console.log("index:", i);
            if (self.places()[i].show.indexOf(self.selectedPlaceType()[0]) !== -1) {
                if (self.places()[i].name.indexOf(self.searchText()) !== -1) {
                    console.log("match: ", self.searchText());
                }
            }
        }
    };

    // show markers
    self.showMarker = function(i) {
        // console.log("showMarker");
        // console.log("markerArray", markerArray);
        // for (var i = 0; i < locations.length; i++) {
                markerArray[i].setMap(map);
        // }
    };

    // hide markers
    self.hideMarker = function(i) {
        // console.log("hideMarker");
        // console.log("markerArray", markerArray);
        markerArray[i].setMap(null);
        for (var i = 0; i < markerArray.length; i++) {
            infowindowArray[i].close(markerArray[i].get('map'), markerArray[i]);
        }
    };

    // close info windows before opening another to follow best practice of
    // a single info window open at a time
    self.closeInfoWindows = function() {
        for (var i = 0; i < markerArray.length; i++) {
            infowindowArray[i].close(markerArray[i].get('map'), markerArray[i]);
        }
    };

    self.showMarkers = function() {
        // for (var i = 0; i < locations.length; i++) {
        //     markerArray[i].visible = true;
        // }

    };

    self.showInfoWindow = function(index) {
        console.log("ran showIfoWindos");
        // First clear any existing info windows
        self.closeInfoWindows();
        infowindowArray[index].open(markerArray[index].get('map'), markerArray[index]);
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
// var markers = {
//     place1: {lat: "35.6549549", lng: "-120.90086100000002", visible: true},
//     place2: {lat: "35.5557948", lng: "-120.73473939999997", visible: true}
//     };

// var posMarkers = [];

// for (var marker in markers) {
//       posMarkers[marker] = new google.maps.Marker({
//         position: new google.maps.LatLng(markers[marker].lat, markers[marker].lng),
//         map: map,
//         visible: markers[marker].visible
//       });
// }

function setMarkers(map, locations) {
    // add markers to map
    // infowindow = new google.maps.InfoWindow({}); // Just one info window per best practice
    console.log("locations:", locations);
    for (var i = 0; i < locations.length; i++) {
        var marker = new google.maps.Marker({
            position: locations[i].latLng,
            map: map,
            title: locations[i].name,
            visible: true
        });
        markerArray[i] = marker;

        // Attach info text
        attachInfotext(marker, i);
    }
}

function attachInfotext(marker, i) {
    var infowindow = new google.maps.InfoWindow({
        content: locations[i].infoWindowContent
    });

    // Store for list recall
    infowindowArray[i] = infowindow;

    google.maps.event.addListener(marker, 'click', function() {
        closeInfoWindows();
        infowindow.open(marker.get('map'), marker);
    });
}

        // console.log("infowindow:", infowindow);
        // console.log("listener:", listener);
        // console.log("markerArray[i]:", markerArray[i]);


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
    // disable map while working on other stuff
    map = initialize();
    setMarkers(map, locations);
    ko.applyBindings(new MyViewModel(locations));
});


