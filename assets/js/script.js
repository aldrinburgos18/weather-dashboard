var apiKey = "a1d8b8f684383df9eff3ae909b0d743e";

var userFormEl = document.querySelector("#user-form");
var cityInputEl = document.querySelector("#city");
var showContainer = document.querySelector("#main");

var formSubmitHandler = function(event) {
    event.preventDefault();   
    var cityName = cityInputEl.value.trim();

    if(cityName) {
        getCurrentWeather(cityName);
        cityInputEl.value = "";
    } else {
        alert("Please enter a valid city name!");
    }

    //reset UV color each time the user searches for a new city
    var uvClasses = document.querySelector('.uv-index');
    uvClasses.classList.remove('bg-success','bg-warning', 'bg-orange','bg-danger', 'bg-purple');
    showContainer.classList.remove("hide");

    searchHistory(cityName);
    retrieveHistory();
};

var searchHistory = function(cityName){
    // Get array from local storage
    var retrievedData = JSON.parse(localStorage.getItem("searches"));
    // Append cityname to the array
    retrievedData.push(cityName);
    // Save the array to local storage
    localStorage.setItem("searches", JSON.stringify(retrievedData));
}

var retrieveHistory = function(){
    // Get array from local storage
    var retrievedData = JSON.parse(localStorage.getItem("searches"));
    // if not found, would return undefeined
    if(retrievedData==undefined){
        localStorage.setItem("searches", JSON.stringify([]));
    } else{
    var searchHistoryContainer = document.getElementById("search-history");
    searchHistoryContainer.innerHTML = "";
    // Iterate each element in array
    retrievedData.forEach((element,index) => {
        // document.createElement
        var searchHistoryContainerEl = document.createElement("li");
        searchHistoryContainerEl.classList.add("list-group-item");
        searchHistoryContainer.appendChild(searchHistoryContainerEl);

        var searchHistoryEl = document.createTextNode(element);
        searchHistoryContainerEl.appendChild(searchHistoryEl);   
    })
};
}


var getCurrentWeather = function(city) {
    //format the openweather api url
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + apiKey;
    
    //make a request to the url
    fetch (apiUrl)
    .then(weather => {
        return weather.json();
    }).then(displayResults);
};

//display current weather
var displayResults = function(weather) {
    //display location name
    var city = document.querySelector(".location");
    city.innerText=`${weather.name}, ${weather.sys.country}`;

    //display date
    var now = new Date();
    var date = document.querySelector(".date")
    date.innerText = dateBuilder(now);

    //display current temp
    var currentTemp = document.querySelector(".current-temp");
    currentTemp.innerHTML = (Math.round(weather.main.temp) + "°F");

    //display current humidity
    var currentHum = document.querySelector(".current-hum");
    currentHum.innerText = `${weather.main.humidity}%`;

    //display current wind speed
    var currentWind = document.querySelector(".current-wind");
    currentWind.innerHTML = (Math.round(weather.wind.speed) + "MPH");

    //create a new variable for icon name
    var iconName = `${weather.weather[0].icon}`
    var iconUrl = "https://openweathermap.org/img/wn/"+ iconName + "@2x.png";

    var img = document.createElement("img");
    img.src = iconUrl
    var src = document.getElementById("current-icon");
    src.innerHTML="";
    src.appendChild(img);

    //obtain latitude and longitude data from first fetch
    var longitudeEl = (weather.coord.lon);
    var latitudeEl = (weather.coord.lat);

    //create new fetch request for UV url
    var uvURL = "https://api.openweathermap.org/data/2.5/uvi?lat=" + latitudeEl + "&lon=" + longitudeEl + "&appid=" + apiKey;
    fetch (uvURL)
    .then(uv => {
        return uv.json();
    }).then(uvEl => {
        var uvIndex = document.querySelector("#uv-index");
        uvIndex.innerText = `${uvEl.value}`;
        //apply color to UV text depending on UV value
        if (uvEl.value < 3) {
            uvIndex.classList.add("bg-success");
        }
        else if (uvEl.value > 2 && uvEl.value < 6) {
            uvIndex.classList.add("bg-warning");
        }
        else if (uvEl.value > 5 && uvEl.value < 8) {
            uvIndex.classList.add("bg-orange");
        }
        else if (uvEl.value > 7 && uvEl.value < 11) {
            uvIndex.classList.add("bg-danger");
        }
        else if (uvEl.value > 11) {
            uvIndex.classList.add("bg-purple");
        }
    });
    
    //5 day forecast
    var forecastURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitudeEl + "&lon=" + longitudeEl + "&units=imperial&exclude=current,minutely,hourly,alerts&appid=" + apiKey;
    fetch (forecastURL)
    .then(forecast => {
        return forecast.json();
    }).then(forecastEl => {
        var containerEl = document.getElementById("forecast");
        containerEl.innerHTML="";
        forecastEl.daily.forEach( (element, index) => {
            // Skip 0 = current day (continue)
            // Return when >=6      (stop function)
            if(index === 0) {
                // NO OP
            }else if(index >= 6){
                return;
            }else{
                // Unix Epoch is in milliseconds, dt is seconds. Multiply by 1000 to convert dt to milliseconds
                var now = new Date(element.dt*1000);
                var dateEl = dateBuilder(now);
                var forecastTemp = element.temp.day;
                var forecastHumidity = element.humidity;
                var iconName = element.weather[0].icon;
                var iconUrl = "https://openweathermap.org/img/wn/" + iconName + ".png";

                // Get ID of Parent Container
                var containerEl = document.getElementById("forecast");
        
                // Create Div
                var weatherCardEl = document.createElement("div");
                weatherCardEl.classList.add("card", "weather-card");
                var cardBody = document.createElement("div");
                cardBody.classList.add("card-body");

                // Create element

                //date
                var forecastDateEl = document.createElement("h5");
                var forecastDateText = document.createTextNode(dateEl);
                forecastDateEl.appendChild(forecastDateText);

                //icon
                var forecastIcon = document.createElement("img");
                forecastIcon.src = iconUrl;

                //temperature
                var forecastTempEl = document.createElement("p");
                var forecastTempText = document.createTextNode("Temperature: " + (Math.round(forecastTemp)) + "°F");
                forecastTempEl.appendChild(forecastTempText);

                //humidity
                var forecastHumidityEl = document.createElement("p");
                var forecastHumidityText = document.createTextNode("Humidity: " + forecastHumidity + "%");
                forecastHumidityEl.appendChild(forecastHumidityText);

                //append to div
                containerEl.appendChild(weatherCardEl);
                weatherCardEl.appendChild(cardBody);
                cardBody.appendChild(forecastDateEl);
                cardBody.appendChild(forecastIcon);
                cardBody.appendChild(forecastTempEl);
                cardBody.appendChild(forecastHumidityEl)

            };
        });
    });
};

var dateBuilder = function(d) {
    var monthsArray = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
    var date = d.getDate();
    var month = monthsArray[d.getMonth()];
    var year = d.getFullYear();

    return `${month}/${date}/${year}`

};

retrieveHistory();
userFormEl.addEventListener("submit", formSubmitHandler);