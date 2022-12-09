import React from "react";
import axios from "axios";

const CrashWeather = ({ data }) => {

  const lat = data.atd_txdot_crashes[0].latitude_primary;
  const long = data.atd_txdot_crashes[0].longitude_primary;
  const crashTime = data.atd_txdot_crashes[0].crash_time;
  const crashHour = crashTime.slice(0, 2);
  const key = "UER6PG9X4YAD2H6C298FA55MC";

  const date = "2022-10-01";
  const endpoint = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/%20${lat}%2C${long}/${date}/${date}?unitGroup=metric&key=${key}&contentType=json`;

  const weatherData = () => {
    axios
      .get(endpoint, {
        headers: {},
      })
      .then(res => {
        console.log(res.data.days[0].hours[crashHour]);
      });
  };

  weatherData();

  return <div>weather</div>;
};

export default CrashWeather;
