// Temp to remove jshint issues
var ko, console, google;

// Loads data from data.js
var locations = initialData_js;

var map; // Google map

// A google Constant
var MAX_ZINDEX = google.maps.Marker.MAX_ZINDEX;

// Object array holding photo info
var flickrPhotoArray;
var foursquarePhotoArray;

// Index of photo in array
var flickrIndex = 0;
var foursquareIndex = 0;

// Stores selected venue index
// Change only using setSelectedVenue(index)
var selectedVenueIndex = -1;

// photoSrc is either 'flickr' or 'FourSquare'
var photoSrc = '';

// enableMarkerLoad is used to disable markers
// on initial load. It is also used to disable the
// Selected Venue at the same time (so that it remains "none").
var enableMarkerLoad = false;

var errorMsg = {};

// Foursquare Ajax request fails
errorMsg.FourSqfail = 'The data request to Foursquare failed. ';
errorMsg.FourSqfail += '<br>Please check your internet connection.';

// Flickr Ajax request fails
errorMsg.Flickrfail = 'The data request to Flickr failed. ';
errorMsg.Flickrfail += '<br>Please check your internet connection.';

// Google.maps request fails
errorMsg.maps = 'The data requrest to google.maps failed.';
errorMsg.maps += '<br>Please check your internet connection.';

var errorString = '';

var CLIENT_ID = '5MLJLSYO3U3D1NXRVDTDLYYWXNHP0CEMUOEG1C2ECMD20VO2';
var CLIENT_SECRET = '40QSTRMCYD4IOTESKJVF532Z015MMI2M35GUXO2K5UQBQDYH';


// placeTypes is an array of all the place types in the database
// The array is initialized with "All" which will show all types.
var placeTypes = ['All'];

// markerPng designates the matching marker for each location type
// markerSelectedPng is used when the venue is selected
var markerPng = {
	Winery: 'markers/purple_MarkerW.png',
	Restaurant: 'markers/orange_MarkerR.png',
	Lodging: 'markers/blue_MarkerL.png'
};

var markerSelectedPng = {
	Winery: 'markers/darkgreen_MarkerW.png',
	Restaurant: 'markers/darkgreen_MarkerR.png',
	Lodging: 'markers/darkgreen_MarkerL.png'
};

