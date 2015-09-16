# nd-project5
##Neighborhood project

I live near the Paso Robles, CA winery area. There are over 100 wineries in this area and for this project I chose to make an app listing some of the wineries, restaurants, and lodging choices. This app uses Ajax API calls to [Foursquare](https://foursquare.com/) and [Flickr] (https://flickr.com) to provide photos for these places when they are available. 

###How to run the app
Click on the index.html file and the app will load. To see information on a venue you must first select one from either the Venue List or the Map View. 

####Venue selection
You may select from several venue types to limit the list-view or map-view choices. You may also use a text-based search for the venue name. Text searches are always restricted by the venue-type selected. A venue type of "All" will let you search across all venues. The map view provides markers designating the venue types with the first letter ("W" for winery, etc). 

####Venue information
When a venue is selected, the marker will change to green for the seleced venue. After a venue is selected, the app will attempt to load a set of photos for the venue using Flickr or Foursquare (radio button choice selection). A URL link to the venue is provided plus address and optionally some notes. The Flickr photos use location to match reasonably closely to the latitude and longitude of the selected venue. Occassionally the photos will be of other nearby locations, especially in dense urban locations. Foursquare uses a combination of location and venue name to get photos taken the venue. 
