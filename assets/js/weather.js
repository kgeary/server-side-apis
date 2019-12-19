const $fiveDay = $(".five-day");
const cities = JSON.parse(localStorage.getItem("cities")) || ["Austin", "Detroit", "Los Angeles"];
const API_BASE_URL = "http://api.openweathermap.org/data/2.5/";
const METERS_PER_SEC_TO_MPH = 2.23693629;
function populateCities() {
    // Populate the cities list
    let $cityGroup = $('#city-group');

    $cityGroup.html("");
    cities.forEach(function(city) {
        let li = $('<li>').text(city).addClass("list-group-item city").attr("data-city", city);        
        let btnDelete = $("<button>").addClass("btn btn-delete");
        let deleteIcon = $("<i>").addClass("fas fa-minus-circle");
        btnDelete.append(deleteIcon);
        li.append(btnDelete);
        $cityGroup.append(li);
    });
}

function addCity() {
    let city = $("#searchInput").val().trim();

    if (cities.includes(city)) {
        alert("You are already following " + city);
    }

    cities.push(city);
    cities.sort();
    localStorage.setItem("cities", JSON.stringify(cities));
    populateCities();
    loadCity(city);
    $("#searchInput").val("");
}

function loadCity(city) {
    // Set the Heading for current conditions
    $("#head-city-date").text(city + moment().format(" (M/D/YYYY)"));
    // Set the image for current conditions
    // Set the current Temperature
    // Set the current Humidity
    // Set the current Windspeed
    // Set the curren UV-Index
    load5DayForecast(city);
}

function load5DayForecast(city) {
    // Clear out old 5-day
    $fiveDay.html("");
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
    
    populateCities();
    loadCity(cities[0]);

    $("#btnSearchSubmit").on("click", addCity);
    $('#searchInput').on("keypress", function(event) {
        if (event.which === 13) {
            addCity();
        }
    });

    // Setup click listener to delete cities or load cities
    $("#city-group").on("click", function(event) {
        if (event.target.matches("i") || 
            event.target.matches("button")) {
            // DELETE CITY
            let city = event.target.parentElement.getAttribute("data-city") || 
                event.target.parentElement.parentElement.getAttribute("data-city");
            cities.splice(cities.indexOf(city),1);
            localStorage.setItem("cities", JSON.stringify(cities));
            populateCities();
        
        } else if (event.target.matches("button")) {
            
            // DELETE CITY
            console.log(event.target);
            let city = event.target.parentElement.getAttribute("data-city");
            cities.splice(cities.indexOf(city),1);
            localStorage.setItem("cities", JSON.stringify(cities));
            populateCities();
        }
        else if (event.target.matches("li")) {
            // LOAD CITY
            console.log(event.target);
            loadCity(event.target.getAttribute("data-city"));
        } else {
            console.log(event.target);
        }
    });

    
});