import React, { useState, useEffect } from "react";
import ReactMapGL, { Source, Layer } from "react-map-gl";
import { dataLayer, heatmapLayer } from "./map-style";
import axios from "axios";
import { Card, CardBody, CardText } from "reactstrap";
import styled from "styled-components";

import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = `pk.eyJ1Ijoiam9obmNsYXJ5IiwiYSI6ImNrM29wNnB3dDAwcXEzY29zMTU5bWkzOWgifQ.KKvoz6s4NKNHkFVSnGZonw`;
const apiUrl =
  "https://data.austintexas.gov/resource/y2wy-tgr5.geojson?$limit=1000&$where=crash_date between '2019-01-01T00:00:00' and '2019-12-04T23:59:59'";

const StyledCard = styled.div`
  position: absolute;
  margin: 8px;
  padding: 2px;
  max-width: 300px;
  font-size: 12px !important;
  z-index: 9 !important;
  pointer-events: none;
`;

const Map = () => {
  // Set initial map config
  const [viewport, setViewport] = useState({
    latitude: 30.268039,
    longitude: -97.742828,
    zoom: 11
  });

  const [mapData, setMapData] = useState("");
  const [hoveredFeature, setHoveredFeature] = useState(null);

  // Fetch crash data and convert to GeoJSON
  useEffect(() => {
    axios.get(apiUrl).then(res => {
      debugger;
      //   createGeoJSON(res.data);
    });
  }, []);

  const _onViewportChange = viewport => setViewport(viewport);

  const _onHover = event => {
    const {
      features,
      srcEvent: { offsetX, offsetY }
    } = event;
    const hoveredFeature =
      features && features.find(f => f.layer.id === "data");
    setHoveredFeature({ feature: hoveredFeature, x: offsetX, y: offsetY });
  };

  const _renderTooltip = () => {
    const { feature, x, y } = hoveredFeature;
    return (
      feature && (
        <StyledCard>
          <Card>
            <CardBody>
              <CardText>Crash ID: {feature.properties.name}</CardText>
              <CardText>
                Fatality Count: {feature.properties.deathCount}
              </CardText>
              <CardText>Modes: {feature.properties.unitMode}</CardText>
              <CardText>Description: {feature.properties.unitDesc}</CardText>
            </CardBody>
          </Card>
        </StyledCard>
      )
    );
  };

  //   const createGeoJSON = data => {
  //     // Create features array
  //     const features = data.map(crash => {
  //       const latitude = crash.latitude ? parseFloat(crash.latitude) : 0;
  //       const longitude = crash.longitude ? parseFloat(crash.longitude) : 0;
  //       return {
  //         type: "Feature",
  //         geometry: {
  //           type: "Point",
  //           coordinates: [longitude, latitude]
  //         },
  //         properties: {
  //           name: crash.case_id,
  //           deathCount: parseInt(crash.death_cnt),
  //           unitMode: crash.unit_mode,
  //           unitDesc: crash.unit_desc
  //         }
  //       };
  //     });
  //
  //     // Remove points that are missing latitude and longitude
  //     const cleanedFeatures = features.filter(
  //       feature =>
  //         feature.geometry.coordinates[0] !== 0 &&
  //         feature.geometry.coordinates[1] !== 0
  //     );

  //     const featureCollection = {
  //       type: "FeatureCollection",
  //       features: cleanedFeatures
  //     };

  //     setMapData(featureCollection);
  //   };

  return (
    <ReactMapGL
      {...viewport}
      width="900px"
      height="600px"
      onViewportChange={_onViewportChange}
      mapboxApiAccessToken={MAPBOX_TOKEN}
      onHover={_onHover}
    >
      {!!mapData && (
        <Source type="geojson" data={mapData}>
          <Layer {...dataLayer} />
        </Source>
      )}
      {hoveredFeature && _renderTooltip()}
    </ReactMapGL>
  );
};

export default Map;
