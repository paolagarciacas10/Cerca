// JavaScript Document

const params = new URLSearchParams(window.location.search);
const savedExploreSearch =
    JSON.parse(localStorage.getItem("exploreSearch"));

let locationValue = params.get("location");
let dateValue = params.get("date");
let timeValue = params.get("time");
let categoryValue = params.get("category");

if (locationValue) {


    const exploreSearch = {
        location: locationValue,
        date: dateValue,
        time: timeValue,
        category: categoryValue
    };

    localStorage.setItem(
        "exploreSearch",
        JSON.stringify(exploreSearch)
    );

} else if (savedExploreSearch) {

    locationValue = savedExploreSearch.location;
    dateValue = savedExploreSearch.date;
    timeValue = savedExploreSearch.time;
    categoryValue = savedExploreSearch.category;

}
const searchInfo = document.getElementById("search-info");
const resultsError = document.getElementById("results-error");
const locationInput = document.getElementById("location");
const citySuggestions = document.getElementById("city-suggestions");

if (searchInfo && locationValue) {

    const formattedDate = new Date(dateValue + "T00:00:00")
        .toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });

    const formattedTime = new Date(
        "1970-01-01T" + timeValue
    ).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    });

    const formattedCategory =
        categoryValue.charAt(0).toUpperCase() +
        categoryValue.slice(1);

    searchInfo.textContent =
        formattedCategory +
        " activities in " +
        locationValue +
        " on " +
        formattedDate +
        " at " +
        formattedTime;
}
const apiKey = "697c2ed5d4104cb89974c313c94ee5e0";

if (locationInput && citySuggestions) {
	
	let autocompleteTimer;

    locationInput.addEventListener("input", function() {

        const searchText = locationInput.value.trim();
		clearTimeout(autocompleteTimer);

        if (searchText.length < 3) {
            citySuggestions.innerHTML = "";
            return;
        }
autocompleteTimer = setTimeout(function() {
        const autocompleteURL =
            "https://api.geoapify.com/v1/geocode/autocomplete?text=" +
            encodeURIComponent(searchText) +
            "&type=city" +
            "&filter=countrycode:us" +
            "&format=json" +
            "&apiKey=" +
            apiKey;

        fetch(autocompleteURL)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {

                citySuggestions.innerHTML = "";

                data.results.forEach(function(city) {

                    const suggestion =
                        document.createElement("button");

                    suggestion.type = "button";
					suggestion.setAttribute("role", "option");

                    suggestion.className =
                        "city-suggestion";

                    suggestion.textContent =
                        city.formatted;

                    suggestion.addEventListener(
    "click",
    function() {

        locationInput.value =
            city.formatted;

        citySuggestions.innerHTML =
            "";

        const dashboardSearch =
            JSON.parse(
                localStorage.getItem("dashboardSearch")
            ) || {};

        dashboardSearch.location =
            city.formatted;

        localStorage.setItem(
            "dashboardSearch",
            JSON.stringify(dashboardSearch)
        );

    }
);

                    citySuggestions.appendChild(
                        suggestion
                    );

                });

            });

	}, 350);
    });

}
const dashboardForm = document.getElementById("searchForm");

if (dashboardForm) {

    const locationField = document.getElementById("location");
    const dateField = document.getElementById("date");
    const timeField = document.getElementById("time");
    const categoryField = document.getElementById("category");


    const savedSearch =
        JSON.parse(localStorage.getItem("dashboardSearch"));

    if (savedSearch) {

        locationField.value =
            savedSearch.location || "";

        dateField.value =
            savedSearch.date || "";

        timeField.value =
            savedSearch.time || "";

        categoryField.value =
            savedSearch.category || "";

    }


    dashboardForm.addEventListener("input", function() {

        const searchData = {
            location: locationField.value,
            date: dateField.value,
            time: timeField.value,
            category: categoryField.value
        };

        localStorage.setItem(
            "dashboardSearch",
            JSON.stringify(searchData)
        );

    });

}

