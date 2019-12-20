const $fiveDay = $(".five-day");
const cities = JSON.parse(localStorage.getItem("cities")) || ["Austin", "Detroit", "Los Angeles"];
const API_BASE_URL = "http://api.openweathermap.org/data/2.5/";
let currentCity = "";

function populateCities(city) {
    // Populate the cities list
    let $cityGroup = $('#city-list');

    $cityGroup.empty();
    cities.forEach(function(city) {
        let li = $('<li>').text(city).addClass("list-group-item city").attr("data-city", city);        
        let btnDelete = $("<button>").addClass("btn btn-delete");
        let deleteIcon = $("<i>").addClass("fas fa-minus-circle");
        btnDelete.append(deleteIcon);
        li.append(btnDelete);
        $cityGroup.append(li);
    });

    if (city !== currentCity) {
        loadCity(city);
    }
}

function addCity() {
    let city = $("#searchInput").val().trim();

    if (cities.includes(city)) {
        alert("You are already following " + city);
    }
    testCity(city); // Check to make sure it's a valid city
}

// City has been confirmed as legitimate. Add the city to the list
function AddCityFinal(city) {
    cities.push(city);
    cities.sort();
    localStorage.setItem("cities", JSON.stringify(cities));
    populateCities(city);
    $("#searchInput").val("");
}

function testCity(city) {
    $.ajax({
        url: getApiUrl(city),
        method: "GET",
        error: function(response) {
            console.log(response);
            alert("ERROR: " + response.responseJSON.message);
        },
        success: function(response) {
            AddCityFinal(city);
        }
    });
}

function loadCity(city) {
    // Set the Heading for current conditions
    $(".city").removeClass("active");
    $(".city[data-city=\"" + city + "\"]").addClass("active");

    if (city) {
        $("#head-city-date").text(city + moment().format(" (M/D/YYYY)"));
        getData(city);
        currentCity = city;
        localStorage.setItem("currentCity", currentCity);
    }
}

// Use ajax to retrieve the current and 5-day forecasts for the city specified
function getData(city) {
    
    let current_api_url = getApiUrl(city, false);
    let forecast_api_url = getApiUrl(city, true);

    // API CALL HERE - Current Day Weather API
    $.ajax({
        url:  current_api_url,
        method: "GET",
        error: function(response) {
            console.log("ERROR");
            alert(console.log(response.responseText.message));
        }
    }).then(function(response) {
        // Get the Current Day Data
        fillCurrentDay(response);
        return response;
    }).then(function(response) {
        // Get the UV Index 
        return getUvAjax(response.coord.lat, response.coord.lon);
    }).then(function(response) {
        return $.ajax({
            url:  forecast_api_url,
            method: "GET",
        }).then(function(response) {
            fillFiveDay(response);
            
        });
    });

    // API CALL HERE - 5-Day Forecast API
    
}

// Fill the Current Day Info from Server Response
function fillCurrentDay(response) {
    console.log("Current Day Response Received");
    console.log(response);

    let condition = response.weather[0].main + " - " + response.weather[0].description;
    let iconUrl = getIconUrl(response.weather[0].icon);
    let tempF = response.main.temp;
    let humidity = response.main.humidity;
    let windSpeed = response.wind.speed;
    let windDir = response.wind.deg;
    let coord = response.coord;
    let sunrise = moment.unix(response.sys.sunrise).format("h:mma");
    let sunset = moment.unix(response.sys.sunset).format("h:mma");
    $(".right-pane").hide().fadeIn(1000);
    $("#conditions-image").attr("src", iconUrl).attr("alt", condition);
    $("#head-city-date").text(response.name + moment.unix(response.dt).format(" (M/DD/YYYY)"));
    $("#time-hour").text(moment.unix(response.dt).format("ha"));
    $("#temperature").html(tempF.toFixed(0) + "&deg;F");
    $("#humidity").text(humidity.toFixed(0)+ "%");
    $("#wind-speed").text((windSpeed).toFixed(1)+ "mph");
    $("#uv-index").text(condition);
    $("#sunrise").text(sunrise);
    $("#sunset").text(sunset);
    // Call the UV API
    
}

