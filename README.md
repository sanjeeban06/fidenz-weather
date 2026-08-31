# Fidenz Weather Analytics

A full-stack weather analytics application that retrieves weather data from OpenWeatherMap, calculates a custom Comfort Index for each city, ranks cities by comfort, and displays the results through a responsive React dashboard.

## Features

* Weather data retrieval from OpenWeatherMap
* Processes weather data for multiple cities from `cities.json`
* Custom Comfort Index calculated on the backend
* Cities ranked from most comfortable to least comfortable
* Server-side caching
* Separate raw-data and processed-data caches
* Cache debugging endpoint
* Auth0 authentication
* Restricted public signups
* MFA support through Auth0
* Responsive desktop and mobile UI
* Dark mode
* Frontend sorting and filtering
* Unit tests for the Comfort Index

---

## Technology Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Node.js
* Express
* Axios
* Jest

### Services

* OpenWeatherMap API
* Auth0

---

# Setup Instructions

## 1. Clone the repository

bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
cd fidenz-weather


## 2. Backend setup

bash
cd backend
npm install


Create a .env file:

env:

1. OPENWEATHER_API_KEY=your_openweathermap_api_key
2. AUTH0_DOMAIN=your_auth0_domain
3. AUTH0_AUDIENCE=your_auth0_api_identifier


Start the backend:

bash
node server.js


The backend runs on:

http://localhost:3000

---

## 3. Frontend setup

Open another terminal:

bash
cd frontend
npm install


Create a `.env` file:

env:

1. VITE_AUTH0_DOMAIN=your_auth0_domain
2. VITE_AUTH0_CLIENT_ID=your_auth0_client_id
3. VITE_AUTH0_AUDIENCE=your_auth0_api_identifier


Start the frontend:

bash
npm run dev


The frontend will normally run on:

http://localhost:5173

---

# Comfort Index

The application uses a custom Comfort Index ranging from **0 to 100**.

The score is calculated using four weather parameters:

* Temperature
* Humidity
* Wind Speed
* Cloudiness

## Formula

Each parameter is first converted into a score between 0 and 100.

### Temperature

The ideal temperature is defined as 22°C.


Temperature Score =
100 - |Temperature - 22| × 5


The result is clamped between 0 and 100.

Temperature has the largest influence on the final score because it is one of the most noticeable factors affecting perceived outdoor comfort.

### Humidity

The ideal humidity is defined as 50%.


Humidity Score =
100 - |Humidity - 50| × 2


Humidity is given a lower weight because people can still experience comfortable conditions across a relatively broad humidity range.

### Wind

Lower wind speeds are considered more comfortable for this metric.


Wind Score =
100 - Wind Speed × 15


The score is clamped between 0 and 100.

### Cloudiness

The metric considers approximately 30% cloudiness to be ideal.


Cloud Score =
100 - |Cloudiness - 30|


---

## Final Comfort Index

The individual scores are combined using weighted averaging:


Comfort Index =
Temperature × 0.40
+ Humidity × 0.25
+ Wind × 0.20
+ Cloudiness × 0.15


The final result is rounded to the nearest whole number.

### Weighting rationale

Temperature receives the highest weight because it has the strongest influence on general outdoor comfort.

Humidity receives the second-highest weight because high or low humidity can significantly affect how temperature feels.

Wind receives a moderate weight because strong winds can reduce comfort even when temperature conditions are otherwise suitable.

Cloudiness receives the lowest weight because cloud cover generally has a smaller direct effect on comfort compared with temperature, humidity, and wind.

This is a subjective comfort model rather than a scientific weather standard. The weights were chosen to provide a simple and explainable ranking system.

---

# Caching

The backend uses two separate in-memory caches.

## Raw Weather Cache

Raw weather information retrieved from OpenWeatherMap is stored for **5 minutes**.

If the raw cache is still valid, the application does not make new OpenWeatherMap requests.


Request
   ↓
Raw cache valid?
   ├── Yes → use cached raw data
   └── No → request OpenWeatherMap


## Processed Weather Cache

The processed weather data, including Comfort Index scores and rankings, is also cached for 5 minutes.


Request
   ↓
Processed cache valid?
   ├── Yes → return processed data
   └── No → process raw data


This prevents unnecessary processing and reduces external API requests.

## Cache Debug Endpoint

The application provides:


GET /api/cache


This endpoint displays the current status and age of both caches.

Example:

json
{
  "rawCache": {
    "status": "HIT",
    "ageInSeconds": 42
  },
  "processedCache": {
    "status": "HIT",
    "ageInSeconds": 15
  },
  "cacheDurationSeconds": 300
}


The endpoint was included to make the caching behaviour easier to verify and debug.

---

# Authentication and Authorization

Authentication is implemented using Auth0.

The weather API endpoint is protected using JWT authentication:


GET /api/weather


An authenticated access token must be provided in the request:


Authorization: Bearer <access-token>


The backend validates the token using Auth0 before allowing access to weather data.

Public signups are disabled so that users cannot freely create accounts.

MFA was also configured through Auth0 and can be enabled for the application when required.

---

# Frontend Features

## Responsive Design

The dashboard supports:

* Desktop
* Tablet
* Mobile

The weather cards automatically change their layout depending on screen width.

## Dark Mode

The dashboard supports switching between light and dark themes.

## Sorting

Weather results can be sorted by:

* Comfort Index
* Temperature
* City name

## Filtering

Users can filter cities by weather condition, such as:

* Clear
* Clouds
* Rain
* Drizzle
* Thunderstorm
* Snow

---

# Testing

The Comfort Index functions are tested using Jest.

Tests cover:

* Ideal temperature scoring
* Temperature score changes
* Ideal humidity scoring
* Wind score behaviour
* Ideal cloudiness scoring
* Comfort Index range
* High score under ideal conditions

Run the tests from the backend directory:

bash
npm test


Expected result:

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total


---

# Known Limitations

* Weather data is cached in server memory, so the cache is cleared whenever the backend server restarts.
* The caching implementation is suitable for this assignment but would need a shared cache such as Redis for a multi-instance production deployment.
* The Comfort Index is a custom heuristic and is not intended to represent an official meteorological comfort measurement.
* The application currently retrieves current weather conditions rather than historical or forecast data.
* MFA depends on the Auth0 configuration and available verification method.
----
# Author
Sanjeeban Niranjankumar
