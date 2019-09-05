import React, { Component } from "react";
import { withApollo } from "react-apollo";
import { UPDATE_COORDS } from "../../../queries/crashes";

import MapGL, {
  Marker,
  NavigationControl,
  FullscreenControl,
} from "react-map-gl";
import Geocoder from "react-map-gl-geocoder";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import styled from "styled-components";

import { Button, ButtonGroup } from "reactstrap";

// TODO maybe use Control Panel to show address info in Full Screen mode?
// import ControlPanel from "./control-panel";
import Pin from "./Pin";
import { setPinColor } from "../../../styles/mapPinStyles";
import { CrashQALatLonFrom } from "./CrashQALatLonForm";

const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const MapStyleSelector = styled.div`
  margin-top: 55px;
  margin-right: 10px;
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

// Default map center
const initialMapCenter = { latitude: 30.26714, longitude: -97.743192 };

class CrashQAMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: initialMapCenter.latitude,
        longitude: initialMapCenter.longitude,
        zoom: 17,
        bearing: 0,
        pitch: 0,
      },
      popupInfo: null,
      markerLatitude: 0,
      markerLongitude: 0,
      mapStyle: "satellite-streets",
      pinColor: "warning",
      isDragging: false,
    };
  }

  // Tie map and geocoder control together
  mapRef = React.createRef();

  _handleViewportChange = viewport => {
    this.setState({
      viewport: { ...this.state.viewport, ...viewport },
    });
  };

  _updateViewport = viewport => {
    this.setState({
      viewport,
      markerLatitude: viewport.latitude,
      markerLongitude: viewport.longitude,
    });
  };

  handleMapStyleChange = e => {
    const style = e.target.id;
    // Set pin color based on map layer for visibility
    const pinColor = setPinColor(style);
    this.setState({ mapStyle: style, pinColor });
  };

  getCursor = ({ isDragging }) => {
    isDragging !== this.state.isDragging && this.setState({ isDragging });
  };

  handleMapFormSubmit = e => {
    e.preventDefault();

    const variables = {
      qaStatus: 3, // Lat/Long entered manually to Primary
      geocodeProvider: 5, // Manual Q/A
      crashId: this.props.crashId,
      latitude: this.state.markerLatitude,
      longitude: this.state.markerLongitude,
    };
    this.props.client
      .mutate({
        mutation: UPDATE_COORDS,
        variables: variables,
      })
      .then(res => {
        console.log(res);
        this.props.refetchCrashData();
      });
  };

  handleMapFormReset = e => {
    e.preventDefault();
    const updatedViewport = {
      ...this.state.viewport,
      latitude: initialMapCenter.latitude,
      longitude: initialMapCenter.longitude,
    };
    this.setState({
      viewport: updatedViewport,
      markerLatitude: updatedViewport.latitude,
      markerLongitude: updatedViewport.longitude,
    });
  };

  render() {
    const {
      viewport,
      mapStyle,
      markerLatitude,
      markerLongitude,
      pinColor,
      isDragging,
    } = this.state;
    const geocoderAddress = this.props.mapGeocoderAddress;

    return (
      <div>
        <MapGL
          {...viewport}
          ref={this.mapRef}
          width="100%"
          height="350px"
          mapStyle={`mapbox://styles/mapbox/${mapStyle}-v9`}
          onViewportChange={this._updateViewport}
          getCursor={this.getCursor}
          mapboxApiAccessToken={TOKEN}
        >
          <Geocoder
            mapRef={this.mapRef}
            onViewportChange={this._handleViewportChange}
            mapboxApiAccessToken={TOKEN}
            inputValue={geocoderAddress}
            options={{ flyTo: false }}
            // Bounding box for auto-populated results in the search bar
            bbox={[-98.22464, 29.959694, -97.226257, 30.687526]}
          />
          <div className="fullscreen" style={fullscreenControlStyle}>
            <FullscreenControl />
          </div>
          <div className="nav" style={navStyle}>
            <NavigationControl showCompass={false} />
          </div>
          <Marker latitude={markerLatitude} longitude={markerLongitude}>
            <Pin size={40} color={pinColor} isDragging={isDragging} animated />
          </Marker>
          <MapStyleSelector>
            <ButtonGroup className="float-right">
              <Button
                active={mapStyle === "satellite-streets"}
                id="satellite-streets"
                onClick={this._handleMapStyleChange}
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
            </ButtonGroup>
          </MapStyleSelector>
        </MapGL>
        <CrashQALatLonFrom
          latitude={markerLatitude}
          longitude={markerLongitude}
          handleFormSubmit={this.handleMapFormSubmit}
          handleFormReset={this.handleMapFormReset}
        />
      </div>
    );
  }
}

export default withApollo(CrashQAMap);
