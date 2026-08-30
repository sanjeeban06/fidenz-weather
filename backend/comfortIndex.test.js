const {
    temperatureScore,
    humidityScore,
    windScore,
    cloudScore,
    calculateComfortIndex
} = require("./comfortIndex");


test("temperature score should be 100 at 22°C", () => {
    expect(temperatureScore(22)).toBe(100);
});


test("temperature score should decrease away from 22°C", () => {
    expect(temperatureScore(30)).toBeLessThan(100);
});


test("humidity score should be 100 at 50%", () => {
    expect(humidityScore(50)).toBe(100);
});


test("wind score should decrease as wind speed increases", () => {
    expect(windScore(5)).toBeLessThan(windScore(2));
});


test("cloud score should be 100 at 30% cloudiness", () => {
    expect(cloudScore(30)).toBe(100);
});


test("comfort index should return a score between 0 and 100", () => {

    const score = calculateComfortIndex(
        22,
        50,
        2,
        30
    );

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
});


test("ideal weather conditions should produce a high comfort score", () => {

    const score = calculateComfortIndex(
        22,
        50,
        0,
        30
    );

    expect(score).toBeGreaterThan(90);
});