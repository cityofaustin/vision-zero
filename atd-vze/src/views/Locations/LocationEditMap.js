import React, { Component } from "react";
import MapGL, { NavigationControl, FullscreenControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Editor, EditorModes } from "react-map-gl-draw";
import { withApollo } from "react-apollo";
import styled from "styled-components";

import Toolbar from "./toolbar";
import { Button, ButtonGroup } from "reactstrap";
import { UPDATE_LOCATION_POLYGON } from "../../queries/Locations";

const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const MapStyleSelector = styled.div`
  top: 24px;
  right: 24px;
  position: absolute;
`;

const fullscreenControlStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  padding: "10px",
};

const navStyle = {
  position: "absolute",
  top: 36,
  left: 0,
  padding: "10px",
};

class LocationEditMap extends Component {
  constructor(props) {
    super(props);
    this.polygon = this.props.data.atd_txdot_locations[0];
    this.state = {
      // map
      viewport: {
        width: 800,
        height: 600,
        longitude: this.polygon.longitude,
        latitude: this.polygon.latitude,
        zoom: 17,
      }, // editor
      selectedMode: EditorModes.READ_ONLY,
      selectedFeatureIndex: null,
      isFeatureAdded: false,
      mapStyle: "light",
      isSubmitting: false,
    };
    this._mapRef = null;
    this._editorRef = null;
    // Format existing polygon as GeoJSON to render in editor
    this.featureGeoJson = [
      {
        type: "Feature",
        properties: {
          renderType: this.polygon.shape.type,
          id: this.polygon.location_id,
        },
        geometry: {
          coordinates: this.polygon.shape.coordinates,
          type: this.polygon.shape.type,
        },
      },
    ];
  }

  _switchMode = evt => {
    // Switch editing mode
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
        onReset={this._onReset}
        onDelete={this._onDelete}
        onSubmit={this.handleEditSubmit}
        isSubmitting={this.state.isSubmitting}
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

  onUpdate = (features, editType, editContext) => {
    // Does not fire on polygon drag and drop...
  };

  _onReset = () => {
    // Delete the first feature (index 0) of features array
    this._editorRef.deleteFeatures(0);
    this.addFeatureDelay();
  };

  _onDelete = () => {
    const { selectedFeatureIndex } = this.state;
    if (selectedFeatureIndex === null || selectedFeatureIndex === undefined) {
      return;
    }

    this._editorRef.deleteFeatures(selectedFeatureIndex);
  };

  addFeatureDelay = () => {
    // Delay addition of feature to happen after map renders
    setTimeout(() => {
      this._editorRef.addFeatures(this.featureGeoJson);
    }, 500);
  };

  handleMapStyleChange = e => {
    const style = e.target.id;
    this.setState({ mapStyle: style });
  };

  handleEditSubmit = e => {
    // Get first feature in features array and submit to DB
    e.preventDefault();
    const feature = this._editorRef.getFeatures();
    const featureDataForEditSubmit = feature[0].geometry;
    const featureId = this.polygon.location_id;
    this.setState({ isSubmitting: true });
    this.props.client
      .mutate({
        mutation: UPDATE_LOCATION_POLYGON,
        variables: {
          locationId: featureId,
          updatedPolygon: featureDataForEditSubmit,
        },
      })
      .then(res => {
        this.props.refetch();
        this.setState({ isSubmitting: false });
      });
  };

  componentDidMount() {
    // Prevent existing feature from being added on each render
    !this.state.isFeatureAdded &&
      this.setState({ isFeatureAdded: true }, () => {
        this.addFeatureDelay();
        this.setState({ selectedMode: EditorModes.EDITING });
      });
  }

  render() {
    const { viewport, selectedMode, mapStyle } = this.state;

    return (
      <MapGL
        {...viewport}
        ref={_ => (this._mapRef = _)}
        width="100%"
        height="500px"
        mapStyle={`mapbox://styles/mapbox/${mapStyle}-v9`}
        onViewportChange={this._updateViewport}
        mapboxApiAccessToken={TOKEN}
      >
        <MapStyleSelector>
          <ButtonGroup className="float-right">
            <Button
              active={mapStyle === "satellite-streets"}
              id="satellite-streets"
              onClick={this.handleMapStyleChange}
              color="light"
            >
              Satellite
            </Button>
            <Button
              active={mapStyle === "streets"}
              id="streets"
              onClick={this.handleMapStyleChange}
              color="light"
            >
              Street
            </Button>
            <Button
              active={mapStyle === "light"}
              id="light"
              onClick={this.handleMapStyleChange}
              color="light"
            >
              Light
            </Button>
          </ButtonGroup>
        </MapStyleSelector>
        <div className="fullscreen" style={fullscreenControlStyle}>
          <FullscreenControl />
        </div>
        <div className="nav" style={navStyle}>
          <NavigationControl showCompass={false} />
        </div>
        <Editor
          ref={_ => (this._editorRef = _)}
          clickRadius={12}
          onSelect={this._onSelect}
          mode={selectedMode}
          onUpdate={this.onUpdate}
          onDrag={() => {
            return;
          }}
        />
            
        {this._renderToolbar()}
          
      </MapGL>
    );
  }
}

export default withApollo(LocationEditMap);
