import React, { Component } from "react";
import MapGL, {
  Marker,
  NavigationControl,
  FullscreenControl,
} from "react-map-gl";
import Geocoder from "react-map-gl-geocoder";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";

import {
  Button,
  ButtonGroup,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
} from "reactstrap";

// import ControlPanel from "./control-panel";
import Pin from "./Pin";
import { setPinColor } from "../../../styles/mapPinStyles";
import { CrashQALatLonFrom } from "./CrashQALatLonForm";

const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

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

export default class CrashQAMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: 30.26714,
        longitude: -97.743192,
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

  _handleMapStyleChange = e => {
    const style = e.target.id;
    // Set pin color based on map layer for visibility
    const pinColor = setPinColor(style);
    this.setState({ mapStyle: style, pinColor });
  };

  getCursor = ({ isDragging }) => {
    isDragging !== this.state.isDragging && this.setState({ isDragging });
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
          {/* TODO: use reported street name as initial address */}
          <Geocoder
            mapRef={this.mapRef}
            onViewportChange={this._handleViewportChange}
            mapboxApiAccessToken={TOKEN}
          />
          <div className="fullscreen" style={fullscreenControlStyle}>
            <FullscreenControl />
          </div>
          <div className="nav" style={navStyle}>
            <NavigationControl showCompass={false} />
          </div>
          <Marker latitude={markerLatitude} longitude={markerLongitude}>
            <Pin size={40} color={pinColor} isDragging={isDragging} />
          </Marker>
          <ButtonGroup className="float-right mt-5 mr-2">
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
              onClick={this._handleMapStyleChange}
              color="light"
            >
              Street
            </Button>
          </ButtonGroup>
        </MapGL>
        {/* Records to update on submit qa status #3 (Crash status table), lat/lon confirmed, geocode source #5 (Geocoder table)*/}
        <CrashQALatLonFrom
          latitude={markerLatitude}
          longitude={markerLongitude}
        />
      </div>
    );
  }
}
