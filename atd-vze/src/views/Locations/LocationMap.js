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

class LocationMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // map
      viewport: DEFAULT_VIEWPORT,
      // editor
      selectedMode: EditorModes.READ_ONLY,
      features: [],
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
    this.setState({
      selectedFeatureIndex: selected && selected.selectedFeatureIndex,
    });
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
          mode={selectedMode}
        />
        {this._renderToolbar()}
      </MapGL>
    );
  }
}

export default LocationMap;
