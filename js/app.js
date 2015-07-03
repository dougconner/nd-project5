// function initialize() {
//     var mapCanvas = document.getElementById('map-canvas');
//     var mapOptions = {
//         center: new google.maps.LatLng(44.5403, -78.5463),
//         zoom: 8,
//         mapTypeId: google.maps.MapTypeId.ROADMAP
//     };
//     var map = new google.maps.Map(mapCanvas, mapOptions);
// }
// google.maps.event.addDomListener(window, 'load', initialize);
var wineries = ko.observableArray([
    {"name": "Epoch Estate Wines",
    "lat": 35.5437,
    "lng": -120.8274
    },
    {"name": "Sculpterra Winery",
    "lng": 35.6064,
    "lng": -120.6073 },
    {"name": "Paso Robles",
    "lng": 35.64222479297878,
    "lat": -120.68633100585936}
    ]);


$(document).ready(function () {
   ko.applyBindings(viewModel);
});

function MyViewModel() {
    var self = this;
    self.mapOne = ko.observable({
        // lat: ko.observable(35.6012),
        // lng:ko.observable(-120.6108)
        lat: ko.observable(35.64222479297878),
        lng:ko.observable(-120.68633100585936)
        // lat: ko.observable(35.5437),
        // lng:ko.observable(-120.8274)
    });


}

// derived from http://jsfiddle.net/schmidlop/5eTRV/10/
ko.bindingHandlers.map = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var mapObj = ko.utils.unwrapObservable(valueAccessor());
        var latLng = new google.maps.LatLng(
            ko.utils.unwrapObservable(mapObj.lat),
            ko.utils.unwrapObservable(mapObj.lng));
        var mapOptions = { center: latLng,
                          zoom: 11,
                          // styles: styleArray,
                          mapTypeId: google.maps.MapTypeId.ROADMAP};

        // mapObj.googleMap = new google.maps.Map(element, mapOptions);
        mapObj.googleMap = new google.maps.Map(element, mapOptions);

        console.log("wineries[i].lat: ", wineries()[0].lat);
        // setMarkers(map, wineries);
        for (var i = 0; i < wineries().length; i++) {
            var markerLatLng = new google.maps.LatLng(
                wineries()[i].lat,
                wineries()[i].lng);
            var mapObj.marker = new google.maps.Marker({
                map: mapObj.googleMap,
                position: markerLatLng,
                title: "here",
                // title: wineries()[i].name,
                draggable: true
            });
        }
        // mapObj.marker = new google.maps.Marker({
        //     map: mapObj.googleMap,
        //     position: latLng,
        //     title: "You Are Here",
        //     draggable: true
        // });

        mapObj.onChangedCoord = function(newValue) {
            var latLng = new google.maps.LatLng(
                ko.utils.unwrapObservable(mapObj.lat),
                ko.utils.unwrapObservable(mapObj.lng));
            mapObj.googleMap.setCenter(latLng);
        };

        mapObj.onMarkerMoved = function(dragEnd) {
            var latLng = mapObj.marker.getPosition();
            mapObj.lat(latLng.lat());
            mapObj.lng(latLng.lng());
        };

        mapObj.lat.subscribe(mapObj.onChangedCoord);
        mapObj.lng.subscribe(mapObj.onChangedCoord);

        google.maps.event.addListener(mapObj.marker, 'dragend', mapObj.onMarkerMoved);

        $("#" + element.getAttribute("id")).data("mapObj",mapObj);
    }
};

var styleArray = [
  {
    featureType: "all",
    stylers: [
      { saturation: -80 }
    ]
  },{
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [
      { hue: "#00ffee" },
      { saturation: 50 }
    ]
  },{
    featureType: "poi.attraction",
    elementType: "labels",
    stylers: [
      { visibility: "off" }
    ]
  },{
    featureType: "poi.business",
    elementType: "labels",
    stylers: [
      { visibility: "off" }
    ]
  }
];


var viewModel = new MyViewModel();