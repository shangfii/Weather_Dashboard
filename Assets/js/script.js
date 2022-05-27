// querySelectors from HTML list

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


// function to populate search history card calling localStorage

function renderSearchHist(){
  const searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
  if (searchHistory == null){
    return;
  }else{
    for (let i=0; i<searchHistory.length; i++){

    // Create a button elements for each city in search history.
    // NOTE: data-id added to each button with the name of the city

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

// This Function renders the last searched city to page

function renderLastSearchedCity(){
  const searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
  const lastIndex = (searchHistory.length)-1;

  // button elements for last city searched. 
  //NOTE: data-id added to each button with the name of the city searched

  let searchButton = document.createElement("button");
  searchButton.classList = 'btn';

  // Get the name of last city searched

  let histCity = searchHistory[lastIndex].city;
  searchButton.setAttribute('data-id', histCity);
  searchButton.textContent = histCity;

  // append button to page
  searchHistoryButtonsEl.appendChild(searchButton);
}

// To execute search button request

var formSubmitHandler = function (event) {
  event.preventDefault();
  var cityToSearch = nameInputEl.value.trim();

  
  
    if (cityToSearch) {
      // if a city was entered, the function for getting the city cordinates will execute and the city name will be saved as an object data type to local storage
      getCityCord(cityToSearch);
      fiveDayWeatherEl.textContent = '';
      nameInputEl.value = '';

      // retrieve history from localStorage 

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

             // do not duplicate searched city it if already exist in local storage

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
      alert('Type the name of a city to search');
      }
};

// getting weather information from a city in the search history list using a function

var buttonClickHandler = function (event) {
  var cityHistory = event.target.getAttribute('data-id');

  // if a button was clicked, this function will get the city cordinates and execute

    if (cityHistory) {
      fiveDayWeatherEl.textContent = '';
      getCityCord(cityHistory)
    }
};

// function to retrieve the city Lat. and Lon. cordinates Using openweathermap API 
// NOTE: This Function also displays city, date and current weather condition icon on page

var getCityCord = function (city) {
  var apiUrl = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=62a5b1ea1db941bd9e1dfda535185c10&units=standard';
  
   
  fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {

        // collect current date info from API response

        cityAndDateEl.textContent = "";
        let dateObject = new Date((data.dt)*1000);
        let dateMonth = dateObject.toLocaleDateString("en-US", {month: "long"});
        let dateDay = dateObject.toLocaleDateString("en-US", {day: "numeric"});
        let dateYear = dateObject.toLocaleDateString("en-US", {year: "numeric"});
        let searchDate = dateMonth+'/'+dateDay+'/'+dateYear;

        // display city and date to page

        cityAndDateEl.textContent = data.name+' ('+searchDate+')';

        // retrieve and displaying current weather condition icon

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
      alert('Unable to connect source');
    });
};

//Function for obtaining current and 5 day forcast weather information. Using another  API from Openweather map
var getCityWeather = function (lat, lon) {
  var apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon='+lon+'&appid=d661cb0aeb8d958933f0c541ff1dcd8d&units=standard';

  fetch(apiUrl).then(function (response) {
    if (response.ok) {
        response.json().then(function (data) {

        //display current weather conditions to page 
        currentTemp.textContent = ' '+Math.floor(data.current.temp)+ "\u2109";
        currentWind.textContent = ' '+data.current.wind_speed+' MPH';
        currentHumidity.textContent = ' '+data.current.humidity+' %';
        currentUvIndex.textContent = ' '+data.current.uvi;
        // setting IF statements to display different background colors for UV index value, depending on favorable, moderate or severe conditions
          if(data.current.uvi<=2) {
            currentUvIndex.setAttribute('style','background-color: green; color: white; border-radius: var(--border-radius); padding-right: 13px')
          }else if(data.current.uvi<=5) {
            currentUvIndex.setAttribute('style','background-color: yellow; border-radius: var(--border-radius); padding-right: 3px')
          }else if(data.current.uvi<=7) {
            currentUvIndex.setAttribute('style','background-color: orange; border-radius: var(--border-radius); padding-right: 3px')
          }else if(data.current.uvi<=10) {
            currentUvIndex.setAttribute('style','background-color: red; color: white; border-radius: var(--border-radius); padding-right: 3px')
          }else {
            currentUvIndex.setAttribute('style','background-color: purple; color: white; border-radius: var(--border-radius); padding-right: 3px')
          }
        
        
        //Call the function to get 5 day weather forcast
        display5dayWeather(data.daily);
      });
    } else {
      alert('Error: ' + response.statusText);
    }
  });
};

// Function to display 5 day weather forcast on visitor's page

var display5dayWeather = function (data5Day) {
  if (data5Day.length === 0) {
    fiveDayWeatherEl.textContent = 'No repositories found.';
    return;
  };

  // Using FOR LOOP to creat a card with weather info for each of the following 5 days

  for (var i = 1; i < 6; i++) {
    
    // These elements  hold weather information for each day

    var weatherDayCard = document.createElement('div');
    var weatherCardH2 = document.createElement('h2');
    var weatherIcon = document.createElement('img')
    var weatherInfoGroup = document.createElement('div');
    var pTemp = document.createElement('p');
    var pWind = document.createElement('p');
    var pHumidity = document.createElement('p');

    // Collect the date for each day

    let dateObject = new Date((data5Day[i].dt)*1000);
    let dateMonth = dateObject.toLocaleDateString("en-US", {month: "long"});
    let dateDay = dateObject.toLocaleDateString("en-US", {day: "numeric"});
    let dateYear = dateObject.toLocaleDateString("en-US", {year: "numeric"});
    let dateEl = dateMonth+'/'+dateDay+'/'+dateYear;

    // Collect the weather icon info for each day
    let iconEl = data5Day[i].weather[0].icon
    let iconDscrpt = data5Day[i].weather[0].description;

    // display Temp, Wind, Humidity, weather icon and date info for each day

    pTemp.textContent = 'Temp: '+Math.floor(data5Day[i].temp.day)+'\u2109';
    pWind.textContent =  'Wind: '+data5Day[i].wind_speed+' MPH';
    pHumidity.textContent = 'Humidity: '+data5Day[i].humidity+' %';
    weatherCardH2.textContent = dateEl;
    weatherIcon.setAttribute('src','http://openweathermap.org/img/wn/'+iconEl+'@2x.png');

    //Setting attributes to tags after they have been generated

    weatherCardH2.setAttribute('style', 'color: white; font-weight: 250; font-size: 1rem')
    pTemp.setAttribute('style','margin: 0; font-size: 1rem')
    pWind.setAttribute('style','margin: 0; font-size: 1rem')
    pHumidity.setAttribute('style','margin: 0; font-size: 1rem')
    weatherIcon.setAttribute('alt', iconDscrpt);
    weatherIcon.setAttribute('style','width: 50px; height: 50px; border-radius: var(--border-radius)')
    weatherDayCard.classList = 'col-12 col-lg-2';
    weatherDayCard.setAttribute('style','background-color: var(--light-dark); color: white; border-radius: var(--border-radius); padding: 5px; margin-bottom: 5px')
    
    //Appending the info to the page
    weatherInfoGroup.appendChild(pTemp);
    weatherInfoGroup.appendChild(pWind);
    weatherInfoGroup.appendChild(pHumidity);
    weatherDayCard.appendChild(weatherCardH2);
    weatherDayCard.appendChild(weatherIcon);
    weatherDayCard.appendChild(weatherInfoGroup);
    fiveDayWeatherEl.appendChild(weatherDayCard);
  }
};
// function to collect local storage info at start of each page session

renderSearchHist();

//event listeners for search bar and search history data

cityFormEl.addEventListener('submit', formSubmitHandler);
searchHistoryButtonsEl.addEventListener('click', buttonClickHandler);