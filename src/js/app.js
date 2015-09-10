// Temp to remove jshint issues
var ko, console, google;

// Loads data from data.js
var locations = initialData_js;

var map;
var show;

// A google Constant
var MAX_ZINDEX = google.maps.Marker.MAX_ZINDEX;

// Object array holding the flickr photo info
var flickrPhotoArray;
// Index of current photo in flickrPhotoArray
var flickrIndex = 0;

// Object array holding the foursquarePhotoArray
var foursquarePhotoArray;
// Index of current photo in the foursquarePhotoArray
var foursquareIndex = 0;

// Stores selected venue index
// Change only using setSelectedVenue(index)
var selectedVenueIndex;

// photoSrc is either 'flickr' or 'FourSquare'
var photoSrc = '';

// enableMarkerLoad is used to disable marker infowindows
// on initial load. It is also used to disable the
// Selected Venue at the same time (so that it remains "none").
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

// markerPng designates the matching marker for each location type
// markerSelectedPng is used when the venue is selected
var markerPng = {
	Winery: 'js/lib/purple_MarkerW.png',
	Restaurant: 'js/lib/orange_MarkerR.png',
	Lodging: 'js/lib/blue_MarkerL.png'
};
var markerSelectedPng = {
	Winery: 'js/lib/darkgreen_MarkerW.png',
	Restaurant: 'js/lib/darkgreen_MarkerR.png',
	Lodging: 'js/lib/darkgreen_MarkerL.png'
};

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

// var closeInfoWindows = function() {
// 	for (var i = 0; i < markers.length; i++) {
// 		infowindowArray[i].close(markers[i].get('map'), markers[i]);
// 	}
// };

var setBounds = function() {
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
};

//Flickr Sizes. Not currently used
// var getFlickrSizes = function(id) {
// 	var jqxhr = $.get('https://api.flickr.com/services/rest/?method=flickr.photos.getSizes' +
// 		'&api_key=22fc9c37821f6a73591b5bc4ad048e35' +
// 		'&format=json' +
// 		'&photo_id=' + id,
// 		function(data) {
// 			console.log('data = ', data);
// 			console.log('data.rsp.stat = ', data.rsp.stat);
// 			console.log('success');
// 		}
// 	);

// 		jqxhr.done(function() {
// 		console.log( 'second success' );
// 	});
// 		jqxhr.fail(function() {
// 		console.log( 'error' );
// 	});
// 		jqxhr.always(function() {
// 		$('#error-msg').html(errorString);
// 		console.log( 'finished' );
// 	});

// };

var getFlickrNext = function(flickrIndex) {
	// console.log("flickrPhotoArray", JSON.stringify(flickrPhotoArray));
	flickrIndex = flickrIndex % flickrPhotoArray.length;
	var imgId = flickrPhotoArray[flickrIndex].id;
	var imgSecret = flickrPhotoArray[flickrIndex].secret;
	var imgFarm = flickrPhotoArray[flickrIndex].farm;
	var imgServer = flickrPhotoArray[flickrIndex].server;
	var sizeSuffix = 'n';
	console.log('farm, server, id, secret', imgFarm, imgServer, imgId, imgSecret);

	var photoStr = 'https://farm' + imgFarm + '.staticflickr.com/' + imgServer +
		'/' + imgId + '_' + imgSecret + '_' + sizeSuffix + '.jpg';

	console.log("photoStr = " + photoStr);

	var textStr2 = 'Photo provided by: <a href="https://flickr.com">Flickr</a>';

	// Now load or reload the info window with the photo
	$('#info-text').html(textStr2);
	$('#info-img').attr('src', photoStr);
	$('#img-counter').html('Image '+ (flickrIndex + 1) + ' of ' + flickrPhotoArray.length);
};