function getCoordinates() {

    if (!locationValue) {
        return;
    }

    const geocodeURL =
        "https://api.geoapify.com/v1/geocode/search?text=" +
        encodeURIComponent(locationValue) +
        "&format=json&apiKey=" +
        apiKey;

    fetch(geocodeURL)

        .then(function(response) {
            return response.json();
        })

        .then(function(data) {

            if (data.results.length === 0) {

                resultsError.textContent =
                    "Location not found. Please try another city.";

                return;
            }

            const latitude = data.results[0].lat;
            const longitude = data.results[0].lon;
getPlaces(latitude, longitude);
            

        })

        .catch(function() {

    resultsError.textContent =
        "Something went wrong. Please try again.";

});

      


if (!navigator.onLine && resultsError) {
    resultsError.textContent =
        "You're offline. Connect to the internet to search for new activities.";
}
}



function getPlaces(latitude, longitude) {

    let category = "";

    if (categoryValue === "food") {
        category = "catering.restaurant";
    }

    if (categoryValue === "entertainment") {
        category = "entertainment";
    }

    if (categoryValue === "shopping") {
        category = "commercial";
    }

    if (categoryValue === "outdoors") {
        category = "leisure.park";
    }

    if (categoryValue === "attractions") {
        category = "tourism.attraction";
    }
if (categoryValue === "wellness") {
    category =
        "service.beauty,service.beauty.spa,service.beauty.massage,leisure.spa";
}
if (categoryValue === "coffee") {
    category =
        "catering.cafe,catering.cafe.coffee,catering.cafe.coffee_shop";
}

if (categoryValue === "sports") {
    category =
        "activity.sport_club,sport";
}

if (categoryValue === "nightlife") {
    category =
        "adult.nightclub,catering.bar,catering.pub";
}

if (categoryValue === "museums") {
    category =
        "entertainment.museum,tourism.sights";
}
	
	let radius = 5000;

if (categoryValue === "sports") {
    radius = 15000;
}
	
    const placesURL =
        "https://api.geoapify.com/v2/places?categories=" +
        category +
        "&filter=circle:" +
        longitude +
        "," +
        latitude +
        "," +
radius +
"&bias=proximity:" +
longitude +
"," +
latitude +
        "&limit=70" +
        "&apiKey=" +
        apiKey;


   fetch(placesURL)

    .then(function(response) {
        return response.json();
    })

    .then(function(data) {

        if (!data.features ||
            data.features.length === 0) {

            if (resultsError) {
                resultsError.textContent =
                    "Nothing was found. Please try another location or category.";
            }

            return;
        }

        displayPlaces(data.features);

    })

    .catch(function() {

        if (resultsError) {
            resultsError.textContent =
                "We couldn't load places. Please try again.";
        }

    });
}

function formatTime12Hour(time) {

    const parts = time.split(":");

    let hour = Number(parts[0]);
    const minutes = parts[1];

    const period = hour >= 12 ? "PM" : "AM";

    if (hour === 0) {
        hour = 12;
    } else if (hour > 12) {
        hour = hour - 12;
    }

    return hour + ":" + minutes + " " + period;
}

