// Temp to remove jshint issues
var ko, console, google;

// Loads data from data.js
var locations = initialData_js;
var map;
var show;
var photoArray;
var flickrIndex = 0;

var enableMarkerLoad = false;
var errorMsg = {};

// Foursquare Ajax request fails
errorMsg.fail = 'The data request to Foursquare failed. ';
errorMsg.fail += '<br>Please check your internet connection.';

// Google.maps request fails
errorMsg.maps = 'The data requrest to google.maps failed.';
errorMsg.maps += '<br>Please check your internet connection.';

var errorString = '';

var CLIENT_ID = '5MLJLSYO3U3D1NXRVDTDLYYWXNHP0CEMUOEG1C2ECMD20VO2';
var CLIENT_SECRET = '40QSTRMCYD4IOTESKJVF532Z015MMI2M35GUXO2K5UQBQDYH';


// placeTypes is an array of all the place types in the database
// The array is initialized with "All" which will show all types.
var placeTypes = ['All'];

var markers = [];
var infowindowArray = [];


// sort locations by name
var sortNames = function(locations) {
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
sortNames(locations);


// Sets 'show' array values for visibility control
// Locations are shown only when an included type is selected.
// Also generates the  "types" list for the placeTypes array and sorts it by name
var computeShowArray = function(locations, placeTypes) {
	var testType;
	for (var i = 0; i < locations.length; i++) {
		show = ['All'];
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

computeShowArray(locations, placeTypes);

// Content for info window
var computeContentString = function(locations) {
	for (var i = 0; i < locations.length; i++) {
		var contentString = '';

		// Text from my database
		contentString += '<p>';
		contentString += '<a href="' + locations[i].url + '"> ' + locations[i].name  + '</a>';
		contentString += '</p>';

		// Image and text placeholder for FourSquare data from ajax request
		contentString += '<img id="info-img' + i + '" alt="Venue photo" title="" src="" >';
		contentString += '<p id="info-text' + i + '"></p>';

		locations[i].infoWindowContent = contentString;
	}
};

computeContentString(locations);

var getLatLng = function(locations) {
	// first google map internet use, detect a failure
	try {
		for (var i = 0; i < locations.length; i++) {
			locations[i].latLng = new google.maps.LatLng(locations[i].lat, locations[i].lng);
		}
	}
	catch(err) {
		$('#error-msg').html(errorMsg.maps);
	}
};

getLatLng(locations);

var closeInfoWindows = function() {
	for (var i = 0; i < markers.length; i++) {
		infowindowArray[i].close(markers[i].get('map'), markers[i]);
	}
};

//Flickr API
var getFlickrSizes = function(id) {
	var jqxhr = $.get('https://api.flickr.com/services/rest/?method=flickr.photos.getSizes' +
		'&api_key=22fc9c37821f6a73591b5bc4ad048e35' +
		'&format=json' +
		'&photo_id=' + id,
		function(data) {
			console.log('data = ', data);
			console.log('data.rsp.stat = ', data.rsp.stat);
			console.log('success');
		}
	);

		jqxhr.done(function() {
		console.log( 'second success' );
	});
		jqxhr.fail(function() {
		console.log( 'error' );
	});
		jqxhr.always(function() {
		$('#error-msg').html(errorString);
		console.log( 'finished' );
	});

};

// Flickr API
var getFlickrPhoto = function() {
	flickrIndex = 0;
	// get lat and lng
	var lat = 35.5772607;
	var lon = -120.72292099999999;
	var deltaBox = 0.005; // +/- values are added to the lat/long for bounding box
	// Four comma-separated values representing the bottom left-corner and top-right corner
	// min lon, min lat, max lon, max lat.

	var bbox = [];
	bbox.push(lon - deltaBox);
	bbox.push(lat - deltaBox);
	bbox.push(lon + deltaBox);
	bbox.push(lat + deltaBox);
	console.log('bbox = ', bbox);

	var jqxhr = $.get('https://api.flickr.com/services/rest/?method=flickr.photos.search' +
		'&api_key=22fc9c37821f6a73591b5bc4ad048e35' +
		'&lat=35.655&lon=-120.901&accuracy=16' +
		'&min_upload_date=2012' +
		'&accuracy=16' +
		'&bbox=' + bbox[0] + ',' + bbox[1] + ',' + bbox[2] + ',' + bbox[3] +
		'&media=photos' +
		'&format=json&nojsoncallback=1',
		function(data) {
			console.log('data = ', data);
			console.log('json=' , JSON.stringify(data));
			console.log('data.photos', data.photos);
			photoArray = data.photos.photo;
			flickrIndex = 0;
			getFlickrNext(flickrIndex);
			// var imgId = data.photos.photo[flickrIndex].id;
			// var imgSecret = data.photos.photo[flickrIndex].secret;
			// var imgFarm = data.photos.photo[flickrIndex].farm;
			// var imgServer = data.photos.photo[flickrIndex].server;
			// var sizeSuffix = 'n';
			// console.log('farm, server, id, secret', imgFarm, imgServer, imgId, imgSecret);

			// var photoStr = 'https://farm' + imgFarm + '.staticflickr.com/' + imgServer +
			// 	'/' + imgId + '_' + imgSecret + '_' + sizeSuffix + '.jpg';

			// console.log("photoStr = " + photoStr);

			// // var textStr = '<a href="' + url + '?ref=' + CLIENT_ID + '">' + name + '</a>';
			// // var textStr2 = '<br>Photo provided by: <br><a href="https://foursquare.com">Foursquare</a>';

			// // // Now load or reload the info window with the photo
			// // $('#info-text' + index).html(textStr + textStr2);
			// $('#flickr-img').attr('src', photoStr);

			console.log('success');
			// getFlickrSizes('4924701870');
		}
	);

		jqxhr.done(function() {
		console.log( 'second success' );
	});
		jqxhr.fail(function() {
		console.log( 'error' );
		errorString = errorMsg.fail;
	});
		jqxhr.always(function() {
		$('#error-msg').html(errorString);
		console.log( 'finished' );
	});
};

var getFlickrNext = function(flickrIndex) {
			flickrIndex = flickrIndex % photoArray.length;
			var imgId = photoArray[flickrIndex].id;
			var imgSecret = photoArray[flickrIndex].secret;
			var imgFarm = photoArray[flickrIndex].farm;
			var imgServer = photoArray[flickrIndex].server;
			var sizeSuffix = 'n';
			console.log('farm, server, id, secret', imgFarm, imgServer, imgId, imgSecret);

			var photoStr = 'https://farm' + imgFarm + '.staticflickr.com/' + imgServer +
				'/' + imgId + '_' + imgSecret + '_' + sizeSuffix + '.jpg';

			console.log("photoStr = " + photoStr);

			$('#flickr-img').attr('src', photoStr);
};


// If the search found the venue, see if a "bestPhoto" is available
var get4sqVenueDetail = function(index, name, id) {
	var venueID = id;

	var jqxhr = $.get('https://api.foursquare.com/v2/venues/' + venueID +
		'?client_id=' + CLIENT_ID +
		'&client_secret=' + CLIENT_SECRET +
		'&v=20140115' +
		'&m=foursquare',
		function(data) {
			var url = data.response.venue.canonicalUrl;
			var photoStr = '' +
				data.response.venue.bestPhoto.prefix +
				'cap300' +
				data.response.venue.bestPhoto.suffix;
			// console.log("photoStr = " + photoStr);

			var textStr = '<a href="' + url + '?ref=' + CLIENT_ID + '">' + name + '</a>';
			var textStr2 = '<br>Photo provided by: <br><a href="https://foursquare.com">Foursquare</a>';

			// Now load or reload the info window with the photo
			$('#info-text' + index).html(textStr + textStr2);
			$('#info-img' + index).attr('src', photoStr);

			// The following puts the name in the tool-tip of image and marker
			$('#info-img' + index).attr('title', name);

			errorString = '';
			console.log('success');
		}
	);

		jqxhr.done(function() {
		console.log( 'second success' );
	});
		jqxhr.fail(function() {
		console.log( 'Venue detail error' );
		errorString = errorMsg.fail;
	});
		jqxhr.always(function() {
		$('#error-msg').html(errorString);
		console.log( 'finished' );
	});
};

// search for the selected venue in the 4sq database
var get4sqSearch = function(index) {
	var lat = locations[index].lat;
	var lng = locations[index].lng;
	var name = locations[index].name;
	console.log('name:', name);
	// console.log('lat, lng: ', lat, lng);

	var jqxhr = $.get('https://api.foursquare.com/v2/venues/search' +
		'?ll=' + lat +',' + lng +
		'&client_id=' + CLIENT_ID +
		'&client_secret=' + CLIENT_SECRET +
		'&limit=1' +
		'&v=20140115' +
		'&query=' + name +
		'&intent=match' +
		'&m=foursquare',
		function(data) {

			// if the id is undefined, then the venue is not listed.
			if (!data.response.venues[0]) {
				var textStr = '<br>This venue was not found at <a href="https://foursquare.com">Foursquare</a>';
				$('#info-text' + index).html(textStr);
				$('#info-img' + index).attr('alt', 'Venue photo not available');
			} else {
				var id = data.response.venues[0].id;
				var name = data.response.venues[0].name;

				// get venue details and a photo
				get4sqVenueDetail(index, name, id);
			}

			errorString = '';
			console.log('success');
		}
	);

		jqxhr.done(function() {
		console.log( 'second success' );
	});
		jqxhr.fail(function() {
		console.log( 'search error' );
		errorString = errorMsg.fail;

	});

		jqxhr.always(function() {
		$('#error-msg').html(errorString);
		console.log( 'finished' );
	});
};

 var attachInfotext = function(marker, i) {
	try {
		var infowindow = new google.maps.InfoWindow({
			content: locations[i].infoWindowContent,
			maxWidth: 300
		});

		// Store for list recall
		infowindowArray[i] = infowindow;

		google.maps.event.addListener(marker, 'click', function() {
			closeInfoWindows();
			$('#info-img').attr('src', '');
			infowindowArray[i].open(markers[i].get('map'), markers[i]);
			get4sqSearch(i);
		});
	}
	catch(err) {
		$('#error-msg').html(errorMsg.maps);
	}
};

var setMarkers = function(map, locations) {
	// add markers to map
	for (var i = 0; i < locations.length; i++) {
		try {
			var marker = new google.maps.Marker({
				position: locations[i].latLng,
				map: map,
				title: locations[i].name,
				visible: true
			});
			markers[i] = marker;

			attachInfotext(marker, i);
		}
		catch(err) {
			$('#error-msg').html(errorMsg.maps);
		}
	}
};

var toggleBounce = function(index) {
	var marker = markers[index];
	if (marker.getAnimation() !== null) {
		marker.setAnimation(null);
	} else {
		try {
			marker.setAnimation(google.maps.Animation.BOUNCE);
			// Bounce for a few seconds then stop
			window.setTimeout(function() {
				toggleBounce(index);
			}, 2100);
		}
		catch(err) {
			$('#error-msg').html(errorMsg.maps);
		}
	}
};

var flickrApi = function() {
	getFlickrPhoto();
};

var flickrNext = function() {
	flickrIndex += 1;
	getFlickrNext(flickrIndex);
};


function initialize() {
	var mapCanvas = document.getElementById('map-canvas');
	var mapOptions = {
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	try {
		var map = new google.maps.Map(mapCanvas, mapOptions);
		return map;
	}
	catch(err) {
		$('#error-msg').html(errorMsg.maps);
	}
}


/************ KO code ******************/

var MyViewModel = function(places) {
	'use strict';
	var self = this;
	self.placeTypes = ko.observableArray(placeTypes);

	// Holds the currently selected place type
	self.selectedPlaceType = ko.observableArray(['All']);

	// search text
	self.searchText = ko.observable('');

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
			// console.log('type is true');

			if(self.places()[index].name.toLowerCase().indexOf(self.searchText().toLowerCase()) !== -1) {
				// Also satisfies search text
				// console.log('text search is true too');
				return true;
			}
		}
		self.hideMarker(index);
		// Fails at least one of the two above conditions
		return false;
	};

	// search action
	self.searchForText = function() {
		console.log('self.searchText:', self.searchText());
		// search through all names for match
		// look for string and selected type match
		for (var i = 0; i < self.places().length; i++) {
			if (self.places()[i].show.indexOf(self.selectedPlaceType()[0]) !== -1) {
				if (self.places()[i].name.indexOf(self.searchText()) !== -1) {
					console.log('match: ', self.searchText());
				}
			}
		}
	};

	// show markers
	self.showMarker = function(index) {
		markers[index].setMap(map);
	};

	// hide markers
	self.hideMarker = function(index) {
		markers[index].setMap(null);
		for (var i = 0; i < markers.length; i++) {
			infowindowArray[i].close(markers[i].get('map'), markers[i]);
		}
	};

	// close info windows before opening another to follow best practice of
	// a single info window open at a time
	self.closeInfoWindows = function() {
		for (var i = 0; i < markers.length; i++) {
			infowindowArray[i].close(markers[i].get('map'), markers[i]);
			$('#info-img').attr('src', '');
		}
	};

	self.showInfoWindow = function(index) {
		// First clear any existing info windows
		self.closeInfoWindows();
		if(enableMarkerLoad) {
			infowindowArray[index].open(markers[index].get('map'), markers[index]);
			markers[index].setAnimation(null);
			toggleBounce(index);
			get4sqSearch(index);
		}
	};

};

/************ End of KO code *************************/


$(document).ready(function () {
	map = initialize();
	setMarkers(map, locations);

	// Set map size and position to include all markers
	try {
		var bounds = new google.maps.LatLngBounds();
		for (var i = 0; i < markers.length; i++) {
			bounds.extend(markers[i].getPosition());
		}
		map.fitBounds(bounds);
	}
	catch(err) {
		$('#error-msg').html(errorMsg.maps);
	}

	ko.applyBindings(new MyViewModel(locations));

	// This timeout keeps infowindows off the screen during initialization
	window.setTimeout(function() {
		enableMarkerLoad = true;
	}, 2000);
});


