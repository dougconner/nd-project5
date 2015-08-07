# nd-project5
Neighborhood project

I live near the Paso Robles, CA winery area. There are over 100 wineries in this area and for this project I chose to make and app listing some of the wineries, restaurants, and lodging choices. This app uses Ajax API calls to [Foursquare](https://foursquare.com/) to get photos for these places when they are available. 

###How it works
When the single-page app loads it also accesses data held in the data.js file. The app loads markers on a Google map for all of the places in data.js. It also loads the places by name in a list view, and displays a search box. 

####Searches
The search box has both a selector and a text input. The selector lets you narrow down the list by place type. Currently the selector choices are: All, Food, Lodging, and Winery. The select choices are automatically generated from whatever choices are entered in the data.js file plus the "All" category. The place list is always sorted alphabetically. 

The text searches are case insensitive and restricted by the place type specified by the selector. Selecting "All" will search across all places in the list. The list results are filtered instantly as each key is pressed. The search text must be cleared to view the unfiltered list. 

####Information window
The places list entries are underlined to indicate they may be clicked on. When you click on an entry, the corresponding marker will bounce for a short period and an information window will open, attached to the marker. If the place is found in the [Foursquare](https://foursquare.com/) database, a photo from [Foursquare](https://foursquare.com/) will appear plus a link to the place on [Foursquare](https://foursquare.com/). Above the photo, or if the photo is absent, the data.js file provides a link to the selected place. 

Following the best practices suggestion in Google maps, only a single information window is visible at a time. If you click to open another information window, the first window will close. 

If you hover over a marker, a tooltip will appear with the place name. If you click on the marker, an information window will appear, the same as clicking on the place name in the list. 

####Smart phone use
The tooltip and marker clicking do not seem to work on my Android phone, although all list-based operations and searchs work the same. For smart phone operations, I find the landscape view works best for selecting places from the list, and the portrait view is better for entering text into the search box, using the type selector, and still viewing the page. 

####Errors & internet loss
If an Ajax request to Foursquare fails, a text message in red appears in the upper right corner. A message will also appear if the internet is not available when Google maps loads. I am not able to detect every Google Ajax call that fails. For example, when the internet is off and you attempt to scroll the map. The map does indicate that data is not available. The app will continue to function normally without restart once internet is restored. Infowindow photos that have been loaded while internet was available will continue to reload if selected while internet service is not available. 
