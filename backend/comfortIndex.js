function temperatureScore(temp) {
    const score = 100 - Math.abs(temp - 22) * 5;
    return Math.max(0, Math.min(100, score));
}

function humidityScore(humidity) {
    const score = 100 - Math.abs(humidity - 50) * 2;
    return Math.max(0, Math.min(100, score));
}

function windScore(windspeed) {
    const score = 100 - windspeed * 15;
    return Math.max(0, Math.min(100, score));
}

function cloudScore(cloudiness) {
    const score = 100 - Math.abs(cloudiness - 30);
    return Math.max(0, Math.min(100, score));
}

function calculateComfortIndex(temp, humidity, windspeed, cloudiness) {

    const tempPoints = temperatureScore(temp);
    const humidPoints = humidityScore(humidity);
    const windsPoints = windScore(windspeed);
    const cloudPoints = cloudScore(cloudiness);

    const finalScore =
        tempPoints * 0.4 +
        humidPoints * 0.25 +
        windsPoints * 0.2 +
        cloudPoints * 0.15;

    return Math.round(finalScore);
}

module.exports = {
    temperatureScore,
    humidityScore,
    windScore,
    cloudScore,
    calculateComfortIndex
};