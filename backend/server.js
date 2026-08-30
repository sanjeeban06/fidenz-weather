require("dotenv").config();

const { auth } = require("express-oauth2-jwt-bearer");
const express = require("express");
const axios = require("axios");
const fs = require("fs");
const cors = require("cors");

const app = express();

app.use(cors());

const {
    calculateComfortIndex
} = require("./comfortIndex");

const checkJwt = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
    tokenSigningAlg: "RS256"
});

const file = fs.readFileSync("cities.json", "utf8");
const data = JSON.parse(file);

let rawWeatherCache = null;
let rawCacheTimeStamp = null;

let processedWeatherCache = null;
let processedCacheTimeStamp = null;

const CACHE_DURATION = 5 * 60 * 1000;

async function getWeather() {

    // Check processed cache
    if (
        processedWeatherCache &&
        Date.now() - processedCacheTimeStamp < CACHE_DURATION
    ) {
        console.log("Processed Cache HIT");
        return processedWeatherCache;
    }

    console.log("Processed Cache MISS");

    let rawWeatherData;

    // Check raw cache
    if (
        rawWeatherCache &&
        Date.now() - rawCacheTimeStamp < CACHE_DURATION
    ) {
        console.log("Raw Cache HIT");
        rawWeatherData = rawWeatherCache;

    } else {

        console.log("Raw Cache MISS");

        rawWeatherData = [];

        for (const city of data.List) {

            const response = await axios.get(
                "https://api.openweathermap.org/data/2.5/weather",
                {
                    params: {
                        id: city.CityCode,
                        appid: process.env.OPENWEATHER_API_KEY
                    }
                }
            );

            rawWeatherData.push({
                city: city.CityName,
                temperature: response.data.main.temp,
                weather: response.data.weather[0].main,
                humidity: response.data.main.humidity,
                windspeed: response.data.wind.speed,
                cloudiness: response.data.clouds.all
            });
        }

        // Save raw API responses in cache
        rawWeatherCache = rawWeatherData;
        rawCacheTimeStamp = Date.now();
    }

    // Process raw weather data
    const weatherData = rawWeatherData.map(city => {

        const temperature = Number(
            (city.temperature - 273.15).toFixed(1)
        );

        const comfortScore = calculateComfortIndex(
            temperature,
            city.humidity,
            city.windspeed,
            city.cloudiness
        );

        return {
            city: city.city,
            temperature: temperature,
            weather: city.weather,
            humidity: city.humidity,
            windspeed: city.windspeed,
            cloudiness: city.cloudiness,
            comfortScore: comfortScore
        };
    });

    // Sort cities by Comfort Score
    weatherData.sort(
        (a, b) => b.comfortScore - a.comfortScore
    );

    // Assign ranks
    weatherData.forEach((city, index) => {
        city.rank = index + 1;
    });

    // Save processed data in cache
    processedWeatherCache = weatherData;
    processedCacheTimeStamp = Date.now();

    return weatherData;

}

app.get("/api/weather", checkJwt, async (req, res) => {
    try {
        const weather = await getWeather();
        res.json(weather);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch weather data"
        });
    }
});

app.get("/api/cache", (req, res) => {

    const now = Date.now();

    const rawCacheAge = rawCacheTimeStamp
        ? Math.floor((now - rawCacheTimeStamp) / 1000)
        : null;

    const processedCacheAge = processedCacheTimeStamp
        ? Math.floor((now - processedCacheTimeStamp) / 1000)
        : null;

    res.json({
        rawCache: {
            status:
                rawWeatherCache &&
                    rawCacheAge < CACHE_DURATION / 1000
                    ? "HIT"
                    : "MISS",
            ageInSeconds: rawCacheAge
        },

        processedCache: {
            status:
                processedWeatherCache &&
                    processedCacheAge < CACHE_DURATION / 1000
                    ? "HIT"
                    : "MISS",
            ageInSeconds: processedCacheAge
        },

        cacheDurationSeconds: CACHE_DURATION / 1000
    });

});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});