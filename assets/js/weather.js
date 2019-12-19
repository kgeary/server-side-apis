const $fiveDay = $(".five-day");
const cities = JSON.parse(localStorage.getItem("cities")) || ["Austin", "Detroit", "Los Angeles"];

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
    load5DayForecast();
}

function load5DayForecast() {
    // Clear out old 5-day
    $fiveDay.html("");
    let startMoment = moment().clone();
    for(let i=0; i<5; i++) {
        let date = startMoment.add(1, "day");

        // API CALL HERE

        let card = create5DayCard(date, i*20, i+70);
        $fiveDay.append(card);
    }
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