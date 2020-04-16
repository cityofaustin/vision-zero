import React, { useState, useRef } from "react";
import { Editor, EditorModes } from "react-map-gl-draw";
import { getFeatureStyle, getEditHandleStyle } from "./map-style";
import { stringify as stringifyGeoJSON } from "wellknown";

const MapPolygonFilter = ({ setMapPolygon }) => {
  const _editorRef = useRef();

  const [mode, setMode] = useState(EditorModes.READ_ONLY);

  const _onUpdate = ({ editType }) => {
    if (editType === "addFeature") {
      const features = _editorRef.current.getFeatures();

      // Limit to one polygon
      const indexesToDelete = [...features.keys()].filter((i) => i !== 0);
      _editorRef.current.deleteFeatures(indexesToDelete);

      // Convert polygon to Well-Known Text format
      const feature = stringifyGeoJSON(features[0]);
      setMapPolygon(feature);
      setMode(EditorModes.READ_ONLY);
    }
  };

  const _onDelete = () => {
    // If a polygon is exists in editor features, delete it
    const features = _editorRef.current.getFeatures();
    if (features.length > 0) {
      _editorRef.current.deleteFeatures(0);
    }
    // Remove filter from Socrata query
    setMapPolygon(null);
  };

  const _renderDrawTools = () => {
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
      {/* TODO: Pass this function down to MapPolygonFilter.js */}
      {_renderDrawTools()}
    </>
  );
};

export default MapPolygonFilter;
