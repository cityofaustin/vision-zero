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
  cityCouncilDataLayer,
} from "./map-style";
import axios from "axios";

import { Card, CardBody, CardText } from "reactstrap";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompass, faCircle } from "@fortawesome/free-solid-svg-icons";
import { colors } from "../../constants/colors";

import { Editor, EditorModes } from "react-map-gl-draw";
import ControlPanel from "./control-panel";
import { getFeatureStyle, getEditHandleStyle } from "./map-style";

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
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [cityCouncilOverlay, setCityCouncilOverlay] = useState(null);
  const [isMapDataLoading, setIsMapDataLoading] = useState(false);

  const {
    mapFilters: [filters],
    mapDateRange: [dateRange],
    mapOverlay: [overlay],
    mapTimeWindow: [mapTimeWindow],
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
      mapTimeWindow
    );

    !!apiUrl &&
      axios.get(apiUrl).then((res) => {
        setMapData(res.data);
      });
  }, [filters, dateRange, mapTimeWindow, setMapData]);

  // Fetch City Council Districts geojson
  useEffect(() => {
    const overlayUrl = `https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/BOUNDARIES_single_member_districts/FeatureServer/0/query?where=COUNCIL_DISTRICT%20%3E=%200&f=geojson`;
    axios.get(overlayUrl).then((res) => {
      setCityCouncilOverlay(res.data);
    });
  }, []);

  const _onViewportChange = (viewport) => setViewport(viewport);

  // Capture hovered feature to populate tooltip data
  const _onHover = (event) => {
    const {
      features,
      srcEvent: { offsetX, offsetY },
    } = event;
    const hoveredFeature =
      features && features.find((f) => f.layer.id === "crashes");
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

  // Polygon editor
  // TODO: Add other shapes to draw polygon (square, etc.)
  // TODO: Fix control icons (they don't render)
  // TODO: Move polygon editor code to another file
  // TODO: Update styles in map-style.js
  const _editorRef = useRef();

  const [mode, setMode] = useState(EditorModes.READ_ONLY);
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(null);

  const _onSelect = (options) => {
    setSelectedFeatureIndex(options && options.selectedFeatureIndex);
  };

  const _onDelete = () => {
    const selectedIndex = selectedFeatureIndex;
    if (selectedIndex !== null && selectedIndex >= 0) {
      _editorRef.current.deleteFeatures(selectedIndex);
    }
  };

  const _onUpdate = ({ editType }) => {
    if (editType === "addFeature") {
      const features = _editorRef.current.getFeatures();
      // TODO: Add polygon in features array to Socrata request
      setMode(EditorModes.EDITING);
    }
  };

  const _renderDrawTools = () => {
    // copy from mapbox
    return (
      <div className="mapboxgl-ctrl-top-right">
        <div className="mapboxgl-ctrl-group mapboxgl-ctrl">
          <button
            className="mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_polygon"
            title="Polygon tool"
            onClick={() => setMode(EditorModes.DRAW_POLYGON)}
          />
          <button
            className="mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_trash"
            title="Delete"
            onClick={_onDelete}
          />
        </div>
      </div>
    );
  };

  const _renderControlPanel = () => {
    const features = _editorRef.current && _editorRef.current.getFeatures();
    let featureIndex = selectedFeatureIndex;
    if (features && featureIndex === null) {
      featureIndex = features.length - 1;
    }
    const polygon = features && features.length ? features[featureIndex] : null;
    return (
      <ControlPanel
        // containerComponent={this.props.containerComponent}
        polygon={polygon}
      />
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

      <Editor
        ref={(ref) => (_editorRef.current = ref)}
        style={{ width: "100%", height: "100%" }}
        clickRadius={12}
        mode={mode}
        onSelect={_onSelect}
        onUpdate={_onUpdate}
        editHandleShape={"circle"}
        featureStyle={getFeatureStyle}
        editHandleStyle={getEditHandleStyle}
      />
      {_renderDrawTools()}
      {_renderControlPanel()}
    </ReactMapGL>
  );
};

export default Map;
