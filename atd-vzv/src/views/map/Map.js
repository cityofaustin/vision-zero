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

  const {
    mapFilters: [filters],
    mapDateRange: [dateRange],
    mapOverlay: [overlay]
  } = React.useContext(StoreContext);

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
      features && features.find(f => f.layer.id === "crashes");
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

  const asmp5Layer = {
    id: "asmp_street_network/5",
    type: "line",
    source: {
      type: "vector",
      tiles: [
        "https://tiles.arcgis.com/tiles/0L95CJ0VTaxqcmED/arcgis/rest/services/ASMP_Streets_VectorTile/VectorTileServer/tile/{z}/{y}/{x}.pbf"
      ]
    },
    "source-layer": "asmp_street_network",
    filter: ["==", "_symbol", 4],
    layout: {
      "line-cap": "round",
      "line-join": "round",
      visibility: `${overlay === "asmp" ? "visible" : "none"}`
    },
    paint: {
      "line-color": "#1B519D",
      "line-width": 2
    }
  };

  const asmp4Layer = {
    id: "asmp_street_network/4",
    type: "line",
    source: {
      type: "vector",
      tiles: [
        "https://tiles.arcgis.com/tiles/0L95CJ0VTaxqcmED/arcgis/rest/services/ASMP_Streets_VectorTile/VectorTileServer/tile/{z}/{y}/{x}.pbf"
      ]
    },
    "source-layer": "asmp_street_network",
    filter: ["==", "_symbol", 3],
    layout: {
      "line-cap": "round",
      "line-join": "round",
      visibility: `${overlay === "asmp" ? "visible" : "none"}`
    },
    paint: {
      "line-color": "#A50F15",
      "line-width": 2
    }
  };

  const asmp3Layer = {
    id: "asmp_street_network/3",
    type: "line",
    source: {
      type: "vector",
      tiles: [
        "https://tiles.arcgis.com/tiles/0L95CJ0VTaxqcmED/arcgis/rest/services/ASMP_Streets_VectorTile/VectorTileServer/tile/{z}/{y}/{x}.pbf"
      ]
    },
    "source-layer": "asmp_street_network",
    filter: ["==", "_symbol", 2],
    layout: {
      "line-cap": "round",
      "line-join": "round",
      visibility: `${overlay === "asmp" ? "visible" : "none"}`
    },
    paint: {
      "line-color": "#E60000",
      "line-width": 2
    }
  };

  const asmp2Layer = {
    id: "asmp_street_network/2",
    type: "line",
    source: {
      type: "vector",
      tiles: [
        "https://tiles.arcgis.com/tiles/0L95CJ0VTaxqcmED/arcgis/rest/services/ASMP_Streets_VectorTile/VectorTileServer/tile/{z}/{y}/{x}.pbf"
      ]
    },
    "source-layer": "asmp_street_network",
    filter: ["==", "_symbol", 1],
    layout: {
      "line-cap": "round",
      "line-join": "round",
      visibility: `${overlay === "asmp" ? "visible" : "none"}`
    },
    paint: {
      "line-color": "#F66A4A",
      "line-width": 2
    }
  };

  const asmp1Layer = {
    id: "asmp_street_network/1",
    type: "line",
    source: {
      type: "vector",
      tiles: [
        "https://tiles.arcgis.com/tiles/0L95CJ0VTaxqcmED/arcgis/rest/services/ASMP_Streets_VectorTile/VectorTileServer/tile/{z}/{y}/{x}.pbf"
      ]
    },
    "source-layer": "asmp_street_network",
    filter: ["==", "_symbol", 0],
    layout: {
      "line-cap": "round",
      "line-join": "round",
      visibility: `${overlay === "asmp" ? "visible" : "none"}`
    },
    paint: {
      "line-color": "#F9AE91",
      "line-width": 2
    }
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
        <Source id="crashes" type="geojson" data={mapData}>
          <Layer {...crashDataLayer} />
        </Source>
      )}
      {/* ASMP Street Levels */}
      <Layer {...asmp5Layer} />
      <Layer {...asmp4Layer} />
      <Layer {...asmp3Layer} />
      <Layer {...asmp2Layer} />
      <Layer {...asmp1Layer} />
      {hoveredFeature && _renderTooltip()}
    </ReactMapGL>
  );
};

export default Map;
