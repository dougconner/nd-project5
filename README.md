# nd-project5
Neighborhood project

I live near the Paso Robles, CA winery area. There are over 100 wineries in this area and for this project I chose to make and app listing some of the wineries, restaurants, and lodging choices. This app uses Ajax API calls to Foursquare to get photos for these places when they are available. 

How it works:
When the single-page app loads it also accesses data held in the data.js file. The app loads markers on a Google map for all of the places in data.js, it also loads the places by name in a list view, and displays a search box. 

The search box has both a selector and a text input. The selector lets you narrow down the list by place type. Currently it select choices are: All, Food, Lodging, and Winery. The select choices are automatically generated from whatever choices are entered in the data.js file. The list is always sorted alphabetically. 

The text searches are case insensitive and restricted by the place type specified by the selector. Selecting "All" will search across all places. The list results are filtered instantly as each key is pressed. The search text must be cleared to view the unfiltered list. 

The places list entries are underlined to indicate they may be clicked on. When you click on an entry, the corresponding marker will bounce for a short period and an information window will open, attached to the marker. If the place is found in the Foursquare database a photo from Foursquare will appear plus a link to the place on Foursquare. Above the photo or if the photo is absent, the data.js file provides a link to the selected place. 

Following the best practices suggestion in Google maps, only a single information window is visible at a time. If you click to open another information window, the first window will close. 

If you hover over a marker, a tooltip will appear with the place name. If you click on the marker, an information window will appear, the same as clicking on the place name in the list. These two marker functions do not seem to work on my Android phone, although all list-based operations and search work the same. 

For smart phone operations, the landscape view works best for selecting places from the list, and the portrait view is better for entering text into the search box, using the type selector, and still viewing the page. 
