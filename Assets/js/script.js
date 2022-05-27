// Defining important querySelectors from HTML
var cityFormEl = document.querySelector('#city-form');
var searchHistoryButtonsEl = document.querySelector('#searchHistory-buttons');
var nameInputEl = document.querySelector('#searchCity');
var fiveDayWeatherEl = document.querySelector('#fiveDayWeather');
var cityAndDateEl = document.querySelector('#cityWeather');
var currentTemp = document.querySelector('#tempResult');
var currentWind = document.querySelector('#windResult');
var currentHumidity = document.querySelector('#humidityResult');
var currentUvIndex = document.querySelector('#uvIndexResult');
var currentIconEl = document.querySelector('#currentIcon');
var currentWeatherCard = document.querySelector('#currentWeather');

// var deg =U+2109
// console.log(deg);

// function for populating search history card by calling localStorage
function renderSearchHist(){
  const searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
  if (searchHistory == null){
    return;
  }else{
    for (let i=0; i<searchHistory.length; i++){
    // creating button elements for each city in search history. Important: adding a data-id to each button with the name of the city
    let searchButton = document.createElement("button");
    searchButton.classList = 'btn';
    // converting typed city name toUpperCase
    let histCity = searchHistory[i].city;
    searchButton.setAttribute('data-id', histCity);
    searchButton.textContent = histCity;
    // appending each button to page
    searchHistoryButtonsEl.appendChild(searchButton);
    }
  }
}
// Function for rendering last searched city to page
function renderLastSearchedCity(){
  const searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
  const lastIndex = (searchHistory.length)-1;
  console.log(searchHistory.length);
  // creating button elements for last city searched. Important: adding a data-id to each button with the name of the city
  let searchButton = document.createElement("button");
  searchButton.classList = 'btn';
  // Getting the name of last city searched
  let histCity = searchHistory[lastIndex].city;
  searchButton.setAttribute('data-id', histCity);
  searchButton.textContent = histCity;
  // appending button to page
  searchHistoryButtonsEl.appendChild(searchButton);
}

// function for executing search button request
var formSubmitHandler = function (event) {
  event.preventDefault();
  var inputCity = nameInputEl.value.trim();
  // converting typed city name toUpperCase
  var cityToSearch = inputCity.toUpperCase();
  
    if (cityToSearch) {
      // if a city was enter, the function for getting the city cordinates will execute and the city name will be saved as an object data type to local storage
      getCityCord(cityToSearch);
      fiveDayWeatherEl.textContent = '';
      nameInputEl.value = '';
      // retrieving localStorage history
      var searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
      // if no cities are saved in local storage, identify searchHistory as an array before saving to local storage as object
      let searchedCity = {
          city: cityToSearch,
      };
      
      if(searchHistory===null){
        searchHistory = [];
        searchHistory.push(searchedCity);
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory))
        // Update Search HIstory card on page
        renderLastSearchedCity();
      } else{ 
      //check if cityToSearch already exist in local storage
          let alreadyExist = searchHistory.some(element => {
            if(element.city === cityToSearch){
              return true;
            }});
             // if searched city already exist in local storage. Don't add duplicate.
            if (alreadyExist) {
              return;   
            } else {
              //saving city name to local storage and updating search history card
              searchHistory.push(searchedCity);
              localStorage.setItem("searchHistory", JSON.stringify(searchHistory))
              renderLastSearchedCity();
            }
      }
    } else {
      alert('Please enter a U.S. city');
      }
};

// function for getting weather information from a city in the search history list
var buttonClickHandler = function (event) {
  var cityHistory = event.target.getAttribute('data-id');
  // if a button was clicked, function for getting the city cordinates will execute
    if (cityHistory) {
      fiveDayWeatherEl.textContent = '';
      getCityCord(cityHistory)
    }
};

// function for retrieving city Lat. and Lon. cordinates. Using openweathermap API to fulfill this function. Function also displays city, date and current weather condition icon on page
var getCityCord = function (city) {
  var apiUrl = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=54e7f52687ad06a72df0a38da00d54f8&units=imperial';
   
  fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
        // collecting current date info from API response
        cityAndDateEl.textContent = "";
        let dateObject = new Date((data.dt)*1000);
        let dateMonth = dateObject.toLocaleDateString("en-US", {month: "long"});
        let dateDay = dateObject.toLocaleDateString("en-US", {day: "numeric"});
        let dateYear = dateObject.toLocaleDateString("en-US", {year: "numeric"});
        let searchDate = dateMonth+'.'+dateDay+'.'+dateYear;
        // displaying city and date to page
        cityAndDateEl.textContent = data.name+' ('+searchDate+')';
        // retrieving and displaying current weather condition icon
        let currentIconCode = data.weather[0].icon;
        let currentIconDscrpt = data.weather[0].description;
        currentIconEl.setAttribute('src','http://openweathermap.org/img/wn/'+currentIconCode+'@2x.png')
        currentIconEl.setAttribute('alt', currentIconDscrpt)
        currentIconEl.setAttribute('style','width: 50px; height: 50px; background-color: var(--light-dark); border-radius: var(--border-radius)')
        // currentWeatherCard.setAttribute('style','background-color: white;)')
    
        //passing the lat and lon cordinates to the next function
        var lat = data.coord.lat;
        var lon = data.coord.lon;
        getCityWeather(lat, lon);
        });
      } else {
        alert('Error: ' + response.statusText);
      }
    })
    .catch(function (error) {
      alert('Unable to connect to GitHub');
    });
};

