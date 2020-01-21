import React, { useState, useEffect } from "react";
import { StoreContext } from "../../utils/store";
import ReactMapGL, { Source, Layer } from "react-map-gl";
import { createMapDataUrl } from "./helpers";
import { crashDataLayer, asmpDataLayer } from "./map-style";
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
  const [overlay, setOverlay] = useState("");

  const {
    mapFilters: [filters],
    mapDateRange: [dateRange]
  } = React.useContext(StoreContext);

  useEffect(() => {
    const overlayUrl = `https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/TRANSPORTATION_asmp_street_network/FeatureServer/0/query?where=STREET_LEVEL%20%3E=%200&orderByFields=OBJECTID%20ASC&resultRecordCount=1000&resultOffset=0&outFields=*&f=geojson`;
    // TODO: Use viewport as parameter to query ArcGIS? Don't need to query all records for entire map at once
    // Url needs &outFields=* in query to get all metadata
    // Street Level >= 0 & orderByFields=OBJECTID ASC & 1000 results with 0 offset
    // https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/TRANSPORTATION_asmp_street_network/FeatureServer/0/query?where=STREET_LEVEL%20%3E=%200&orderByFields=OBJECTID%20ASC&resultRecordCount=1000&resultOffset=0&outFields=*&f=geojson
    // Paging through data https://github.com/koopjs/FeatureServer/issues/141
    axios.get(overlayUrl).then(res => {
      setOverlay(res.data);
    });
  }, []);

  // Fetch initial crash data and refetch upon filters change
  useEffect(() => {
    const apiUrl = createMapDataUrl(filters, dateRange);

    axios.get(apiUrl).then(res => {
      setMapData(res.data);
    });
  }, [filters, dateRange]);

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
    const { feature } = hoveredFeature;

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
      {/* {!!mapData && (
        <Source type="geojson" data={mapData}>
          <Layer {...crashDataLayer} />
        </Source>
      )} */}
      {!!overlay && (
        <Source type="geojson" data={overlay}>
          <Layer {...asmpDataLayer} />
        </Source>
      )}
      {hoveredFeature && _renderTooltip()}
    </ReactMapGL>
  );
};

export default Map;
