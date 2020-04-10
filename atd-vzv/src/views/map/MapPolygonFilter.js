import React, { useState, useRef } from "react";
import { Editor, EditorModes } from "react-map-gl-draw";
import ControlPanel from "./control-panel";
import { getFeatureStyle, getEditHandleStyle } from "./map-style";

const MapPolygonFilter = () => {
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
      setMode(EditorModes.EDITING);
    }
  };

  const _renderDrawTools = () => {
    // copy from mapbox
    return (
      <div className="mapboxgl-ctrl-top-left">
        <div className="mapboxgl-ctrl-group mapboxgl-ctrl">
          <button
            className="mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_polygon"
            title="Polygon tool (p)"
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
        containerComponent={this.props.containerComponent}
        polygon={polygon}
      />
    );
  };

  return (
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
  );
};

export default MapPolygonFilter;