function displayPlaces(places) {

	const seenPlaces = {}; 
let displayedPlaces = 0;
	const results =
        document.getElementById("activity-results");

    results.innerHTML = "";

    if (places.length === 0) {

        resultsError.textContent =
            "We couldn't find activities for that location.";

        return;
    }
	
	function formatOpeningHours(hours) {

    let formattedHours = hours
        .replace(/Mo/g, "Mon")
        .replace(/Tu/g, "Tue")
        .replace(/We/g, "Wed")
        .replace(/Th/g, "Thu")
        .replace(/Fr/g, "Fri")
        .replace(/Sa/g, "Sat")
        .replace(/Su/g, "Sun");


    formattedHours =
        formattedHours.replace(
            /(\d{2}:\d{2})-(\d{2}:\d{2})/g,
            function(match, startTime, endTime) {

                return (
                    formatTime12Hour(startTime) +
                    " – " +
                    formatTime12Hour(endTime)
                );

            }
        );


    formattedHours =
        formattedHours.replace(/;/g, "<br>");


    return formattedHours;
}

    resultsError.textContent = "";

    places.forEach(function(place) {

        const name =
    place.properties.name;

        const address =
            place.properties.formatted ||
            "Address unavailable";
		
		
        if (!name) {
            return;
        }

        displayedPlaces++;

const placeKey =
    name + "|" + address;

if (seenPlaces[placeKey]) {
    return;
}

seenPlaces[placeKey] = true;
		
		const placeId =
    place.properties.place_id;
		
	const detailsURL =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(name + " " + address);	
		
		if (!name) {
    return;
			
}
		displayedPlaces++;
        const card =
            document.createElement("article");

        card.className = "activity-card";

  card.innerHTML =
    '<div class="card-content">' +

        '<div class="card-top">' +

            '<span class="activity-type">' +
                categoryValue +
            '</span>' +

            '<button class="save-button" type="button">' +
                '♡ Save' +
            '</button>' +

        '</div>' +

        '<h2>' +
            name +
        '</h2>' +

        '<p class="activity-address">' +
            address +
        '</p>' +
'<button class="more-info-button" type="button">' +
    'More info' +
'</button>' +

'<a class="details-link" href="' +
    detailsURL +
    '" target="_blank" rel="noopener noreferrer">' +
    'View in Google Maps' +
'</a>' +

    '</div>';

        results.appendChild(card);
		
		const moreInfoButton =
    card.querySelector(".more-info-button");


moreInfoButton.addEventListener("click", function() {

    const placeModal =
        document.getElementById("place-modal");

    const modalTitle =
        document.getElementById("modal-title");

    const modalDetails =
        document.getElementById("modal-details");


    if (!placeModal || !modalTitle || !modalDetails) {
        return;
    }


    modalTitle.textContent = name;

    modalDetails.innerHTML =
        '<p>Loading place information...</p>';

    placeModal.hidden = false;


    const detailsURL =
        "https://api.geoapify.com/v2/place-details?id=" +
        encodeURIComponent(placeId) +
        "&apiKey=" +
        apiKey;


    fetch(detailsURL)

        .then(function(response) {
            return response.json();
        })

        .then(function(data) {

            if (!data.features ||
                data.features.length === 0) {

                modalDetails.innerHTML =
                    '<p>No additional information is available.</p>';

                return;
            }


            const details =
                data.features[0].properties;


            let detailsHTML =
                '<p><strong>Address:</strong> ' +
                address +
                '</p>';


            if (details.contact &&
                details.contact.phone) {

                detailsHTML +=
                    '<p><strong>Phone:</strong> ' +
                    details.contact.phone +
                    '</p>';

            }


            if (details.website) {

                detailsHTML +=
                    '<p><strong>Website:</strong> ' +
                    '<a href="' +
                    details.website +
                    '" target="_blank" rel="noopener noreferrer">' +
                    'Visit website' +
                    '</a></p>';

            }


       if (details.opening_hours) {

    const prettyHours =
        formatOpeningHours(details.opening_hours);

    detailsHTML +=
        '<p><strong>Opening hours:</strong><br>' +
        prettyHours +
        '</p>';

}




            if (details.wheelchair === true) {

                detailsHTML +=
                    '<p><strong>Wheelchair accessible:</strong> Yes</p>';

            }


            if (details.internet_access === true) {

                detailsHTML +=
                    '<p><strong>Wi-Fi:</strong> Available</p>';

            }


            if (details.description) {

                detailsHTML +=
                    '<p><strong>About:</strong> ' +
                    details.description +
                    '</p>';

            }


            modalDetails.innerHTML =
                detailsHTML;

        })

        .catch(function() {

            modalDetails.innerHTML =
                '<p>We could not load more information for this place.</p>';

        });

});

		
		const saveButton = card.querySelector(".save-button");

saveButton.addEventListener("click", function() {

   const savedItem = {
    name: name,
    address: address,
    category: categoryValue,
    placeId: placeId,
    city: locationValue
};

    let savedPlaces =
        JSON.parse(localStorage.getItem("savedPlaces")) || [];

   const alreadySaved = savedPlaces.some(function(place) {

    return place.name === savedItem.name &&
           place.address === savedItem.address;

});

	if (displayedPlaces === 0) {
    resultsError.textContent =
        "No places were found for this search.";
}

if (!alreadySaved) {

    savedPlaces.push(savedItem);

    localStorage.setItem(
        "savedPlaces",
        JSON.stringify(savedPlaces)
    );

}
   

    saveButton.textContent = "✓ Saved";
	
	

});

    });
if (displayedPlaces === 0) {

    resultsError.textContent =
        "Nothing was found. Please try another location.";

}
}
function displaySavedPlaces() {

    const savedResults =
        document.getElementById("saved-results");

    if (!savedResults) {
        return;
    }

    const savedPlaces =
        JSON.parse(localStorage.getItem("savedPlaces")) || [];
	const cityFilter =
    document.getElementById("city-filter");


if (cityFilter) {

    const currentCity =
        cityFilter.value;

    cityFilter.innerHTML =
        '<option value="all">All cities</option>';


    const cities = [];

    savedPlaces.forEach(function(place) {

        if (place.city &&
            cities.indexOf(place.city) === -1) {

            cities.push(place.city);

        }

    });


    cities.sort();


    cities.forEach(function(city) {

        const option =
            document.createElement("option");

        option.value = city;
        option.textContent = city;

        cityFilter.appendChild(option);

    });


    if (cities.indexOf(currentCity) !== -1) {
        cityFilter.value = currentCity;
    }

}
	let placesToShow = savedPlaces;

if (cityFilter &&
    cityFilter.value !== "all") {

    placesToShow =
        savedPlaces.filter(function(place) {

            return place.city === cityFilter.value;

        });

}

    savedResults.innerHTML = "";

    if (savedPlaces.length === 0) {

        savedResults.innerHTML =
            '<p class="empty-message">' +
            'You have not saved any places yet.' +
            '</p>';

        return;
    }


  const categories = [
    { value: "food", label: "Food" },
    { value: "coffee", label: "Coffee & Cafes" },
    { value: "nightlife", label: "Nightlife" },
    { value: "entertainment", label: "Entertainment" },
    { value: "shopping", label: "Shopping" },
    { value: "outdoors", label: "Outdoors" },
    { value: "attractions", label: "Attractions" },
    { value: "museums", label: "Museums" },
    { value: "sports", label: "Sports & Recreation" },
    { value: "wellness", label: "Wellness & Spa" }
];


    categories.forEach(function(category) {

        const categoryPlaces =
            placesToShow.filter(function(place) {

                return place.category === category.value;

            });


        if (categoryPlaces.length === 0) {
            return;
        }


        const section =
            document.createElement("section");

        section.className = "saved-category";


        const heading =
            document.createElement("h2");

        heading.textContent = category.label;

        section.appendChild(heading);


        const grid =
            document.createElement("div");

        grid.className = "saved-category-grid";


        categoryPlaces.forEach(function(place) {

            const card =
                document.createElement("article");

            card.className = "activity-card";


            card.innerHTML =
                '<div class="card-content">' +

                    '<div class="card-top">' +

                        '<span class="activity-type">' +
                            place.category +
                        '</span>' +

                        '<div class="saved-actions">' +

                            '<button class="share-button" type="button">' +
                                'Share' +
                            '</button>' +

                            '<button class="remove-button" type="button">' +
                                'Remove' +
                            '</button>' +
				
				'<button class="more-info-button" type="button">' +
    'More info' +
'</button>' +

                        '</div>' +

                    '</div>' +

                    '<h3>' +
                        place.name +
                    '</h3>' +

                    '<p class="activity-address">' +
                        place.address +
                    '</p>' +

                '</div>';


            grid.appendChild(card);


            const removeButton =
                card.querySelector(".remove-button");

            const shareButton =
                card.querySelector(".share-button");
const moreInfoButton =
    card.querySelector(".more-info-button");

            removeButton.setAttribute(
                "aria-label",
                "Remove " + place.name + " from saved places"
            );

            shareButton.setAttribute(
                "aria-label",
                "Share " + place.name
            );

moreInfoButton.setAttribute(
    "aria-label",
    "More information about " + place.name
);
			moreInfoButton.addEventListener("click", function() {

    const placeModal =
        document.getElementById("place-modal");

    const modalTitle =
        document.getElementById("modal-title");

    const modalDetails =
        document.getElementById("modal-details");


    if (!placeModal || !modalTitle || !modalDetails) {
        return;
    }


    modalTitle.textContent =
        place.name;


    if (!place.placeId) {

        modalDetails.innerHTML =
            '<p><strong>Address:</strong> ' +
            place.address +
            '</p>' +

            '<p>No additional information is available for this older saved place.</p>';

        placeModal.hidden = false;

        return;
    }


    modalDetails.innerHTML =
        '<p>Loading place information...</p>';

    placeModal.hidden = false;


    const savedDetailsURL =
        "https://api.geoapify.com/v2/place-details?id=" +
        encodeURIComponent(place.placeId) +
        "&apiKey=" +
        apiKey;


    fetch(savedDetailsURL)

        .then(function(response) {
            return response.json();
        })

        .then(function(data) {

            if (!data.features ||
                data.features.length === 0) {

                modalDetails.innerHTML =
                    '<p>No additional information is available.</p>';

                return;
            }


            const details =
                data.features[0].properties;


            let detailsHTML =
                '<p><strong>Address:</strong> ' +
                place.address +
                '</p>';


            if (details.contact &&
                details.contact.phone) {

                detailsHTML +=
                    '<p><strong>Phone:</strong> ' +
                    details.contact.phone +
                    '</p>';

            }


            if (details.website) {

                detailsHTML +=
                    '<p><strong>Website:</strong> ' +
                    '<a href="' +
                    details.website +
                    '" target="_blank" rel="noopener noreferrer">' +
                    'Visit website' +
                    '</a></p>';

            }


            if (details.opening_hours) {

                const prettyHours =
                    formatOpeningHours(
                        details.opening_hours
                    );

                detailsHTML +=
                    '<p><strong>Opening hours:</strong><br>' +
                    prettyHours +
                    '</p>';

            }


            if (details.wheelchair === true) {

                detailsHTML +=
                    '<p><strong>Wheelchair accessible:</strong> Yes</p>';

            }


            if (details.internet_access === true) {

                detailsHTML +=
                    '<p><strong>Wi-Fi:</strong> Available</p>';

            }


            if (details.description) {

                detailsHTML +=
                    '<p><strong>About:</strong> ' +
                    details.description +
                    '</p>';

            }


            modalDetails.innerHTML =
                detailsHTML;

        })

        .catch(function() {

            modalDetails.innerHTML =
                '<p>We could not load more information for this place.</p>';

        });

});
            removeButton.addEventListener(
                "click",
                function() {

                    const updatedPlaces =
                        savedPlaces.filter(
                            function(savedPlace) {

                                return !(
                                    savedPlace.name === place.name &&
                                    savedPlace.address === place.address
                                );

                            }
                        );

                    localStorage.setItem(
                        "savedPlaces",
                        JSON.stringify(updatedPlaces)
                    );

                    displaySavedPlaces();

                }
            );


            shareButton.addEventListener(
                "click",
                function() {

                    const shareURL =
                        "https://www.google.com/maps/search/?api=1&query=" +
                        encodeURIComponent(
                            place.name + " " + place.address
                        );

                    if (navigator.share) {

                        navigator.share({
                            title: place.name,
                            text: place.address,
                            url: shareURL
                        });

                    } else if (navigator.clipboard) {

                        navigator.clipboard.writeText(
                            place.name +
                            " - " +
                            place.address +
                            " " +
                            shareURL
                        );

                        shareButton.textContent =
                            "Copied!";

                    }

                }
            );

        });


        section.appendChild(grid);

        savedResults.appendChild(section);

    });

}

if (document.body.classList.contains("explore")) {

    getCoordinates();

}
if (document.body.classList.contains("saved")) {

    displaySavedPlaces();

}

const closeModalButton =
    document.getElementById("close-modal");

const placeModalElement =
    document.getElementById("place-modal");


if (closeModalButton && placeModalElement) {

    closeModalButton.addEventListener("click", function() {

        placeModalElement.hidden = true;

    });

}

const savedCityFilter =
    document.getElementById("city-filter");

if (savedCityFilter) {

    savedCityFilter.addEventListener(
        "change",
        function() {

            displaySavedPlaces();

        }
    );

}