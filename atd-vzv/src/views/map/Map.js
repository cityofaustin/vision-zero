import React, { useState, useEffect, useRef } from "react";
import { StoreContext } from "../../utils/store";
import ReactMapGL, { Source, Layer } from "react-map-gl";
import { createMapDataUrl } from "./helpers";
import { crashGeoJSONEndpointUrl } from "../../views/summary/queries/socrataQueries";
import {
  crashDataLayer,
  buildAsmpLayers,
  asmpConfig,
  buildHighInjuryLayer,
  cityCouncilDataLayer
} from "./map-style";
import axios from "axios";

import { Card, CardBody, CardText } from "reactstrap";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompass, faCircle } from "@fortawesome/free-solid-svg-icons";
import { colors } from "../../constants/colors";

import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = `pk.eyJ1Ijoiam9obmNsYXJ5IiwiYSI6ImNrM29wNnB3dDAwcXEzY29zMTU5bWkzOWgifQ.KKvoz6s4NKNHkFVSnGZonw`;

// TODO: Find reliable loading events for spinner
// TODO: If not, mock longer initial load with setTimeout
// TODO: Cover overlay changes with spinner logic
// TODO: Finish out second style of spinner
// TODO: 1. Spinner starts initial render because of mapRef.current.loaded()
// TODO: 2. Spinner stops because of onLoad() event handler
// TODO: 3. Spinner starts and stops when adding/removing overlay because of mapRed.current.loaded()
// TODO: 4. Spinner starts and stops in useEffect for map data (setTimeout 1000ms)

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
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  .needle {
    animation-name: waggle;
    animation-duration: 2500ms;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
  }

  @keyframes waggle {
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

const StyledMapSpinnerTwo = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  .compass {
    border: 2px solid ${colors.dark};
    display: block;
    width: 25px;
    height: 25px;
    border-radius: 100%;
    margin: 10% auto 0 auto;
  }

  .needle {
    width: 6px;
    margin: 12px auto 0 auto;
    animation-name: waggle;
    animation-duration: 2500ms;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
  }

  .needle:after {
    content: "";
    display: block;
    border-color: ${colors.chartRedOrange} transparent;
    border-style: solid;
    border-width: 0px 3px 10px 3px;
    margin-top: -15px;
  }

  .needle:before {
    content: "";
    display: block;
    border-color: ${colors.dark} transparent;
    border-style: solid;
    border-width: 10px 3px 0px 3px;
    margin-bottom: -20px;
  }

  @keyframes waggle {
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

const Map = () => {
  // Set initial map config
  const [viewport, setViewport] = useState({
    latitude: 30.268039,
    longitude: -97.742828,
    zoom: 11
  });
  const mapRef = useRef();

  const [mapData, setMapData] = useState("");
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [cityCouncilOverlay, setCityCouncilOverlay] = useState(null);
  const [isMapDataLoading, setIsMapDataLoading] = useState(false);
  const [hasMapInitialized, setHasMapInitialized] = useState(false);
  !!mapRef.current &&
    mapRef.current.on("data", function() {
      setIsMapDataLoading(true);
      console.log("Setting loading to true!");
    });

  !!mapRef.current && console.log(mapRef.current.areTilesLoaded());

  const {
    mapFilters: [filters],
    mapDateRange: [dateRange],
    mapOverlay: [overlay],
    mapTimeWindow: [mapTimeWindow]
  } = React.useContext(StoreContext);

  // Fetch initial crash data and refetch upon filters change
  useEffect(() => {
    const apiUrl = createMapDataUrl(
      crashGeoJSONEndpointUrl,
      filters,
      dateRange,
      mapTimeWindow
    );

    // setIsMapDataLoading(true);
    !!apiUrl &&
      axios.get(apiUrl).then(res => {
        setMapData(res.data);
        // Give the map some time to render after data has returned
        console.log("Turning off spinner in useEffect!");

        hasMapInitialized && setTimeout(() => setIsMapDataLoading(false), 2000);
      });

    // TODO Maybe call mapref.getMap() here to force one more render and stop spinner?
  }, [filters, dateRange, mapTimeWindow, setMapData, hasMapInitialized]);

  useEffect(() => {
    // Fetch City Council Districts geojson and return COUNCIL_DISTRICT metadata for styling in map-style.js
    const overlayUrl = `https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/BOUNDARIES_single_member_districts/FeatureServer/0/query?where=COUNCIL_DISTRICT%20%3E=%200&f=geojson`;
    axios.get(overlayUrl).then(res => {
      setCityCouncilOverlay(res.data);
    });
  }, []);

  // Show spinner on overlay change
  useEffect(() => {
    // if (overlay !== null) {
    //   setIsMapDataLoading(true);
    //   setTimeout(() => setIsMapDataLoading(false), 1000);
    // }
  }, [overlay]);

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

  // TODO Use this in combo with mapRef in order to turn off spinner onLoad
  const _onLoad = event => {
    // console.log(event);
    if (event.type === "load") {
      setIsMapDataLoading(false);
      setHasMapInitialized(true);
      console.log("Turning off spinner in onLoad!");
    }
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
      onLoad={_onLoad}
      ref={ref => (mapRef.current = ref && ref.getMap())}
    >
      {!!mapData && (
        <Source id="crashes" type="geojson" data={mapData}>
          <Layer {...crashDataLayer} />
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

      {/* Show spinner when mapData is loading */}
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

      {/* {isMapDataLoading && (
        <StyledMapSpinnerTwo>
          <div className="compass">
            <div className="needle"></div>
          </div>
        </StyledMapSpinnerTwo>
      )} */}
    </ReactMapGL>
  );
};

export default Map;
