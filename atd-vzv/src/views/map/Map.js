import React, { useState, useEffect, useRef } from "react";
import { StoreContext } from "../../utils/store";
import ReactMapGL, { Source, Layer } from "react-map-gl";
import MapControls from "./MapControls";
import MapPolygonFilter from "./MapPolygonFilter";
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
import stripe from "./stripe.png";
import axios from "axios";

import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompass, faCircle } from "@fortawesome/free-solid-svg-icons";
import { colors } from "../../constants/colors";
import { useIsMobile } from "../../constants/responsive";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css"; // Get out-of-the-box icons
import MapInfoBox from "./MapInfoBox";

const MAPBOX_TOKEN = `pk.eyJ1Ijoiam9obmNsYXJ5IiwiYSI6ImNrM29wNnB3dDAwcXEzY29zMTU5bWkzOWgifQ.KKvoz6s4NKNHkFVSnGZonw`;

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

  const isMobile = useIsMobile();

  const [mapData, setMapData] = useState("");
  const [interactiveLayerIds, setInteractiveLayerIds] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
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
    const overlayUrl = `https://data.austintexas.gov/resource/7yq5-3tm4.geojson?$select=the_geom,council_district,council_district_path`;
    axios.get(overlayUrl).then((res) => {
      setCityCouncilOverlay(res.data);
    });

    // Add stripe pattern for overlay fill pattern
    mapRef.current.loadImage(stripe, function (err, image) {
      if (err) throw err;
      // Declare the image
      mapRef.current.addImage("stripe-pattern", image);
    });
  }, []);

  const _onViewportChange = (viewport) => setViewport(viewport);

  // Change cursor to grab when dragging map and pointer when hovering an interactive layer
  const _getCursor = ({ isHovering, isDragging }) =>
    isDragging ? "grab" : isHovering ? "pointer" : "default";

  // Set interactive layer IDs to allow cursor to change if isHovering
  useEffect(() => {
    const interactiveLayerIds = [
      isMapTypeSet.fatal && "fatalities",
      isMapTypeSet.injury && "seriousInjuries",
      cityCouncilOverlay && overlay.name === "cityCouncil" && "cityCouncil",
    ];

    const filteredInteractiveIds = interactiveLayerIds.filter((id) => !!id);
    setInteractiveLayerIds(filteredInteractiveIds);
  }, [isMapTypeSet, cityCouncilOverlay, overlay.name]);

  const _onSelectCrashPoint = (event) => {
    const { features } = event;
    // Filter feature to set in state and set hierarchy
    let selectedFeature =
      features &&
      features.find(
        (f) =>
          f.layer.id === "fatalities" ||
          f.layer.id === "seriousInjuries" ||
          "cityCouncil" ||
          null
      );

    // Supplement feature properties with lat/long to set popup coords if not in feature metadata
    if (!!selectedFeature && selectedFeature.layer.id === "cityCouncil") {
      selectedFeature = {
        ...selectedFeature,
        properties: {
          ...selectedFeature.properties,
          latitude: event.lngLat[1],
          longitude: event.lngLat[0],
        },
      };
    }

    setSelectedFeature(selectedFeature);
  };

  const renderCrashDataLayers = () => {
    // Layer order depends on order set, so set fatalities last to keep on top
    const injuryLayer = (
      <Source id="crashInjuries" type="geojson" data={mapData.injuries}>
        <Layer beforeId="road-label-sm" {...seriousInjuriesOutlineDataLayer} />
        <Layer beforeId="road-label-sm" {...seriousInjuriesDataLayer} />
      </Source>
    );
    const fatalityLayer = (
      <Source id="crashFatalities" type="geojson" data={mapData.fatalities}>
        <Layer beforeId="road-label-sm" {...fatalitiesOutlineDataLayer} />
        <Layer beforeId="road-label-sm" {...fatalitiesDataLayer} />
      </Source>
    );
    const bothLayers = (
      <>
        {injuryLayer}
        {fatalityLayer}
      </>
    );
    return bothLayers;
  };

  // Show/hide type layers based on isMapTypeSet state in Context
  useEffect(() => {
    const map = mapRef.current;

    const setLayersVisibility = (idArray, visibilityString) => {
      idArray.forEach((id) =>
        mapRef.current.setLayoutProperty(id, "visibility", visibilityString)
      );
    };

    if (map.getLayer("fatalities") && map.getLayer("fatalitiesOutline")) {
      const fatalityIds = ["fatalities", "fatalitiesOutline"];
      const fatalVisibility = isMapTypeSet.fatal ? "visible" : "none";
      setLayersVisibility(fatalityIds, fatalVisibility);
    }

    if (
      map.getLayer("seriousInjuries") &&
      map.getLayer("seriousInjuriesOutline")
    ) {
      const injuryIds = ["seriousInjuries", "seriousInjuriesOutline"];
      const injuryVisibility = isMapTypeSet.injury ? "visible" : "none";
      setLayersVisibility(injuryIds, injuryVisibility);
    }
  }, [isMapTypeSet]);

  return (
    <ReactMapGL
      {...viewport}
      width="100%"
      height="100%"
      onViewportChange={_onViewportChange}
      mapboxApiAccessToken={MAPBOX_TOKEN}
      getCursor={_getCursor}
      interactiveLayerIds={interactiveLayerIds}
      onHover={!isMobile ? _onSelectCrashPoint : null}
      onClick={isMobile ? _onSelectCrashPoint : null}
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
          <Layer beforeId="road-street" {...cityCouncilDataLayer} />
        </Source>
      )}
      {/* Render crash point tooltip */}
      {selectedFeature && (
        <MapInfoBox
          selectedFeature={selectedFeature}
          setSelectedFeature={setSelectedFeature}
          isMobile={isMobile}
          type={selectedFeature.layer.id}
        />
      )}
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