//Function for obtaining current and 5 day forcast weather information. Using a different openweathermap API
var getCityWeather = function (lat, lon) {
  var apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon='+lon+'&appid=54e7f52687ad06a72df0a38da00d54f8&units=imperial';

  fetch(apiUrl).then(function (response) {
    if (response.ok) {
        response.json().then(function (data) {
        //displaying current weather conditions to page 
        currentTemp.textContent = ' '+Math.floor(data.current.temp)+ "\u2109";
        currentWind.textContent = ' '+data.current.wind_speed+' MPH';
        currentHumidity.textContent = ' '+data.current.humidity+' %';
        currentUvIndex.textContent = ' '+data.current.uvi;
        // setting IF statements to display different background colors for UV index value, depending on favorable, moderate or severe conditions
          if(data.current.uvi<=2) {
            currentUvIndex.setAttribute('style','background-color: green; color: white; border-radius: var(--border-radius); padding-right: 5px')
          }else if(data.current.uvi<=5) {
            currentUvIndex.setAttribute('style','background-color: yellow; border-radius: var(--border-radius); padding-right: 5px')
          }else if(data.current.uvi<=7) {
            currentUvIndex.setAttribute('style','background-color: orange; border-radius: var(--border-radius); padding-right: 5px')
          }else if(data.current.uvi<=10) {
            currentUvIndex.setAttribute('style','background-color: red; color: white; border-radius: var(--border-radius); padding-right: 5px')
          }else {
            currentUvIndex.setAttribute('style','background-color: purple; color: white; border-radius: var(--border-radius); padding-right: 5px')
          }
        //Calling function for 5 day weather forcast
        display5dayWeather(data.daily);
      });
    } else {
      alert('Error: ' + response.statusText);
    }
  });
};

// Function for displaying 5 day weather forcast on page
var display5dayWeather = function (data5Day) {
  if (data5Day.length === 0) {
    fiveDayWeatherEl.textContent = 'No repositories found.';
    return;
  };
  // FOR LOOP for creating a card with weather info for each of the following 5 days
  for (var i = 1; i < 6; i++) {
    
    // Creating elements that will hold weather information for each day
    var weatherDayCard = document.createElement('div');
    var weatherCardH2 = document.createElement('h2');
    var weatherIcon = document.createElement('img')
    var weatherInfoGroup = document.createElement('div');
    var pTemp = document.createElement('p');
    var pWind = document.createElement('p');
    var pHumidity = document.createElement('p');
    // Collecting date for each day
    let dateObject = new Date((data5Day[i].dt)*1000);
    let dateMonth = dateObject.toLocaleDateString("en-US", {month: "long"});
    let dateDay = dateObject.toLocaleDateString("en-US", {day: "numeric"});
    let dateYear = dateObject.toLocaleDateString("en-US", {year: "numeric"});
    let dateEl = dateMonth+'.'+dateDay+'.'+dateYear;
    // Collecting weather icon info for each day
    let iconEl = data5Day[i].weather[0].icon
    let iconDscrpt = data5Day[i].weather[0].description;
    // displaying Temp, Wind, Humidity, weather icon and date info for each day
    pTemp.textContent = 'Temp: '+Math.floor(data5Day[i].temp.day)+'\u2109';
    pWind.textContent =  'Wind: '+data5Day[i].wind_speed+' MPH';
    pHumidity.textContent = 'Humidity: '+data5Day[i].humidity+' %';
    weatherCardH2.textContent = dateEl;
    weatherIcon.setAttribute('src','http://openweathermap.org/img/wn/'+iconEl+'@2x.png');
    //Setting attributes to tags generated
    weatherCardH2.setAttribute('style', 'color: white; font-weight: 250; font-size: 1rem')
    pTemp.setAttribute('style','margin: 0; font-size: 1rem')
    pWind.setAttribute('style','margin: 0; font-size: 1rem')
    pHumidity.setAttribute('style','margin: 0; font-size: 1rem')
    weatherIcon.setAttribute('alt', iconDscrpt);
    weatherIcon.setAttribute('style','width: 50px; height: 50px; border-radius: var(--border-radius)')
    weatherDayCard.classList = 'col-12 col-lg-2';
    weatherDayCard.setAttribute('style','background-color: var(--light-dark); color: white; border-radius: var(--border-radius); padding: 5px; margin-bottom: 5px')
    //Appending everything to the page
    weatherInfoGroup.appendChild(pTemp);
    weatherInfoGroup.appendChild(pWind);
    weatherInfoGroup.appendChild(pHumidity);
    weatherDayCard.appendChild(weatherCardH2);
    weatherDayCard.appendChild(weatherIcon);
    weatherDayCard.appendChild(weatherInfoGroup);
    fiveDayWeatherEl.appendChild(weatherDayCard);
  }
};
// calling function that will collect local storage info at start of each page session
renderSearchHist();
//Setting event listeners for search bar and search history data
cityFormEl.addEventListener('submit', formSubmitHandler);
searchHistoryButtonsEl.addEventListener('click', buttonClickHandler);