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


git clone https://github.com/sanjeeban06/fidenz-weather.git
cd fidenz-weather


## 2. Backend setup


cd backend
npm install


Create a .env file:

env:

1. OPENWEATHER_API_KEYopenweathermap_api_key
2. AUTH0_DOMAIN=auth0_domain
3. AUTH0_AUDIENCE=auth0_api_identifier


Start the backend:

node server.js


The backend runs on:

http://localhost:3000

---

## 3. Frontend setup

Open another terminal:


cd frontend
npm install


Create a `.env` file:

env:

1. VITE_AUTH0_DOMAIN=auth0_domain
2. VITE_AUTH0_CLIENT_ID=auth0_client_id
3. VITE_AUTH0_AUDIENCE=auth0_api_identifier


Start the frontend:


npm run dev


The frontend will normally run on:

http://localhost:5173

## 4. Test User

A test user is provided for reviewing the application:

Email: careers@fidenz.com
Password: Pass#fidenz

The test user is configured in Auth0 and has a verified email address.

# Multi-Factor Authentication

Multi-factor authentication is configured through Auth0 and is required for users when signing in.

The MFA policy is configured as Always, meaning users are required to provide an additional authentication factor after successfully entering their primary credentials.

The following MFA factors are enabled in Auth0:

One-time Password (OTP) using an authenticator application
Email verification code

The provided Fidenz test account (careers@fidenz.com) has a verified email address and is enrolled in Email MFA.

During authentication, Auth0 can require the user to complete the configured MFA challenge using the available enrolled verification method.

The test account is therefore configured to demonstrate the required email-based MFA flow without requiring the reviewer to create or configure a separate user.

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

+ Temperature × 0.40
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

The application uses two in-memory caches on the backend: one for the weather data received from OpenWeatherMap and another for the processed results.

The raw weather data is kept in the cache for 5 minutes. When a request is made, the backend first checks whether valid raw data is already available. If it is, the application uses that data instead of making another request to OpenWeatherMap. If the cache has expired, new weather data is requested and stored in the cache.

The processed weather data, including the Comfort Index scores and city rankings, is also cached for 5 minutes. This means that if the processed results are still available in the cache, the backend can return them directly without processing the weather data again.

This reduces the number of requests made to OpenWeatherMap and avoids repeating the same processing for every request.

## Cache Debug Endpoint

The application provides:


GET /api/cache

The application provides the following endpoint:

GET /api/cache

It shows the current status and age of the raw and processed caches. This was added to make it easier to check whether the cache is being used during testing.

---

# Authentication and Authorization

Authentication is implemented using Auth0.

The weather API endpoint is protected using JWT authentication:


GET /api/weather


An authenticated access token must be provided in the request:


Authorization: Bearer <access-token>


The backend validates the token using Auth0 before allowing access to weather data.

Public signups are disabled so that users cannot freely create accounts.

# Multi-Factor Authentication

Multi-factor authentication is configured through Auth0 and is required for users when signing in.

The MFA policy is configured as Always, meaning an additional authentication factor is required after the user's primary credentials are successfully authenticated.

The application has the following MFA factors enabled:

One-time Password (OTP) using an authenticator application
Email verification code

The user initially enrolls an authenticator application by scanning the QR code provided by Auth0. On subsequent logins, the user can authenticate using the enrolled authenticator factor or an available email verification method.

This provides an additional layer of security beyond the user's email address and password.

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
* Authentication and MFA rely on the availability of the configured Auth0 tenant.
----
# Author
Sanjeeban Niranjankumar
