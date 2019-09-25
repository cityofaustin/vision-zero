import React, { Component } from "react";
import MapGL from "react-map-gl";
import { Editor, EditorModes } from "react-map-gl-draw";

import Toolbar from "./toolbar";

const DEFAULT_VIEWPORT = {
  width: 800,
  height: 600,
  longitude: -97.743192,
  latitude: 30.26714,
  zoom: 14,
};

const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const featuresObject = {
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-97.74458348751068, 30.263638090982525],
            [-97.74461299180984, 30.263494457605205],
            [-97.74470686912537, 30.26352920763512],
            [-97.74479001760483, 30.26337399073966],
            [-97.74466127157211, 30.26333924065481],
            [-97.74470418691635, 30.263209506896086],
            [-97.74454057216644, 30.263158540015407],
            [-97.74447083473206, 30.26329290718922],
            [-97.74432867765427, 30.263258157075697],
            [-97.74425357580185, 30.263413374154254],
            [-97.74441182613373, 30.26346665757242],
            [-97.74437427520752, 30.263582490990412],
            [-97.74458348751068, 30.263638090982525],
          ],
        ],
      },
    },
  ],
};

class LocationMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // map
      viewport: DEFAULT_VIEWPORT,
      // editor
      selectedMode: EditorModes.READ_ONLY,
      selectedFeatureIndex: null,
    };
    this._mapRef = null;
    this._editorRef = null;
  }

  _switchMode = evt => {
    const selectedMode = evt.target.id;
    this.setState({
      selectedMode:
        selectedMode === this.state.selectedMode ? null : selectedMode,
    });
  };

  _renderToolbar = () => {
    return (
      <Toolbar
        selectedMode={this.state.selectedMode}
        onSwitchMode={this._switchMode}
        onDelete={this._onDelete}
      />
    );
  };

  _updateViewport = viewport => {
    this.setState({ viewport });
  };

  _onSelect = selected => {
    // debugger;
    console.log(JSON.stringify(selected));
    this.setState({
      selectedFeatureIndex: selected && selected.selectedFeatureIndex,
    });
  };

  _onUpdate = () => {
    // Add logic to capture updated GeoJSON of polygon here
  };

  _onDelete = () => {
    const { selectedFeatureIndex } = this.state;
    if (selectedFeatureIndex === null || selectedFeatureIndex === undefined) {
      return;
    }

    this._editorRef.deleteFeatures(selectedFeatureIndex);
  };

  render() {
    const { viewport, selectedMode } = this.state;

    return (
      <MapGL
        {...viewport}
        ref={_ => (this._mapRef = _)}
        width="100%"
        height="500px"
        mapStyle={"mapbox://styles/mapbox/streets-v9"}
        onViewportChange={this._updateViewport}
        mapboxApiAccessToken={TOKEN}
      >
        <Editor
          ref={_ => (this._editorRef = _)}
          clickRadius={12}
          onSelect={this._onSelect}
          onUpdate={this._onUpdate}
          mode={selectedMode}
          //   features={featuresObject}
        />
        {this._renderToolbar()}
      </MapGL>
    );
  }
}

export default LocationMap;
