const $fiveDay = $(".five-day");
const cities = JSON.parse(localStorage.getItem("cities")) || ["Austin", "Detroit", "Los Angeles"];
const API_BASE_URL = "http://api.openweathermap.org/data/2.5/";
let currentCity = "";

function populateCities(city) {
    // Populate the cities list
    let $cityGroup = $('#city-group');

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

    cities.push(city);
    cities.sort();
    localStorage.setItem("cities", JSON.stringify(cities));
    populateCities(city);
    $("#searchInput").val("");
}

function loadCity(city) {
    // Set the Heading for current conditions
    $(".city").removeClass("active");
    $(".city[data-city=\"" + city + "\"]").addClass("active");

    $("#head-city-date").text(city + moment().format(" (M/D/YYYY)"));
    // Set the image for current conditions
    // Set the current Temperature
    // Set the current Humidity
    // Set the current Windspeed
    // Set the curren UV-Index
    load5DayForecast(city);
    currentCity = city;
    localStorage.setItem("currentCity", currentCity);
}

function load5DayForecast(city) {
    // Clear out old 5-day
    getData(city);
}

function getData(city) {
    
    let current_api_url = getApiUrl(city, false);
    let forecast_api_url = getApiUrl(city, true);
    let startMoment = moment().clone();

    $.ajax({
        url:  current_api_url,
        method: "GET",
    }).then(function(response) {
        console.log("Current Response Received");
        console.log(response);
        let condition = response.weather[0].main + " - " + response.weather[0].description;
        let tempF = response.main.temp;
        let humidity = response.main.humidity;
        let windSpeed = response.wind.speed;
        let windDir = response.wind.deg;
        let coord = response.coord;
        let sunrise = moment.unix(response.sys.sunrise).format("h:mma");
        let sunset = moment.unix(response.sys.sunset).format("h:mma");
        $("#head-city-date").text(response.name + moment.unix(response.dt).format(" (M/DD/YYYY)"));
        $("#temperature").html(tempF.toFixed(0) + "&deg;F");
        $("#humidity").text(humidity.toFixed(0)+ "%");
        $("#wind-speed").text((windSpeed).toFixed(1)+ "mph");
        // TODO - Update Image
        $("#uv-index").text(condition); // TODO - UV Index
        $("#sunrise").text(sunrise); // TODO - UV Index
        $("#sunset").text(sunset); // TODO - UV Index

    });

    // API CALL HERE
    $.ajax({
        url:  forecast_api_url,
        method: "GET",
    }).then(function(response) {
        console.log("Forecast Response Received");
        console.log(response);
        $fiveDay.empty();

        for(let i=0; i<5; i++) {
            let li = response.list[i*8];
            let timeStamp = moment.unix(li.dt);
            let humidity = li.main.humidity;;
            let tempF = li.main.temp;
            let icon = li.weather[0].icon;
            let description = li.weather[0].description;
            // Pull data from response here
            let date = startMoment.add(1, "day");
            // TODO UPDATE IMAGE
            let card = create5DayCard(date, tempF.toFixed(0), humidity.toFixed(0));
            $fiveDay.append(card);
        }
    });
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

function create5DayCard(momentDay, temperature, humidity) {
    let date = momentDay.format("M/D/YYYY");
    let temp = "Temp: " + temperature + "&deg;F";
    let humid = "Humidity: " + humidity + "%";
    
    let imgSrc = ""; // TODO
    let imgAlt = "IMG"; // TODO

    let card = $("<div>").addClass("col-md-auto col-sm-12 card card-small"); 
    card.append($("<h5>").addClass("card-title dayDate").text(date));
    card.append($("<img>").attr("src", imgSrc).attr("alt", imgAlt));
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
    $("#city-group").on("click", ".btn-delete", function(event) {
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
     $("#city-group").on("click", "li", function() {
        // LOAD CITY
        console.log("LOAD");
        console.log($(this).attr("data-city"));
        loadCity($(this).attr("data-city"));
    });

    
});