// Flickr API
// index is for the venue locations array
// flickrIndex is for the photo in the flickrPhotoArray
var getFlickrPhoto = function(index) {
	flickrIndex = 0;
	// get lat and lng
	var lat = locations[index].lat;
	var lon = locations[index].lng;

	var deltaBox = 0.005; // +/- values are added to the lat/long for bounding box
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
			// console.log('data = ', data);
			// console.log('json=' , JSON.stringify(data));
			// console.log('data.photos', data.photos);
			flickrPhotoArray = data.photos.photo;
			flickrIndex = 0;
			if (flickrPhotoArray.length > 0) {
				console.log("number of photos for venue = ", flickrPhotoArray.length);
				getFlickrNext(flickrIndex);
			} else {
				$('#info-img').attr('src', '');
				$('#info-img').attr('alt', 'Venue photo not available');
				$('#img-counter').html('0 images');
				console.log("no photos for this venue");
			}

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

// this will load the current foursquare photo
var get4sqNext = function() {

	foursquareIndex = foursquareIndex % foursquarePhotoArray.length;
	var prefix = foursquarePhotoArray[foursquareIndex].prefix;
	var photoSize = 'cap300';
	var suffix = foursquarePhotoArray[foursquareIndex].suffix;

	console.log('prefix, photoSize, suffix', prefix, photoSize, suffix);

	var photoStr = prefix + photoSize + suffix;

	console.log("photoStr = " + photoStr);

	var textStr2 = 'Photo provided by: <a href="https://foursquare.com">Foursquare</a>';

	// Now load or reload the info window with the photo
	$('#info-text').html(textStr2);
	$('#info-img').attr('src', photoStr);
	$('#img-counter').html('Image '+ (foursquareIndex + 1) + ' of ' + foursquarePhotoArray.length);

		// 		var textStr2 = 'Photo provided by: <a href="https://foursquare.com">Foursquare</a>';

		// 		// Now load or reload the info window with the photo
		// 		$('#info-text').html(textStr2);
		// 		$('#info-img').attr('src', photoStr);
		// 	} else {
		// 		// No photos
		// 		$('#info-img').attr('src', '');
		// 		$('#info-img').attr('alt', 'Venue photo not available');
		// 	}
		// }

};

// If the search found the venue, this will load the foursquarePhotoArray
var get4sqVenueDetail = function(index, name, id) {
	var venueID = id;

	var jqxhr = $.get('https://api.foursquare.com/v2/venues/' + venueID +
		'?client_id=' + CLIENT_ID +
		'&client_secret=' + CLIENT_SECRET +
		'&v=20140115' +
		'&m=foursquare',
		function(data) {
			// console.log("data=", JSON.stringify(data));

			// See if there is data for this venue
			if (data.response.venue.photos.groups[0].items) {
				foursquarePhotoArray = data.response.venue.photos.groups[0].items;
				foursquareIndex = 0;
				get4sqNext();
			} else {
				// No photos
				$('#info-img').attr('src', '');
				$('#info-img').attr('alt', 'Venue photo not available');
			}

			// The following puts the name in the tool-tip of image and marker
			// Check iff still working
			$('#info-img' + index).attr('title', name);

			// console.log("data.response.venue.photos.groups[0].items[0].prefix  = ",data.response.venue.photos.groups[0].items[0].prefix);
			// console.log("data.response.venue.photos.groups[0].items[0].suffix  = ",data.response.venue.photos.groups[0].items[0].suffix);
			console.log("data.response.venue.photos.groups[0].items[0].user.firstName  = ",data.response.venue.photos.groups[0].items[0].user.firstName);
			console.log("data.response.venue.photos.groups[0].items[0].user.id  = ",data.response.venue.photos.groups[0].items[0].user.id);

			// foursquarePhotoArray = data.response.venue.photos.groups[0].items;
			// console.log('foursquarePhotoArray = ', foursquarePhotoArray);

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
				console.log("foursquare photo not available");
				$('#info-img').attr('src', '');
				$('#info-img').attr('alt', 'Venue photo not available');
				// $('#info-img' + index).attr('alt', 'Venue photo not available');
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
// Photo source is set to a default to start with
var photoSearch = function(index) {
	if (index >= 0) {
		// First clear out old venue info
		$('#info-img').attr('src', '');
		$('#info-img').attr('alt', 'Venue photo not available');
		$('#img-counter').html('0 images');
		$('#info-text').html('');

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
	}
};

// Set the selected venue in all columns or pages
// after it has been either selected (clicked) on
// the Places list or (clicked) on the map marker.
// If it is a new venue, clear any photos on display
// in the photo page.
// If it is not in the current place type then it must be
// removed: selectedVenueIndex() = -1 and remove
// markerSelectedPng
var setSelectedVenue = function(index) {
	var textStr = "Venue: ";
	var venueName;
	var venueUrl;
	var venueAddr1;
	var venueAddr2;
	var markerIcon;
	var markerType;
	var marker;
	var venueInfoText;

	// reset previous selectedVenue marker to ordinary markerPng
	if (selectedVenueIndex >= 0 && enableMarkerLoad) {
		marker = markers[selectedVenueIndex];
		markerType = locations[selectedVenueIndex].infoAry[0].type;
		markerIcon = markerPng[markerType];
		marker.setIcon(markerIcon);
		marker.setZIndex(MAX_ZINDEX);
	}

	if (index >= 0 && enableMarkerLoad) {
		// set new selectedVenue to markerSelectedPng
		venueName = locations[index].name;
		selectedVenueIndex = index;
		marker = markers[index];
		markerType = locations[index].infoAry[0].type;
		markerIcon = markerSelectedPng[markerType];
		marker.setIcon(markerIcon);
		var zInd = MAX_ZINDEX + 1;
		marker.setZIndex(zInd);
		console.log("markerNew = ", markerIcon);

		// info page
		venueUrl = locations[index].url;
		venueAddr1 = locations[index].addr1;
		venueAddr2 = locations[index].addr2;
		console.log("venueUrl", venueUrl);

		venueInfoText = locations[index].infoAry[0].infoText;
	} else {
		venueName = "none";
		venueUrl = "";
		venueAddr1 = "";
		venueAddr2 = "";
		venueInfoText = "";
	}

	// Show the selected venue on each page
	$('#selected-list-pg').html(textStr + venueName);
	$('#selected-map-pg').html(textStr + venueName);
	$('#selected-photo-pg').html(textStr + venueName);
	$('#selected-info-pg').html(textStr + venueName);

	// Show the selected venue info on the info page
	// Venue name will already be at top of page
	if (index >= 0 && enableMarkerLoad) {
		// $('#venue-url').html("<a href=" + venueUrl + ">" + venueUrl);
		// $('#venue-addr1').html(venueAddr1);
		// $('#venue-addr2').html(venueAddr2);
		var contentStr = "<a href=" + venueUrl + ">" + venueUrl + "</a>" + "<br>";
		contentStr += venueAddr1 + "<br>";
		contentStr += venueAddr2;
		$('#venue-info').html(contentStr);
		$('#venue-info-text').html(venueInfoText);
	} else {

	}
	// Clear old photo and selected map marker
	$('#info-img').attr('src', "");

	photoSearch(index);

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
			photoSearch(i);
			markers[i].setAnimation(null);
			setSelectedVenue(i);
			toggleBounce(i);
		});
	}
	catch(err) {
		$('#error-msg').html(errorMsg.maps);
	}
};

var setMarkers = function(map, locations) {
	// add markers to map

	for (var i = 0; i < locations.length; i++) {
		// infoAry[0] contains primary place type
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
			attachInfotext(marker, i);
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

	// Holds the currently selected place type
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

		// Fails at least one of the two above conditions
		self.hideMarker(index);
		// Set selectedVenueIndex = -1 and reset marker symbol
		setSelectedVenue(-1);
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
		// for (var i = 0; i < markers.length; i++) {
		// 	infowindowArray[i].close(markers[i].get('map'), markers[i]);
		// }
	};

	// close info windows before opening another to follow best practice of
	// a single info window open at a time
	// self.closeInfoWindows = function() {
	// 	for (var i = 0; i < markers.length; i++) {
	// 		infowindowArray[i].close(markers[i].get('map'), markers[i]);
	// 		$('#info-img').attr('src', '');
	// 	}
	// };

	self.showInfoWindow = function(index) {
		// First clear any existing info windows
		// self.closeInfoWindows();
		if(enableMarkerLoad) {
			setSelectedVenue(index);
			console.log("ran showInfoWindow");
			// infowindowArray[index].open(markers[index].get('map'), markers[index]);
			markers[index].setAnimation(null);
			toggleBounce(index);
			// photoSearch(index);
		}
	};

	self.setBounds = function() {
		// Set map size and position to include all markers
		setBounds();
	};

	self.setPhotoSource = function() {
		photoSrc = self.photoSource();
		console.log("photoSrc = ", photoSrc);
		photoSearch(selectedVenueIndex);
	};

	self.previousPhoto = function() {
		if (selectedVenueIndex >= 0) {
			// A venue is selected
			switch (photoSrc) {
				case 'foursquare':
					if (foursquarePhotoArray.length <= 0) {
						// No photos available
					} else {
						foursquareIndex = foursquareIndex > 0 ?  foursquareIndex - 1 : foursquarePhotoArray.length - 1;
						get4sqNext(foursquareIndex);
					}
					break;
				case 'flickr':
					if (flickrPhotoArray.length <= 0) {
						// No photos available
					} else {
						flickrIndex = flickrIndex > 0 ?  flickrIndex - 1 : flickrPhotoArray.length - 1;
						getFlickrNext(flickrIndex);
					}
						// Need to check if data is already loaded
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
					foursquareIndex += 1;
					get4sqNext(foursquareIndex);
					break;
				case 'flickr':
					flickrIndex += 1;
					getFlickrNext(flickrIndex);
					// Need to check if data is already loaded
					break;
				default:
					getFlickrPhoto(selectedVenueIndex);
			}
		} else {
			// No venue selected
			$('#info-img').attr('alt', 'No Venue selected');
		}
	};

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

	// This timeout keeps infowindows off the screen during initialization
	window.setTimeout(function() {
		enableMarkerLoad = true;

		// Start with no venue selected
		setSelectedVenue(-1);
	}, 2000);
});


