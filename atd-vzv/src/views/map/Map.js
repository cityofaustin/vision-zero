import React, { useState, useEffect } from "react";
import { StoreContext } from "../../utils/store";
import ReactMapGL, { Source, Layer } from "react-map-gl";
import { dataLayer } from "./map-style";
import axios from "axios";
import { Card, CardBody, CardText } from "reactstrap";
import styled from "styled-components";

import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = `pk.eyJ1Ijoiam9obmNsYXJ5IiwiYSI6ImNrM29wNnB3dDAwcXEzY29zMTU5bWkzOWgifQ.KKvoz6s4NKNHkFVSnGZonw`;

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

  const {
    mapFilters: [filters]
  } = React.useContext(StoreContext);

  // Fetch crash data
  useEffect(() => {
    const apiUrl =
      "https://data.austintexas.gov/resource/y2wy-tgr5.geojson?$limit=1000&$where=crash_date between '2019-01-01T00:00:00' and '2019-12-04T23:59:59'";
    axios.get(apiUrl).then(res => {
      setMapData(res.data);
    });
  }, []);

  // Set map filters and fetch data
  useEffect(() => {
    const createMapDataUrl = filters => {
      let whereFilterString = "";
      filters.forEach(filter => {
        if (filter.type === "where") {
          whereFilterString += ` ${filter.operator} ${filter.syntax}`;
        }
      });
      const apiUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.geojson?$limit=1000&$where=crash_date between '2019-01-01T00:00:00' and '2019-12-07T23:59:59' ${whereFilterString}`;
      axios.get(apiUrl).then(res => {
        setMapData(res.data);
      });
    };

    createMapDataUrl(filters);
  }, [filters, setMapData]);

  const _onViewportChange = viewport => setViewport(viewport);

  // Capture hovered feature to populate tooltip data
  const _onHover = event => {
    const {
      features,
      srcEvent: { offsetX, offsetY }
    } = event;
    const hoveredFeature =
      features && features.find(f => f.layer.id === "data");
    setHoveredFeature({ feature: hoveredFeature, x: offsetX, y: offsetY });
  };

  const _getCursor = ({ isDragging }) => (isDragging ? "grab" : "default");

  // Show tooltip if hovering over a feature
  const _renderTooltip = () => {
    const { feature, x, y } = hoveredFeature;

    return (
      feature && (
        <StyledCard>
          <Card style={{ top: 10, left: 10 }}>
            <CardBody>
              <CardText>Crash ID: {feature.properties.crash_id}</CardText>
              <CardText>
                Fatality Count: {feature.properties.death_cnt}
              </CardText>
              <CardText>Modes: {feature.properties.unit_mode}</CardText>
              <CardText>Description: {feature.properties.unit_desc}</CardText>
            </CardBody>
          </Card>
        </StyledCard>
      )
    );
  };

  return (
    <ReactMapGL
      {...viewport}
      width="100%"
      height="100%"
      onViewportChange={_onViewportChange}
      mapboxApiAccessToken={MAPBOX_TOKEN}
      getCursor={_getCursor}
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
