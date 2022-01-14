const express = require('express');
const bodyParser = require("body-parser");
const https = require('https');
const cheerio = require("cheerio");
const fs = require('fs');
const $ = cheerio.load(fs.readFileSync(__dirname + '/index.html'));

const mySecret = process.env['weather_api_key'];
const baseWeatherURL = "https://api.openweathermap.org/data/2.5/weather?";

const app = express();
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post("/", (req, res) => {

  const city = req.body.city;
  const weatherURL = baseWeatherURL + "units=imperial" + "&q=" + city + "&appid=" + mySecret;
 
  const request = https.get(weatherURL, (response) => {
    console.log('status code: ', response.statusCode);

    if (response.statusCode === 404) {
      console.log("404 error");
      const content = "Not a valid city";
      $(".weather-icon").attr("src", "");
      $("p").text(content);
      res.send($.root().html());
    }

    else if (response.statusCode = 200) {
      response.on('data', (d) => {
      const weatherData = JSON.parse(d);
      const temp = Math.round(weatherData.main.temp);
      const feelsLike = Math.round(weatherData.main.feels_like);
      const description = weatherData.weather[0].description;
      const icon = weatherData.weather[0].icon;
      const imageURL = "http://openweathermap.org/img/wn/" + icon + "@2x.png";

      const content = "Right now in " + city.charAt(0).toUpperCase() + city.slice(1) + ", it's " + description + " with a current temperature of "+ temp + "F (feels like " + feelsLike + "F)"

      // res.write("<p>Right now in " + city + ", it's " + description + " with a current temperature of "+ temp + "F (feels like " + feelsLike + "F)</p>")
      // res.write("<img src =" + imageURL + ">");
      $("p").text(content);
      $(".weather-icon").attr("src", imageURL);
      res.send($.root().html());
      });
    }

  });

});

app.listen(3000, () => {
  console.log('server started');
});
