import React, { useState, useEffect } from "react";
import ReactMapGL from "react-map-gl";
import axios from "axios";

import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = `pk.eyJ1Ijoiam9obmNsYXJ5IiwiYSI6ImNrM29wNnB3dDAwcXEzY29zMTU5bWkzOWgifQ.KKvoz6s4NKNHkFVSnGZonw`;
const apiUrl = "https://data.austintexas.gov/resource/y2wy-tgr5.json";

const Map = () => {
  const [viewport, setViewport] = useState({
    latitude: 30.268039,
    longitude: -97.742828,
    zoom: 11
  });
  const [mapData, setMapData] = useState({});

  useEffect(() => {
    axios.get(apiUrl).then(res => {
      setMapData(res.data);
    });
  }, []);

  const _onViewportChange = viewport => setViewport(viewport);

  return (
    <ReactMapGL
      width="900px"
      height="600px"
      {...viewport}
      onViewportChange={_onViewportChange}
      mapboxApiAccessToken={MAPBOX_TOKEN}
    />
  );
};

export default Map;
