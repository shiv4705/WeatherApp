// Updated script.js
let cityInput = document.getElementById("city_input"),
  searchBtn = document.getElementById("searchBtn"),
  locationBtn = document.getElementById("locationBtn"),
  api_key = "f7b827d42e449a904b59ab19d3cdd058",
  currentWeatherCard = document.querySelector(".weather-left .card"),
  fiveDaysForecastCards = document.querySelectorAll(".day-forecast"),
  hourlyForecastContainer = document.querySelector(".hourly-forecast"),
  aqiText = document.querySelector(".air-index"),
  airItems = document.querySelectorAll(".air-indices .item h2");

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getAQIIndex(aqi) {
  switch (aqi) {
    case 1:
      return "Good";
    case 2:
      return "Fair";
    case 3:
      return "Moderate";
    case 4:
      return "Poor";
    case 5:
      return "Very Poor";
    default:
      return "Unknown";
  }
}

function getWeatherDetails(cityName, lat, lon, country, state) {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`;
  const FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`;
  const AQI_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`;

  // Current Weather
  fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
      let date = new Date();
      currentWeatherCard.innerHTML = `
        <div class="current-weather">
          <div class="details">
            <p>Now</p>
            <h2>${(data.main.temp - 273.15).toFixed(2)}&deg;C</h2>
            <p>${data.weather[0].description}</p>
          </div>
          <div class="weather-icons">
            <img src="https://openweathermap.org/img/wn/${
              data.weather[0].icon
            }@2x.png" alt="Weather Icon" />
          </div>
        </div>
        <hr>
        <div class="card-footer">
          <p><i class="fa-solid fa-calendar"></i> ${
            days[date.getDay()]
          }, ${date.getDate()} ${
        months[date.getMonth()]
      }, ${date.getFullYear()}</p>
          <p><i class="fa-solid fa-location-dot"></i> ${cityName}, ${country}</p>
        </div>
      `;

      document.getElementById(
        "humidityVal"
      ).textContent = `${data.main.humidity}%`;
      document.getElementById(
        "pressureVal"
      ).textContent = `${data.main.pressure} hPa`;
      document.getElementById("visibilityVal").textContent = `${(
        data.visibility / 1000
      ).toFixed(1)} km`;
      document.getElementById(
        "windSpeedVal"
      ).textContent = `${data.wind.speed} m/s`;
      document.getElementById("feelsVal").textContent = `${(
        data.main.feels_like - 273.15
      ).toFixed(1)}°C`;

      let sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      let sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const sunriseEls = document.querySelectorAll(".sunrise-sunset .item");
      if (sunriseEls.length >= 4) {
        sunriseEls[1].querySelector("h2").textContent = sunrise;
        sunriseEls[3].querySelector("h2").textContent = sunset;
      }
    });

  // AQI
  fetch(AQI_API_URL)
    .then((res) => res.json())
    .then((data) => {
      const aqi = data.list[0].main.aqi;
      const components = data.list[0].components;
      aqiText.textContent = getAQIIndex(aqi);
      const pollutantKeys = [
        "pm2_5",
        "pm10",
        "so2",
        "co",
        "no",
        "no2",
        "nh3",
        "o3",
      ];
      pollutantKeys.forEach((key, index) => {
        airItems[index].textContent = components[key] || "-";
      });
    });

  // 5-day Forecast + Hourly
  fetch(FORECAST_API_URL)
    .then((res) => res.json())
    .then((data) => {
      let dailyData = {},
        hourlyItems = data.list.slice(0, 8); // 24 hours at 3-hour intervals
      data.list.forEach((entry) => {
        let date = entry.dt_txt.split(" ")[0];
        if (!dailyData[date]) {
          dailyData[date] = entry;
        }
      });

      let i = 0;
      Object.keys(dailyData)
        .slice(0, 5)
        .forEach((dateStr) => {
          let entry = dailyData[dateStr];
          let dateObj = new Date(dateStr);
          if (fiveDaysForecastCards[i]) {
            fiveDaysForecastCards[i].innerHTML = `
            <div class="forecast-item">
              <div class="icon-wrapper">
                <img src="https://openweathermap.org/img/wn/${
                  entry.weather[0].icon
                }@2x.png" alt="" />
                <span>${(entry.main.temp - 273.15).toFixed(0)}&deg;C</span>
              </div>
              <p>${days[dateObj.getDay()]}</p>
              <p>${dateObj.getDate()}/${dateObj.getMonth() + 1}</p>
            </div>
          `;
          }
          i++;
        });

      hourlyForecastContainer.innerHTML = "";
      hourlyItems.forEach((item) => {
        let time = new Date(item.dt * 1000).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        hourlyForecastContainer.innerHTML += `
          <div class="card">
            <p>${time}</p>
            <img src="https://openweathermap.org/img/wn/${
              item.weather[0].icon
            }.png" alt="" />
            <h2>${(item.main.temp - 273.15).toFixed(0)}&deg;C</h2>
          </div>
        `;
      });
    });
}

function getCityCoordinates() {
  let cityName = cityInput.value.trim();
  if (!cityName) {
    alert("Please enter a city name.");
    return;
  }
  cityInput.value = "";
  const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_key}`;

  fetch(GEOCODING_API_URL)
    .then((res) => res.json())
    .then((data) => {
      if (!data.length) return alert("City not found.");
      let { name, lat, lon, country, state } = data[0];
      getWeatherDetails(name, lat, lon, country, state);
    })
    .catch(() =>
      alert("Could not retrieve city coordinates. Please try again.")
    );
}

searchBtn.addEventListener("click", getCityCoordinates);

// Optional: Add location support
locationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${api_key}`
        )
          .then((res) => res.json())
          .then((data) => {
            if (!data.length) return alert("Location not found.");
            let { name, lat, lon, country, state } = data[0];
            getWeatherDetails(name, lat, lon, country, state);
          });
      },
      () => alert("Location access denied.")
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
});