function getUvAjax(lat, lon) {
    let uv_api_url = getUvIndexUrl(lat, lon);
    return $.ajax({
        url: uv_api_url,
        method: "GET",
    }).then(function(response) {
        $("#uv-index").text(response.value);
        console.log("UV RESPONSE Received");
        console.log(response);
    });
}

// Fill the 5-Day Forecast Info from Server Response
function fillFiveDay(response) {
    let startMoment = moment().clone();
    
    console.log("5-Day Forecast Response Received");
    console.log(response);
    
    $fiveDay.empty();

    for(let i=0; i<5; i++) {
        let li = response.list[i*8+7];
        let timeStamp = moment.unix(li.dt);
        let humidity = li.main.humidity;;
        let tempF = li.main.temp;
        let iconUrl = getIconUrl(li.weather[0].icon);
        let description = li.weather[0].description;
        // Pull data from response here
        let date = startMoment.add(1, "day");
        // TODO UPDATE IMAGE
        let card = create5DayCard(timeStamp, iconUrl, description, tempF.toFixed(0), humidity.toFixed(0));
        $fiveDay.append(card);
    }
}

// Get the Final API Url for the UV Index
function getUvIndexUrl(lat, lon) {
    return "http://api.openweathermap.org/data/2.5/uvi?appid=" + API_KEY + "&lat=" + lat.toFixed(2) + "&lon=" + lon.toFixed(2);
}

// Get the Final API Url
// city to query
// isForecast = True for 5-day forecast, false for current weather
function getApiUrl(city, isForecast) {
    let queryString = isForecast ? "forecast" : "weather";
    queryString += "?";
    queryString += "q=" + city.trim().replace(" ", "+") + ",us&mode=json";
    queryString += "&units=imperial" + "&APPID=" + API_KEY;
    return API_BASE_URL + queryString;
}

// Return the icon url from the icon code provided by openwweathermap.org
function getIconUrl(iconcode) {
    return "https://openweathermap.org/img/wn/" + iconcode + "@2x.png";
    //return "http://openweathermap.org/img/w/" + iconcode + ".png";
}

function create5DayCard(momentDay, iconUrl, description, temperature, humidity) {
    let date = momentDay.format("M/D/YYYY");
    let hour = momentDay.format("ha");
    let temp = "Temp: " + temperature + "&deg;F";
    let humid = "Humidity: " + humidity + "%";
    let imgAlt = description;

    let card = $("<div>").addClass("col-md-auto col-sm-12 card card-small"); 
    card.append($("<h5>").addClass("card-title dayDate").text(date));
    card.append($("<p>").addClass("card-text dayHour").text(hour));
    card.append($("<img>").attr("src", iconUrl).attr("alt", imgAlt).attr("style", "width: 3.5rem;"));
    card.append($("<p>").addClass("card-text dayTemp").html(temp));
    card.append($("<p>").addClass("card-text dayHumidity").text(humid));    
    return card;
}

$(function() {
    let initialCity = localStorage.getItem("currentCity") || cities[0];
    populateCities(initialCity);

    // Handle City Search
    $("#btnSearchSubmit").on("click", addCity);
    $('#searchInput').on("keypress", function(event) {
        if (event.which === 13) {
            addCity();
        }
    });

    // Delete Button Click - DELETE CITY
    $("#city-list").on("click", ".btn-delete", function(event) {
        event.stopPropagation();
        // TODO - Why do I need to match i as well?
        let city = $(this).parent().attr("data-city");
        console.log("TO DELETE = ", city);
        // Delete the city from the array and update local storage
        cities.splice(cities.indexOf(city),1);
        localStorage.setItem("cities", JSON.stringify(cities));
        // Repopulate cities list
        let newCity = (currentCity === city) ? cities[0] : currentCity;
        populateCities(newCity);
     });

     // City Click - LOAD CITY
     $("#city-list").on("click", "li", function() {
        // LOAD CITY
        console.log("LOAD");
        console.log($(this).attr("data-city"));
        loadCity($(this).attr("data-city"));
    });

    
});