import React, { Component } from "react";
import MapGL from "react-map-gl";
import { Editor, EditorModes } from "react-map-gl-draw";

import Toolbar from "./toolbar";

const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

class LocationMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // map
      viewport: {
        width: 800,
        height: 600,
        longitude: this.props.data.atd_txdot_locations[0].longitude,
        latitude: this.props.data.atd_txdot_locations[0].latitude,
        zoom: 17,
      }, // editor
      selectedMode: EditorModes.READ_ONLY,
      selectedFeatureIndex: null,
      isFeatureAdded: false,
    };
    this._mapRef = null;
    this._editorRef = null;
    this.featureGeoJson = [
      {
        type: "Feature",
        properties: {
          renderType: this.props.data.atd_txdot_locations[0].shape.type,
          id: this.props.data.atd_txdot_locations[0].unique_id,
        },
        geometry: {
          coordinates: this.props.data.atd_txdot_locations[0].shape.coordinates,
          type: this.props.data.atd_txdot_locations[0].shape.type,
        },
      },
    ];
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
    this.setState({
      selectedFeatureIndex: selected && selected.selectedFeatureIndex,
    });
  };

  _onUpdate = (features, editType, editContext) => {
    // TODO Add logic to capture updated GeoJSON of polygon here
    // debugger;
    console.log(features);
  };

  _onDelete = () => {
    const { selectedFeatureIndex } = this.state;
    if (selectedFeatureIndex === null || selectedFeatureIndex === undefined) {
      return;
    }

    this._editorRef.deleteFeatures(selectedFeatureIndex);
  };

  addFeatureDelay = () => {
    setTimeout(() => {
      this._editorRef.addFeatures(this.featureGeoJson);
      console.log(this._editorRef.getFeatures());
    }, 500);
  };

  componentDidMount() {
    !this.state.isFeatureAdded &&
      this.setState({ isFeatureAdded: true }, () => {
        this.addFeatureDelay();
        this.setState({ selectedMode: EditorModes.EDITING });
      });
  }

  render() {
    const { viewport, selectedMode } = this.state;

    return (
      <MapGL
        {...viewport}
        ref={_ => (this._mapRef = _)}
        width="100%"
        height="500px"
        mapStyle={"mapbox://styles/mapbox/light-v9"}
        onViewportChange={this._updateViewport} // selectedFeatureIndex={0}
        mapboxApiAccessToken={TOKEN}
      >
                
        <Editor
          ref={_ => (this._editorRef = _)}
          clickRadius={12}
          onSelect={this._onSelect}
          onUpdate={this._onUpdate}
          mode={selectedMode}
        />
                {this._renderToolbar()}
              
      </MapGL>
    );
  }
}

export default LocationMap;
