// TODO: Need to automatically escape and single or double quotes in entered text.
// See info text for Thomas Hill Organics for an example.
// This will probably require a computed observable.

/*********** HOW to USE **************

1. Add places and enter any desired data.
2. As long as Address and city/state is filled in it will attempt to get lat/lng
3. Leave lat/lng empty (you can manually add values and it will not overwrite them).
4. Click the "Generate data array" and it will:
   A. Attempt to lookup lat/lng if blank
   B. Write all the data to local storage
5. Click on the "Reload data array" and it will:
   A. Relaod the table from the data in local memory which should include lat/lng
   B. Also write the data array in the text box.
   C. At this point the data only resides in the local memory, not in the data.js file
6. Now copy everything (cmd A then Cmd C on mac) in the Data Array text box
   and completely overwrite the data.js text. Save the file and everything will be
   available to the main program.
7. Save the file using CodeKit or note: The program looks for a minified file
   created by CodeKit. Although data.js does not need to be minified, it must be found.
   Make sure the paths to the new file are correct.
8. To force a reload from the data.js file, go into the console and set
	workingData = []
	That should force a reload. This will of course delete the workingData file in
	local memory.
***************************************/

// Temp to remove jshint issues
var ko, console, google, geocoder;

var initialData;
var initialData_js;
var storedData = JSON.parse(localStorage.getItem('workingData'));

console.log("storedData = ", storedData);
console.log("typeof storedData = ", (typeof storedData));

if (storedData.length > 1) {
	console.log("storedData = ", storedData);
	// load storedData as initialData
	initialData = storedData;
} else {
	console.log("No local data found");
	// Use initialData_js in data.js
	initialData = initialData_js;
}

// Used for local storage, to get lat & lng, and textarea
var workingData = [];

function getGeocode(address, k) {
	// k is index for workingData
	geocoder = new google.maps.Geocoder();
	geocoder.geocode({ 'address': address }, function(results, status) {
	  if (status === google.maps.GeocoderStatus.OK) {
		console.log("status OK", results[0].geometry.location);

		workingData[k].lat = results[0].geometry.location.G;
		workingData[k].lng = results[0].geometry.location.K;
		console.log("lat.G", workingData[k].lat);
		console.log("lng.K", workingData[k].lng);

	  } else {
		console.log("status not okay on item:", status);
	  }
	});
}


// Reference for this KO table: http://jsfiddle.net/rniemeyer/gZC5k/
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
			this.infoAry.remove(info);
		});
	};

	// Does lookup for lat-lng values
	// Generates text for textarea display
	// Stores data locally
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
		// store workingData locallly as the new initialData
		localStorage.setItem('workingData', JSON.stringify(workingData));

		// Update lat and lng values for cases where none exists and lookup sucessful
		var locationData;
		for (var k = 0; k < workingData.length; k++) {
					locationData = workingData[k].addr1 + ' ' + workingData[k].addr2;

			// Don't overwrite existing values, only ones where lat is 0
			if (workingData[k].lat === "") {
				getGeocode(locationData, k);
			}
		}

		// The following string result is displayed in the textarea and may
		// be copied & pasted into the data.js file, overwriting the previous
		// version for the initialData_js data.

		self.displayText();

	};


	self.displayText = function(){
		var string = "var initialData_js = \n[\n";
		// var string = "";
		for (var i = 0; i < workingData.length; i++) {
			string += "  {\n";
			for (var item in workingData[i]) {

				if (item === 'infoAry') {
					string += "  " + item + ": ";
					string += "[\n";
					for (var j = 0; j < workingData[i][item].length; j++) {
							string += "    {type: "  + '"' + workingData[i][item][j].type + '", ';
							string += "infoText: "  + '"' + workingData[i][item][j].infoText + '"}';
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

		// workingData is stored locallly as the new initialData
		localStorage.setItem('workingData', JSON.stringify(workingData));

		return string;
		// console.log("generateLocationsObj output: ");
		// console.log(string);
	};

	self.loadFromDataJs = function() {
			storedData = null;
	};

};


ko.applyBindings(new MyViewModel(initialData));