var markers = [];

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
	var show;
	var iLength = locations.length;
	var jLength;
	for (var i = 0; i < iLength; i++) {
		show = ['All'];
		jLength = locations[i].infoAry.length;
		for (var j = 0; j < jLength; j++) {
			// infoAry[0] contains primary place type
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

var getLatLng = function(locations) {
	// first google map internet use, detect a failure
	try {
		var len = locations.length;
		for (var i = 0; i < len; i++) {
			locations[i].latLng = new google.maps.LatLng(locations[i].lat, locations[i].lng);
		}
	}
	catch(err) {
		$('#error-msg').html(errorMsg.maps);
	}
};

getLatLng(locations);

var setBounds = function() {
	// Set map size and position to include all markers
	try {
		var len = markers.length;
		var bounds = new google.maps.LatLngBounds();
		for (var i = 0; i < len; i++) {
			bounds.extend(markers[i].getPosition());
		}
		map.fitBounds(bounds);
	}
	catch(err) {
		$('#error-msg').html(errorMsg.maps);
	}
};

var getFlickrNext = function(flickrIndex) {
	// console.log("flickrPhotoArray", JSON.stringify(flickrPhotoArray));
	flickrIndex = flickrIndex % flickrPhotoArray.length;
	var imgId = flickrPhotoArray[flickrIndex].id;
	var imgSecret = flickrPhotoArray[flickrIndex].secret;
	var imgFarm = flickrPhotoArray[flickrIndex].farm;
	var imgServer = flickrPhotoArray[flickrIndex].server;
	var owner = flickrPhotoArray[flickrIndex].owner;
	var sizeSuffix = 'n';
	console.log('farm, server, id, secret', imgFarm, imgServer, imgId, imgSecret);

	var photoStr = 'https://farm' + imgFarm + '.staticflickr.com/' + imgServer +
		'/' + imgId + '_' + imgSecret + '_' + sizeSuffix + '.jpg';

	console.log("photoStr = " + photoStr);

	var textStr1 = 'Source: <a href="https://flickr.com">Flickr</a>';
		textStr1 += '  by: <a href="' + "https://flickr.com/people/" + owner +"/" + '">' + " photographer" + '</a>';

	// Now load or reload the info window with the photo
	$('#img-text1').html(textStr1);
	$('#info-img').attr('src', photoStr);
	$('#img-counter').html('Image '+ (flickrIndex + 1) + ' of ' + flickrPhotoArray.length);

};

// Flickr API
// index is for the venue locations array
// flickrIndex is for the photo in the flickrPhotoArray
var getFlickrPhoto = function(index) {
	flickrIndex = 0;
	var lat = locations[index].lat;
	var lon = locations[index].lng;

	var deltaBox = 0.003; // +/- values are added to the lat/long for bounding box
	// Four comma-separated values representing the bottom left-corner and top-right corner
	// min lon, min lat, max lon, max lat.
	var bbox = [];
	bbox.push(parseFloat(lon) - deltaBox);
	bbox.push(parseFloat(lat) - deltaBox);
	bbox.push(parseFloat(lon) + deltaBox);
	bbox.push(parseFloat(lat) + deltaBox);
	console.log('bbox = ', bbox);

	var jqxhr = $.get('https://api.flickr.com/services/rest/?method=flickr.photos.search' +
		'&api_key=22fc9c37821f6a73591b5bc4ad048e35' +
		'&lat=' + lat + '&lon=' + lon +
		'&min_upload_date=2012' +
		'&accuracy=16' +
		'&bbox=' + bbox[0] + ',' + bbox[1] + ',' + bbox[2] + ',' + bbox[3] +
		'&media=photos' +
		'&format=json&nojsoncallback=1',
		function(data) {
			// console.log('json=' , JSON.stringify(data));
			// console.log('data.photos', data.photos);
			flickrPhotoArray = data.photos.photo;
			flickrIndex = 0;
			if (flickrPhotoArray.length > 0) {
				console.log("number of photos for venue = ", flickrPhotoArray.length);
				getFlickrNext(flickrIndex);
			} else {
				$('#info-img').attr('src', '#');
				$('#info-img').attr('alt', 'No venue photos on Flickr');
				$('#img-counter').html('0 images');
				console.log("no photos for this venue");
			}

			console.log('success');
		}
	);

		jqxhr.done(function() {
			errorString = '';
			console.log( 'second success' );
	});
		jqxhr.fail(function() {
			console.log( 'error' );
			errorString = errorMsg.Flickrfail;
	});
		jqxhr.always(function() {
			$('#error-msg').html(errorString);
			console.log( 'finished' );
	});
};

// this will load the current foursquare photo
var get4sqNext = function(textStr2) {
	foursquareIndex = foursquareIndex % foursquarePhotoArray.length;
	var prefix = foursquarePhotoArray[foursquareIndex].prefix;
	var photoSize = 'cap300';
	var suffix = foursquarePhotoArray[foursquareIndex].suffix;
	console.log('prefix, photoSize, suffix', prefix, photoSize, suffix);

	var photoStr = prefix + photoSize + suffix;
	console.log("photoStr = " + photoStr);

	var textStr1 = 'Source: <a href="https://foursquare.com">Foursquare</a><br>';
		textStr1 += textStr2;

	// load or reload the photo and photo info
	$('#img-text1').html(textStr1);
	$('#info-img').attr('src', photoStr);
	$('#img-counter').html('Image '+ (foursquareIndex + 1) + ' of ' + foursquarePhotoArray.length);

};

// If the search found the venue, this will load the foursquarePhotoArray
var get4sqVenueDetail = function(index, name, id) {
	foursquarePhotoArray = {};
	var venueID = id;
	var textStr2 = '';

	var jqxhr = $.get('https://api.foursquare.com/v2/venues/' + venueID +
		'?client_id=' + CLIENT_ID +
		'&client_secret=' + CLIENT_SECRET +
		'&v=20140115' +
		'&m=foursquare',
		function(data) {
			// console.log("data=", JSON.stringify(data));
			console.log("data.response.venue.photos:", data.response.venue.photos);

			// See if there is data for this venue
			if (data.response.venue.photos.count > 0) {
				foursquarePhotoArray = data.response.venue.photos.groups[0].items;
				foursquareIndex = 0;
				var url = data.response.venue.canonicalUrl;
				textStr2 = 'Venue on <a href="' + url + '?ref=' + CLIENT_ID + '">' + 'Foursquare' + '</a>';
				get4sqNext(textStr2);

			} else {
				// No photos
				foursquarePhotoArray = {};
				$('#info-img').attr('src', '#');
				$('#info-img').attr('alt', 'No venue photos on FourSquare');
			}

			errorString = '';
			console.log('success');
		}
	);

		jqxhr.done(function() {
			errorString = '';
			console.log( 'second success' );
	});
		jqxhr.fail(function() {
			console.log( 'Venue detail error' );
			errorString = errorMsg.FourSqfail;
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
				var textStr1 = '<br>This venue was not found at <a href="https://foursquare.com">Foursquare</a>';
				$('#img-text1' + index).html(textStr1);
				$('#info-img').attr('src', '#');
				$('#info-img').attr('alt', 'No venue photos on FourSquare');
				console.log("The venue was not found on get4sqSearch");
			} else {
				var id = data.response.venues[0].id;
				var name = data.response.venues[0].name;

				// get venue details and a photo
				console.log("index, name, id",index, name, id);
				get4sqVenueDetail(index, name, id);
			}

			errorString = '';
			console.log('success');
		}
	);

		jqxhr.done(function() {
			errorString = '';
			console.log( 'second success' );
	});
		jqxhr.fail(function() {
			console.log( 'search error' );
			errorString = errorMsg.FourSqfail;
	});

		jqxhr.always(function() {
			$('#error-msg').html(errorString);
			console.log( 'finished' );
	});
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
	var zInd = MAX_ZINDEX + 1;
	marker.zIndex = zInd;

};

// Requires a selected venue and photo source
var photoSearch = function(index) {
	if (index >= 0) {
		// First clear out old venue info
		$('#info-img').attr('src', '#');
		$('#info-img').attr('alt', '');
		$('#img-counter').html('0 images');
		$('#img-text1').html('');

		// If venue selected, initiate search
		switch (photoSrc) {
			case 'foursquare':
				get4sqSearch(index);
				break;
			case 'flickr':
				getFlickrPhoto(index);
				break;
			default:
				getFlickrPhoto(index);
		}
	} else {
		// No venue selected
		$('#info-img').attr('alt', 'No Venue selected');
		$('#info-img').attr('src', '#');
		$('#img-counter').html('0 images');
		$('#img-text1').html('');
        $('#venue-info').html('');
        $('#venue-info-text').html('');
	}
};

// Sets the selected venue after it has been selected
// from the Venue list or the map.
// If it is a new venue, clear all photos.
// If the venue is not in the current venue type
// then the venue must be de-selected (selectedVenueIndex() = -1)
// Also change map marker back to un-selected

var setSelectedVenue = function(index) {
	var textStr = "Selected venue: ";
	var venueName;
	var venueUrl;
	var venueAddr1;
	var venueAddr2;
	var markerIcon;
	var markerType;
	var marker;
	var venueInfoText;
	var markerLegend;

	// clear out the old photo arrays:
	foursquarePhotoArray = {};
	flickrPhotoArray = {};

	// Remove old photo
	$('#info-img').attr('src', '#');

	// reset previous selectedVenue marker to ordinary markerPng
	if (selectedVenueIndex >= 0 && enableMarkerLoad) {
		marker = markers[selectedVenueIndex];
		markerType = locations[selectedVenueIndex].infoAry[0].type;
		markerIcon = markerPng[markerType];
		marker.setIcon(markerIcon);
		marker.setZIndex(MAX_ZINDEX);
	}

	// Set the new selected venue marker and info
	if (index >= 0 && enableMarkerLoad) {
		venueName = locations[index].name;
		selectedVenueIndex = index;
		marker = markers[index];
		markerType = locations[index].infoAry[0].type;
		markerIcon = markerSelectedPng[markerType];
		marker.setIcon(markerIcon);
		var zInd = MAX_ZINDEX + 1;
		marker.setZIndex(zInd);
		console.log("markerNew = ", markerIcon);

		// info page data
		venueUrl = locations[index].url;
		venueAddr1 = locations[index].addr1;
		venueAddr2 = locations[index].addr2;
		console.log("venueUrl", venueUrl);

		venueInfoText = locations[index].infoAry[0].infoText;
	} else {
		// Nothing selected so clear out the old selection
		venueName = "none";
		venueUrl = "";
		venueAddr1 = "";
		venueAddr2 = "";
		venueInfoText = "";
		markerIcon = "";
		markerLegend = '<img id="marker-ref" class="marker inline" src="' + markerPng.Winery + '" alt="marker icon">' + ' ' + 'Winery  ';
			markerLegend += '<img id="marker-ref" class="marker inline" + src="'  + markerPng.Lodging + '" alt="marker icon">' + ' ' + 'Lodging  ';
			markerLegend += '<img id="marker-ref" class="marker inline" + src="'  + markerPng.Restaurant + '" alt="marker icon">' + ' ' + 'Restaurant  ';
	}

	// Show the selected venue
	$('#selected-list-pg').html(textStr + venueName);
	$('#selected-photo-pg').html(textStr + venueName);
	$('#selected-info-pg').html(textStr + venueName);

	// Show marker for selected venue
	if (markerIcon !== "") {
		$('#selected-map-pg').html('<img id="marker-ref" class="marker inline" src="' + markerIcon + '" alt="marker icon">' + ' ' + venueName);
	} else {
		$('#selected-map-pg').html(markerLegend);
	}

	// Show the selected venue info on the info page
	// Venue name will already be at top of page
	if (index >= 0 && enableMarkerLoad) {
		var contentStr = "<a href=" + venueUrl + ">" + venueName + "</a>" + "<br>";
		contentStr += venueAddr1 + "<br>";
		contentStr += venueAddr2 + "<br>";
		console.log("contentStr = ", contentStr);
		$('#venue-info').html(contentStr);
		$('#venue-info-text').html(venueInfoText);
	}

	// Search for a photo on the new selected venue
	photoSearch(index);
};

// Map marker listner
var attachMarkerListener = function(marker, i) {
	google.maps.event.addListener(marker, 'click', function() {
		photoSearch(i);
		markers[i].setAnimation(null);
		setSelectedVenue(i);
		toggleBounce(i);
	});
};

// add markers to map
var setMarkers = function(map, locations) {
	var len = locations.length;
	for (var i = 0; i < len; i++) {
		var	markerType = locations[i].infoAry[0].type;
		var markerIcon = markerPng[markerType];
		try {
			var marker = new google.maps.Marker({
				position: locations[i].latLng,
				map: map,
				title: locations[i].name,
				visible: true,
				icon: markerIcon
			});
			markers[i] = marker;
			attachMarkerListener(marker, i);
		}
		catch(err) {
			$('#error-msg').html(errorMsg.maps);
		}
	}
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

	// Holds the currently selected place type (venue type)
	self.selectedPlaceType = ko.observableArray(['Winery']);

	// search text
	self.searchText = ko.observable('');

	// photo source select
	self.photoSource = ko.observable("flickr");

	self.places = ko.observableArray(ko.utils.arrayMap(places, function(place) {
		return { name: place.name,
			index: place.index,
			url: place.url,
			addr1: place.addr1,
			addr2: place.addr2,
			lat: place.lat,
			lng: place.lng,
			infoAry: ko.observableArray(place.infoAry),
			show: ko.observableArray(place.show)
		};
	}));

	// Find out if the current item includes the selected type & search filter
	// Enables/disables list visibility
	self.includesSelectedType = function (selected, index, show) {
		if (show.indexOf(selected()[0]) >= 0) {
			// Includes selected type
			self.showMarker(index);

			if(self.places()[index].name.toLowerCase().indexOf(self.searchText().toLowerCase()) !== -1) {
				// Also satisfies search text
				return true;
			}
		}

		// Fails at least one of the two above conditions
		self.hideMarker(index);
		// Reset selected venue to "none"
		setSelectedVenue(-1);
		return false;
	};

	// search action
	self.searchForText = function() {
		console.log('self.searchText:', self.searchText());
		// search through all names for match
		// look for string and selected type match
		var len = self.places().length;
		for (var i = 0; i < len; i++) {
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
	};

	// selects the clicked marker and shows info
	self.showInfo = function(index) {
		if(enableMarkerLoad) {
			setSelectedVenue(index);
			markers[index].setAnimation(null);
			toggleBounce(index);
		}
	};

	// Set map size and position to include all markers
	self.setBounds = function() {
		setBounds();
	};

	self.setPhotoSource = function() {
		photoSrc = self.photoSource();
		console.log("photoSrc = ", photoSrc);

		// zero un-selected photo array
		switch (photoSrc) {
			case 'foursquare':
				flickrPhotoArray = {};
				break;
			case 'flickr':
				foursquarePhotoArray = {};
				break;
		}
		photoSearch(selectedVenueIndex);
	};

	self.previousPhoto = function() {
		if (selectedVenueIndex >= 0) {
			// A venue is selected
			var len;
			switch (photoSrc) {
				case 'foursquare':
					len = foursquarePhotoArray.length;
					if (len > 0) {
						foursquareIndex = foursquareIndex > 0 ?  foursquareIndex - 1 : len - 1;
						get4sqNext(foursquareIndex);
					}
					break;
				case 'flickr':
					len = flickrPhotoArray.length;
					if (len > 0) {
						flickrIndex = flickrIndex > 0 ?  flickrIndex - 1 : len - 1;
						getFlickrNext(flickrIndex);
					}
					break;
				default:
					getFlickrPhoto(selectedVenueIndex);
			}
		} else {
			// No venue selected
			$('#info-img').attr('alt', 'No Venue selected');
		}
	};

	self.nextPhoto = function() {
		if (selectedVenueIndex >= 0) {
			// A venue is selected
			switch (photoSrc) {
				case 'foursquare':
					if (foursquarePhotoArray.length > 0) {
						foursquareIndex += 1;
						get4sqNext(foursquareIndex);
					}
					break;
				case 'flickr':
					if (flickrPhotoArray.length > 0) {
						flickrIndex += 1;
						getFlickrNext(flickrIndex);
					}
					break;
				default:
					getFlickrPhoto(selectedVenueIndex);
			}
		} else {
			// No venue selected
			$('#info-img').attr('alt', 'No Venue selected');
		}
	};

	// Clears the text search
	self.clearSearch = function() {
		$('#search-text').val('').trigger('change');
		setSelectedVenue(-1);
	};

};

/************ End of KO code *************************/

$(document).ready(function () {
	map = initialize();
	setMarkers(map, locations);

	// Set map size and position to include all markers
	setBounds();
	ko.applyBindings(new MyViewModel(locations));
	enableMarkerLoad = true;
});
