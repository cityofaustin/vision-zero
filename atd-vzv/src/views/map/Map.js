import React, { useState, useEffect, useRef } from "react";
import { StoreContext } from "../../utils/store";
import ReactMapGL, { Source, Layer, Popup } from "react-map-gl";
import MapControls from "./MapControls";
import MapPolygonFilter from "./MapPolygonFilter";
import CrashPointInfo from "./CrashPointInfo";
import { createMapDataUrl } from "./helpers";
import { crashGeoJSONEndpointUrl } from "../../views/summary/queries/socrataQueries";
import {
  baseSourceAndLayer,
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
  const [clickedFeature, setClickedFeature] = useState(null);
  const [cityCouncilOverlay, setCityCouncilOverlay] = useState(null);
  const [isMapDataLoading, setIsMapDataLoading] = useState(false);

  const {
    mapFilters: [filters],
    mapFilterType: [isMapTypeSet],
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
    // Sort crash data into fatality and injury subsets
    const sortMapData = (data) => {
      return data.features.reduce(
        (acc, feature) => {
          if (parseInt(feature.properties.sus_serious_injry_cnt) > 0) {
            acc.injuries.features.push(feature);
          }
          if (parseInt(feature.properties.death_cnt) > 0) {
            acc.fatalities.features.push(feature);
          }
          return acc;
        },
        {
          fatalities: { ...data, features: [] },
          injuries: { ...data, features: [] },
        }
      );
    };

    const apiUrl = createMapDataUrl(
      crashGeoJSONEndpointUrl,
      filters,
      dateRange,
      mapPolygon,
      mapTimeWindow
    );

    !!apiUrl &&
      axios.get(apiUrl).then((res) => {
        const sortedMapData = sortMapData(res.data);

        setMapData(sortedMapData);
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

  const _getCursor = ({ isDragging }) => (isDragging ? "grab" : "default");

  const _onClickCrashPoint = (event) => {
    const {
      features,
      srcEvent: { offsetX, offsetY },
    } = event;
    const clickedFeature =
      features &&
      features.find(
        (f) => f.layer.id === "fatalities" || f.layer.id === "seriousInjuries"
      );

    clickedFeature(clickedFeature);
  };

  // TODO: Add pointer hand on hover
  // TODO: Add Socrata link to crash ID
  // TODO: Improve styling of popup (padding so text doesn't overlap close button)
  const _renderPopup = () => {
    const popupInfo = clickedFeature;

    return (
      popupInfo && (
        <Popup
          tipSize={5}
          anchor="top"
          longitude={parseFloat(popupInfo.properties.longitude)}
          latitude={parseFloat(popupInfo.properties.latitude)}
          closeOnClick={false}
          onClose={() => setHoveredFeature(null)}
        >
          <CrashPointInfo info={popupInfo.properties} />
        </Popup>
      )
    );
  };

  const renderCrashDataLayers = () => {
    // Layer order depends on order set, so render both layers together to keep fatalities on top
    const fatalityLayer = (
      <Source id="crashFatalities" type="geojson" data={mapData.fatalities}>
        <Layer {...fatalitiesOutlineDataLayer} />
        <Layer {...fatalitiesDataLayer} />
      </Source>
    );
    const injuryLayer = (
      <Source id="crashInjuries" type="geojson" data={mapData.injuries}>
        <Layer {...seriousInjuriesOutlineDataLayer} />
        <Layer {...seriousInjuriesDataLayer} />
      </Source>
    );
    const bothLayers = (
      <>
        {injuryLayer}
        {fatalityLayer}
      </>
    );
    return (
      (isMapTypeSet.fatal && isMapTypeSet.injury && bothLayers) ||
      (isMapTypeSet.fatal && fatalityLayer) ||
      (isMapTypeSet.injury && injuryLayer)
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
      // onHover={_onHover}
      onClick={_onClickCrashPoint}
      ref={(ref) => (mapRef.current = ref && ref.getMap())}
    >
      {/* Provide empty source and layer as target for beforeId params to set order of layers */}
      {baseSourceAndLayer}
      {/* Crash Data Points */}
      {!!mapData && renderCrashDataLayers()}
      {/* ASMP Street Level Layers */}
      {buildAsmpLayers(asmpConfig, overlay)}
      {/* High Injury Network Layer */}
      {buildHighInjuryLayer(overlay)}
      {!!cityCouncilOverlay && overlay.name === "cityCouncil" && (
        <Source type="geojson" data={cityCouncilOverlay}>
          {/* Add beforeId to render beneath crash points */}
          <Layer beforeId="base-layer" {...cityCouncilDataLayer} />
        </Source>
      )}
      {/* Render crash point tooltips */}
      {clickedFeature && _renderPopup()}
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
      <MapControls setViewport={setViewport} />
      <MapPolygonFilter setMapPolygon={setMapPolygon} />
    </ReactMapGL>
  );
};

export default Map;
