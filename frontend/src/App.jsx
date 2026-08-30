import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";

function getWeatherIcon(weather) {
  switch (weather?.toLowerCase()) {
    case "clear":
      return "☀️";

    case "clouds":
      return "☁️";

    case "rain":
      return "🌧️";

    case "drizzle":
      return "🌦️";

    case "thunderstorm":
      return "⛈️";

    case "snow":
      return "❄️";

    case "mist":
    case "fog":
    case "haze":
      return "🌫️";

    default:
      return "🌤️";
  }
}

function App() {
  const {
    isAuthenticated,
    isLoading,
    user,
    getAccessTokenSilently
  } = useAuth0();

  const [weather, setWeather] = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [sortBy, setSortBy] = useState("comfort");
  const [filterWeather, setFilterWeather] = useState("all");

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    async function fetchWeather() {
      try {
        setWeatherLoading(true);
        setError("");

        const token = await getAccessTokenSilently();

        const response = await fetch(
          "http://localhost:3000/api/weather",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const data = await response.json();

        setWeather(data);

      } catch (error) {
        console.error("Error fetching weather:", error);
        setError("Unable to load weather data.");

      } finally {
        setWeatherLoading(false);
      }
    }

    fetchWeather();

  }, [isAuthenticated, getAccessTokenSilently]);


  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }


  if (!isAuthenticated) {
    return (
      <div className="login-page">

        <div className="login-card">

          <div className="login-icon">
            🌤️
          </div>

          <h1>Fidenz Weather</h1>

          <p>
            Weather analytics and comfort insights
            for cities around the world.
          </p>

          <LoginButton />

        </div>

      </div>
    );
  }


  const topCity = weather.length > 0 ? weather[0] : null;

  const weatherTypes = [
    ...new Set(
      weather.map(city => city.weather.toLowerCase())
    )
  ];

  const filteredWeather = [...weather]
    .filter(city => {
      if (filterWeather === "all") {
        return true;
      }
      return city.weather.toLowerCase() === filterWeather;
    })
    .sort((a, b) => {
      if (sortBy === "comfort") {
        return b.comfortScore - a.comfortScore;
      }
      if (sortBy === "temperature") {
        return b.temperature - a.temperature;
      }
      return a.city.localeCompare(b.city);
    });


  return (
    <div className={darkMode ? "app dark-mode" : "app"}>

      {/* Header */}

      <header className="dashboard-header">

        <div className="brand">

          <div className="brand-icon">
            🌤️
          </div>

          <div>
            <h1>Fidenz Weather</h1>
            <p>Global Comfort Dashboard</p>
          </div>

        </div>


        <div className="user-section">

          <button className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

          <div className="user-info">
            <span>Welcome</span>
            <strong>
              {user.name || user.email}
            </strong>
          </div>

          <LogoutButton />

        </div>

      </header>


      {/* Loading */}

      {weatherLoading && (
        <div className="status-message">
          <div className="loading-spinner"></div>
          <p>Fetching weather data...</p>
        </div>
      )}


      {/* Error */}

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}


      {/* Dashboard */}

      {!weatherLoading && !error && weather.length > 0 && (
        <>

          {/* Top City */}

          <section className="featured-weather">

            <div className="featured-content">

              <div className="featured-label">
                🏆 MOST COMFORTABLE CITY
              </div>

              <div className="featured-city">

                <div>

                  <h2>{topCity.city}</h2>

                  <div className="featured-condition">
                    <span className="featured-icon">
                      {getWeatherIcon(topCity.weather)}
                    </span>

                    <span>
                      {topCity.weather}
                    </span>
                  </div>

                </div>


                <div className="featured-temperature">
                  {topCity.temperature}°
                  <span>C</span>
                </div>

              </div>

            </div>


            <div className="featured-score">

              <p>Comfort Index</p>

              <div className="score-circle">
                <strong>
                  {topCity.comfortScore}
                </strong>

                <span>/100</span>
              </div>

              <div className="score-bar">
                <div
                  style={{
                    width: `${topCity.comfortScore}%`
                  }}
                ></div>
              </div>

            </div>

          </section>


          {/* Section title */}

          <div className="section-heading">

            <div>
              <h2>City Weather</h2>
              <p>
                Ranked from most to least comfortable
              </p>
            </div>

            <div className="weather-controls">

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)} >

                <option value="comfort">Comfort Score</option>
                <option value="temperature">Temperature</option>
                <option value="city">City Name</option>
              </select>

              <select
                value={filterWeather}
                onChange={(e) => setFilterWeather(e.target.value)} >

                <option value="all">All Weather</option>

                {weatherTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}

              </select>

              <div className="city-count">
                {filteredWeather.lenght} Cities
              </div>
            </div>

            <div className="city-count">
              {weather.length} Cities
            </div>

          </div>


          {/* Weather cards */}

          <div className="weather-grid">

            {filteredWeather.map(city => (

              <div
                className="weather-card"
                key={city.city}
              >

                <div className="card-top">

                  <span className="rank">
                    #{city.rank}
                  </span>

                  <span className="weather-icon">
                    {getWeatherIcon(city.weather)}
                  </span>

                </div>


                <h3>{city.city}</h3>

                <p className="condition">
                  {city.weather}
                </p>


                <div className="card-temperature">
                  {city.temperature}
                  <span>°C</span>
                </div>


                <div className="comfort-section">

                  <div className="comfort-header">

                    <span>
                      Comfort Index
                    </span>

                    <strong>
                      {city.comfortScore}
                    </strong>

                  </div>

                  <div className="score-bar small">
                    <div
                      style={{
                        width: `${city.comfortScore}%`
                      }}
                    ></div>
                  </div>

                </div>


                <div className="weather-details">

                  <div>
                    <span>💧</span>
                    <small>Humidity</small>
                    <strong>
                      {city.humidity}%
                    </strong>
                  </div>

                  <div>
                    <span>💨</span>
                    <small>Wind</small>
                    <strong>
                      {city.windspeed} m/s
                    </strong>
                  </div>

                  <div>
                    <span>☁️</span>
                    <small>Clouds</small>
                    <strong>
                      {city.cloudiness}%
                    </strong>
                  </div>

                </div>

              </div>

            ))}

          </div>

        </>
      )}

    </div>
  );
}

export default App;