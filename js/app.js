var enableMarkerLoad = false;
var CLIENT_ID = "5MLJLSYO3U3D1NXRVDTDLYYWXNHP0CEMUOEG1C2ECMD20VO2";
var CLIENT_SECRET = "40QSTRMCYD4IOTESKJVF532Z015MMI2M35GUXO2K5UQBQDYH";
var testLat = "-120.70558699999998";
var testLng = "-120.70558699999998";
// var photoStr;


// https://api.foursquare.com/v2/venues/explore?ll=35.5557948,-120.73473939999997&client_id=CLIENT_ID&client_secret=CLIENT_SECRET

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
        contentString += "'<img id='info-img" + i + "' title='' src='' />";
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

var get4sqphoto = function(index) {
    var lat = locations[index].lat;
    var lng = locations[index].lng;
    console.log("lat, lng: ", lat, lng);

    var jqxhr = $.get("https://api.foursquare.com/v2/venues/explore" +
        // "?near=Paso Robles,CA" +
        "?ll=" + lat +"," + lng +
        // "?ll=35.5557948,-120.73473939999997" +
        "&client_id=" + CLIENT_ID +
        "&client_secret=" + CLIENT_SECRET +
        "&limit=1" +
        "&v=20140115" +
        "&venuePhotos=1" +
        "&m=foursquare",
        function(data) {
            // console.log("testData: " + JSON.stringify(data));
            var items = data.response.groups[0].items;
            // var photoStr;
            // console.log("groups", JSON.stringify(groups[0]));
            console.log("length=" + items.length);
            for (var item =0; item < items.length; item++) {
                console.log("items." + item + ".name = " + JSON.stringify(items[item].venue.name));
                // console.log("items." + item + ".photos = " + JSON.stringify(items[item].venue.photos.groups[0].items[0].prefix));
                // console.log("items." + item + ".photos = " + JSON.stringify(items[item].venue));

                // Here we want to get the photo url and place the photo
                // in the info window.
                // First assemble the url string with the photo size limit set
                var photoStr = '' +
                    items[item].venue.photos.groups[0].items[0].prefix +
                    'cap300' +
                    items[item].venue.photos.groups[0].items[0].suffix;
                console.log("photoStr = " + photoStr);

                // Now load or reload the info window with the photo

                $('#info-img' + index).attr('src', photoStr);
                $('#info-img' + index).attr('title', JSON.stringify(items[item].venue.name));

                // document.getElementById('info-img').src = photoStr;
                // document.getElementById('info-img').src = 'https://irs2.4sqi.net/img/general/cap300/tJEoX0HCLwfR_Ddx5GSzF1a-Fxmq-db5TcrHx5EXev8.jpg';
                // console.log("items." + item + " = " + JSON.stringify(items[item].venue.featuredPhotos[0]));

            }
            // console.log("data.response:" + data.response.groups[0]);

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
    // Enables/disables visible
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
        // }
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
        get4sqphoto(index);
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
        get4sqphoto(i);
        // infowindowArray[i].close(markerArray[i].get('map'), markerArray[i]);
        // infowindow.open(marker.get('map'), marker);
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
    console.log("maps loaded");
    // consider an overlay page or dropping markers
    window.setTimeout(function() {
        enableMarkerLoad = true;
    }, 2000);
});



