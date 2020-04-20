import React, { useState, useEffect, useRef } from "react";
import { StoreContext } from "../../utils/store";
import ReactMapGL, {
  Source,
  Layer,
  GeolocateControl,
  NavigationControl,
} from "react-map-gl";
import MapPolygonFilter from "./MapPolygonFilter";
import { createMapDataUrl } from "./helpers";
import { crashGeoJSONEndpointUrl } from "../../views/summary/queries/socrataQueries";
import {
  fatalitiesDataLayer,
  fatalitiesOutlineDataLayer,
  seriousInjuriesDataLayer,
  seriousInjuriesOutlineDataLayer,
  buildAsmpLayers,
  asmpConfig,
  buildHighInjuryLayer,
  cityCouncilDataLayer,
} from "./map-style";
import axios from "axios";

import { Card, CardBody, CardText } from "reactstrap";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompass, faCircle } from "@fortawesome/free-solid-svg-icons";
import { colors } from "../../constants/colors";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css"; // Get out-of-the-box icons

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

const StyledMapSpinner = styled.div`
  position: absolute;
  width: 0px;
  top: 50%;
  /* Adjust centering with half FA spinner width */
  left: calc(50% - 28px);
  transform: translate(-50%, -50%);

  .needle {
    animation-name: wiggle;
    animation-duration: 2500ms;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
  }

  @keyframes wiggle {
    0% {
      transform: rotate(0deg);
    }
    10% {
      transform: rotate(12deg);
    }
    40% {
      transform: rotate(-25deg);
    }
    60% {
      transform: rotate(20deg);
    }
    80% {
      transform: rotate(-15deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }
`;

const StyledMapNav = styled.div`
  .nav-buttons {
    position: absolute;
    top: 0px;
    right: 0px;
    padding: 10px;
  }

  .geolocate-button {
    position: absolute;
    top: 68px;
    right: 0px;
    padding: 10px;
  }

  .polygon-button {
    position: relative;
    top: 107px;
  }
`;

function useMapEventHandler(eventName, callback, mapRef) {
  useEffect(() => {
    const currentMapRef = mapRef.current;
    const mapDataListener = currentMapRef.on(eventName, function () {
      callback();
    });
    return () => {
      currentMapRef.off(eventName, mapDataListener);
    };
  }, [eventName, callback, mapRef]);
}

const Map = () => {
  // Set initial map config
  const [viewport, setViewport] = useState({
    latitude: 30.268039,
    longitude: -97.742828,
    zoom: 11,
  });

  // Create ref to map to call Mapbox GL functions on instance
  const mapRef = useRef();

  const [mapData, setMapData] = useState("");
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [cityCouncilOverlay, setCityCouncilOverlay] = useState(null);
  const [isMapDataLoading, setIsMapDataLoading] = useState(false);

  const {
    mapFilters: [filters],
    mapDateRange: dateRange,
    mapOverlay: [overlay],
    mapTimeWindow: [mapTimeWindow],
    mapPolygon: [mapPolygon, setMapPolygon],
  } = React.useContext(StoreContext);

  // Add/remove listeners for spinner logic
  useMapEventHandler("data", () => setIsMapDataLoading(true), mapRef);
  useMapEventHandler("idle", () => setIsMapDataLoading(false), mapRef);

  // Fetch initial crash data and refetch upon filters change
  useEffect(() => {
    const apiUrl = createMapDataUrl(
      crashGeoJSONEndpointUrl,
      filters,
      dateRange,
      mapPolygon,
      mapTimeWindow
    );

    !!apiUrl &&
      axios.get(apiUrl).then((res) => {
        setMapData(res.data);
      });
  }, [filters, dateRange, mapTimeWindow, mapPolygon, setMapData]);

  // Fetch City Council Districts geojson
  useEffect(() => {
    const overlayUrl = `https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/BOUNDARIES_single_member_districts/FeatureServer/0/query?where=COUNCIL_DISTRICT%20%3E=%200&f=geojson`;
    axios.get(overlayUrl).then((res) => {
      setCityCouncilOverlay(res.data);
    });
  }, []);

  const _onViewportChange = (viewport) => setViewport(viewport);

  const _onViewportGeolocate = (viewport) =>
    setViewport({ ...viewport, zoom: 15 });

  // Capture hovered feature to populate tooltip data
  const _onHover = (event) => {
    const {
      features,
      srcEvent: { offsetX, offsetY },
    } = event;
    const hoveredFeature =
      features &&
      features.find(
        (f) =>
          f.layer.id === "fatalities" ||
          "fatalitiesOutline" ||
          "seriousInjuries" ||
          "seriousInjuriesOutline"
      );
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
      ref={(ref) => (mapRef.current = ref && ref.getMap())}
    >
      {!!mapData && (
        <Source id="crashes" type="geojson" data={mapData}>
          <Layer {...seriousInjuriesOutlineDataLayer} />
          <Layer {...seriousInjuriesDataLayer} />
          <Layer {...fatalitiesOutlineDataLayer} />
          <Layer {...fatalitiesDataLayer} />
        </Source>
      )}
      {/* ASMP Street Level Layers */}
      {buildAsmpLayers(asmpConfig, overlay)}
      {/* High Injury Network Layer */}
      {buildHighInjuryLayer(overlay)}
      {!!cityCouncilOverlay && overlay.name === "cityCouncil" && (
        <Source type="geojson" data={cityCouncilOverlay}>
          {/* Add beforeId to render beneath crash points */}
          <Layer beforeId="crashes" {...cityCouncilDataLayer} />
        </Source>
      )}
      {/* Render crash point tooltips */}
      {hoveredFeature && _renderTooltip()}
      {/* Show spinner when map is updating */}
      {isMapDataLoading && (
        <StyledMapSpinner className="fa-layers fa-fw">
          <FontAwesomeIcon icon={faCircle} color={colors.infoDark} size="4x" />
          <FontAwesomeIcon
            className="needle"
            icon={faCompass}
            color={colors.dark}
            size="4x"
          />
        </StyledMapSpinner>
      )}

      <StyledMapNav>
        <div className="nav-buttons">
          <NavigationControl showCompass={false} />
        </div>
        <div className="geolocate-button">
          <GeolocateControl onViewportChange={_onViewportGeolocate} />
        </div>
        <div className="polygon-button">
          <MapPolygonFilter setMapPolygon={setMapPolygon} />
        </div>
      </StyledMapNav>
    </ReactMapGL>
  );
};

export default Map;
