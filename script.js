const apiKey = "39c5284ed9f5477d8b6172254250311"; // ⚠️ Replace with your new API key
let myChart = null; 

// Show dashboard once data is available
function showDashboard() {
    document.getElementById("dashboard").classList.remove("hidden");
}

// Detect current location
function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            // WeatherAPI.com uses lat,lon format
            getWeatherData(`${pos.coords.latitude},${pos.coords.longitude}`, "Your Location");
        });
    }
}

// Fetch by city
async function getWeatherByCity() {
    const city = document.getElementById("cityInput").value.trim(); 
    
    if (!city) {
        return alert("Please enter a city name!");
    }
    
    getWeatherData(city, city); // City name can be passed directly to the API
}

// Fetch forecast + current
async function getWeatherData(query, placeName) {
    // ⚠️ New URL structure for WeatherAPI.com
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=4`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Handle API errors
        if (data.error) {
            console.error("API error:", data.error.message);
            return alert("Error fetching weather data. Please check your city name or API key.");
        }

        showDashboard(); 

        const current = data.current;
        document.getElementById("currentWeather").innerHTML = `
            <h2>${placeName}</h2>
            <h1>${Math.round(current.temp_c)}°C</h1>
            <p>${current.condition.text}</p>
            <p>Humidity: ${current.humidity}%</p>
            <p>Wind: ${current.wind_kph} km/h</p>
            <p>Precipitation: ${current.precip_mm} mm</p>
            <img src="https:${current.condition.icon}">
        `;

        // Temperature trend for next 24 hours
        let hours = [], temps = [];
        const hourlyForecast = data.forecast.forecastday[0].hour;
        for (let i = 0; i < 24; i += 3) {
            const item = hourlyForecast[i];
            hours.push(new Date(item.time).getHours() + ":00");
            temps.push(item.temp_c);
        }
        
        const ctx = document.getElementById("tempChart").getContext("2d");

        if (myChart) {
            myChart.destroy();
        }

        myChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: hours,
                datasets: [{
                    label: "Temperature (°C)",
                    data: temps,
                    borderColor: "#f1c40f",
                    backgroundColor: "rgba(241,196,15,0.2)",
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: "white" } },
                    y: { ticks: { color: "white" } }
                }
            }
        });

        // Forecast for next days (skipping the current day)
        let forecastHTML = "";
        const futureDays = data.forecast.forecastday.slice(1);
        for (const f of futureDays) {
            const date = new Date(f.date);
            forecastHTML += `
                <div class="day-card">
                    <h4>${date.toLocaleDateString("en-US", { weekday: "short" })}</h4>
                    <img src="https:${f.day.condition.icon}">
                    <p>${Math.round(f.day.avgtemp_c)}°C</p>
                    <p>💧 ${f.day.daily_chance_of_rain}% | 🌬 ${f.day.maxwind_kph} km/h</p>
                </div>
            `;
        }
        document.getElementById("forecastDays").innerHTML = forecastHTML;

        // Set background animation based on current weather condition
        setWeatherAnimation(current.condition.text.toLowerCase());

    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Could not retrieve weather data. Please try again later.");
    }
}

// Simple weather animations
function setWeatherAnimation(condition) {
    const animBox = document.getElementById("weatherAnimation");
    animBox.className = "weather-animation"; // reset
    if (condition.includes("rain")) animBox.classList.add("rain");
    else if (condition.includes("cloud")) animBox.classList.add("clouds");

}
