var enableMarkerLoad = false;
var CLIENT_ID = "5MLJLSYO3U3D1NXRVDTDLYYWXNHP0CEMUOEG1C2ECMD20VO2";
var CLIENT_SECRET = "40QSTRMCYD4IOTESKJVF532Z015MMI2M35GUXO2K5UQBQDYH";


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
        // for (var j = 0; j < locations[i].infoAry.length; j++) {
        //     contentString += "<p>";
        //     contentString += locations[i].infoAry[j].type + ": ";
        //     contentString += locations[i].infoAry[j].infoText + "</p>";
        // }

        // Text from my database
        contentString += "<p>";
        contentString += locations[i].name + "<br>";
        contentString += locations[i].url;
        contentString += "</p>";

        // image and test from FourSquare
        contentString += "<img id='info-img" + i + "' alt='Venue photo' title='' src='' />";
        contentString += "<p id='info-text" + i + "'></p>";
        // Move the following to be added if a photo is available, just an id placeholder here
        // contentString += "<p>Photo provided by <a href='https://foursquare.com'>Foursquare</a>";
        contentString += "</p>";
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

var toggleBounce = function(index) {
    var marker = markerArray[index];
    if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        window.setTimeout(function() {
            toggleBounce(index);
        }, 2100);
    }
};



var get4sqSearch = function(index) {
    var lat = locations[index].lat;
    var lng = locations[index].lng;
    var name = locations[index].name;
    console.log("lat, lng: ", lat, lng);

    var jqxhr = $.get("https://api.foursquare.com/v2/venues/search" +
        "?ll=" + lat +"," + lng +
        "&client_id=" + CLIENT_ID +
        "&client_secret=" + CLIENT_SECRET +
        "&limit=1" +
        "&v=20140115" +
        "&query=" + name +
        "&intent=match" +
        "&m=foursquare",
        function(data) {
            // console.log("testData: " + JSON.stringify(data));

            // if the id is undefined, then the venue is not listed.
            if (!data.response.venues[0]) {
                var textStr = "This venue was not found at <a href='https://foursquare.com'>Foursquare</a>";
                // "This venue was not found in https://foursquare.com/";
                // console.log("textStr=" + textStr);
                $('#info-text' + index).append(textStr);
                $('#info-img' + index).attr('alt', "Venue photo not available");
            } else {
                var id = data.response.venues[0].id;
                var name = data.response.venues[0].name;
                // console.log("id", JSON.stringify(id));
                // console.log("id:", id);
                // console.log("name:", name);
                var result = {id: id, name: name};
                // return result;
                // var result = get4sqSearch(index);
                console.log("name, id:", result.name, result.id);
                get4sqVenueDetail(index, name, id);
            }

            console.log("success");
        }
    )

      .done(function() {
       console.log("jqxhr: " + jqxhr);
       console.log( "second success" );
    })
        .fail(function() {
        console.log( "error" );

    });

        jqxhr.always(function() {
        console.log( "finished" );
    });
};

var get4sqVenueDetail = function(index, name, id) {
    var venueID = id;

    var jqxhr = $.get("https://api.foursquare.com/v2/venues/" + venueID +
        "?client_id=" + CLIENT_ID +
        "&client_secret=" + CLIENT_SECRET +
        "&v=20140115" +
        "&m=foursquare",
        function(data) {
            // console.log("testData: " + JSON.stringify(data));
            // console.log("testData: " + JSON.stringify(data.response));

            var bestPhoto = JSON.stringify(data.response.venue.bestPhoto);
            var bestPhotoPrefix = JSON.stringify(data.response.venue.bestPhoto.prefix);
            var url = data.response.venue.canonicalUrl;

            var photoStr = '' +
                data.response.venue.bestPhoto.prefix +
                'cap300' +
                data.response.venue.bestPhoto.suffix;
            // console.log("photoStr = " + photoStr);

            var textStr = '<a href="' + url + '?ref=' + CLIENT_ID + '">' + name + '</a>';
            var textStr2 = "<br>Photo provided by: <br><a href='https://foursquare.com'>Foursquare</a>";
            // console.log("textStr and 2:", textStr, textStr2);
            // Now load or reload the info window with the photo
            $('#info-text' + index).append(textStr);
            $('#info-text' + index).append(textStr2);
            $('#info-img' + index).attr('src', photoStr);

            // The following puts the name in the tool-tip of image and marker
            $('#info-img' + index).attr('title', name);


            console.log("success");
        }
    )

      .done(function() {
       console.log("jqxhr: " + jqxhr);
       console.log( "second success" );
    })
        .fail(function() {
        console.log( "error" );

    });

        jqxhr.always(function() {
        console.log( "finished" );
    });
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

    // Find out if the current item includes the selected type & search filter
    // Enables/disables list visibility
    self.includesSelectedType = function (selected, index, show) {
        if (show.indexOf(selected()[0]) >= 0) {
            // Includes selected type
            self.showMarker(index);

            if(self.places()[index].name.indexOf(self.searchText()) !== -1) {
                // Also satisfies search text
                return true;
            }
        }
        self.hideMarker(index);
        // Fails at least one of the two above conditions
        return false;
    };

    // search action
    self.searchForText = function() {
        console.log("self.searchText:", self.searchText());
        // search through all names for match
        // look for string and selected type match
        for (var i = 0; i < self.places().length; i++) {
            if (self.places()[i].show.indexOf(self.selectedPlaceType()[0]) !== -1) {
                if (self.places()[i].name.indexOf(self.searchText()) !== -1) {
                    console.log("match: ", self.searchText());
                }
            }
        }
    };

    // show markers
    self.showMarker = function(i) {
        markerArray[i].setMap(map);
    };

    // hide markers
    self.hideMarker = function(i) {
        markerArray[i].setMap(null);
        for (var i = 0; i < markerArray.length; i++) {
            infowindowArray[i].close(markerArray[i].get('map'), markerArray[i]);
        }
    };

    // Test ajax with foursquare
    self.foursquareTest = function(index) {
        // console.log("CS:", CLIENT_SECRET);
        // console.log("CI:", CLIENT_ID);
        // get4sqSearch(index);
        get4sqSearch(index);
        // console.log("name, id:", result.name, result.id);
        // get4sqVenueDetail(index);
    };


    // close info windows before opening another to follow best practice of
    // a single info window open at a time
    self.closeInfoWindows = function() {
        for (var i = 0; i < markerArray.length; i++) {
            infowindowArray[i].close(markerArray[i].get('map'), markerArray[i]);
            $('#info-img').attr('src', '');
        }
    };

    self.showInfoWindow = function(index) {
        console.log("ran showInfoWindows");
        // First clear any existing info windows
        self.closeInfoWindows();
        if(enableMarkerLoad) {
            infowindowArray[index].open(markerArray[index].get('map'), markerArray[index]);
            toggleBounce(index);
            self.foursquareTest(index);
        }
        // self.foursquareTest(index);
    };

};

/************ Google map code, outside KO ************/

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
        content: locations[i].infoWindowContent,
        maxWidth: 300
    });

    // Store for list recall
    infowindowArray[i] = infowindow;

    google.maps.event.addListener(marker, 'click', function() {
        closeInfoWindows();
        $('#info-img').attr('src', '');
        infowindowArray[i].open(markerArray[i].get('map'), markerArray[i]);
        get4sqSearch(i);
    });
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
    // disable map while working on other stuff
    map = initialize();
    setMarkers(map, locations);
    ko.applyBindings(new MyViewModel(locations));
    console.log("maps loaded");
    window.setTimeout(function() {
        enableMarkerLoad = true;
    }, 2000);
});



