import React, { useState, useRef } from "react";
import { Editor, EditorModes } from "react-map-gl-draw";
import { getFeatureStyle, getEditHandleStyle } from "./map-style";
import { stringify as stringifyGeoJSON } from "wellknown";
import styled from "styled-components";

const MapPolygonFilter = ({ setMapPolygon }) => {
  const _editorRef = useRef();
  const [mode, setMode] = useState(EditorModes.READ_ONLY);
  const [features, setFeatures] = useState([]);

  const StyledDrawTools = styled.div`
    .disabled {
      filter: opacity(0.3) drop-shadow(0 0 0 #fff);
      cursor: default;
    }

    /* Set below other map controls */
    .mapboxgl-ctrl-top-right {
      position: absolute;
      top: 107px;
    }
  `;

  const _onUpdate = ({ editType }) => {
    const newFeatures = _editorRef.current.getFeatures();
    setFeatures(newFeatures);

    if (editType === "addFeature") {
      // Convert polygon to Well-Known Text format
      const feature = stringifyGeoJSON(newFeatures[0]);
      setMapPolygon(feature);
      setMode(EditorModes.READ_ONLY);
    }
  };

  const _onDelete = () => {
    // If a polygon exists in Editor features, delete it
    if (features.length > 0) {
      _editorRef.current.deleteFeatures(0);
    }
    // Remove filter from Socrata query and reset state
    setMapPolygon(null);
    setFeatures([]);
  };

  const _renderDrawTools = () => {
    // Disable draw button click handler and grey out button if a polygon is drawn
    const isDisabled = features.length > 0;
    return (
      <StyledDrawTools>
        <div className="mapboxgl-ctrl-top-right">
          <div className="mapboxgl-ctrl-group mapboxgl-ctrl">
            <button
              className={`mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_polygon ${
                isDisabled && "disabled"
              }`}
              disabled={isDisabled}
              title="Draw a polygon to filter data"
              onClick={() => !isDisabled && setMode(EditorModes.DRAW_POLYGON)}
            />
            <button
              className="mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_trash"
              title="Remove polygon filter"
              onClick={_onDelete}
            />
          </div>
        </div>
      </StyledDrawTools>
    );
  };

  return (
    <>
      <Editor
        ref={(ref) => (_editorRef.current = ref)}
        style={{ width: "100%", height: "100%" }}
        clickRadius={12}
        mode={mode}
        onUpdate={_onUpdate}
        editHandleShape={"circle"}
        featureStyle={getFeatureStyle}
        editHandleStyle={getEditHandleStyle}
      />
      {_renderDrawTools()}
    </>
  );
};

export default MapPolygonFilter;
