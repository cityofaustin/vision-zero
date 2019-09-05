import React, { Component } from "react";
import MapGL, {
  Marker,
  NavigationControl,
  FullscreenControl,
} from "react-map-gl";
import Geocoder from "react-map-gl-geocoder";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import styled from "styled-components";
import axios from "axios";

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

export default class CrashQAMap extends Component {
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

  _handleMapStyleChange = e => {
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
    // Records to update on submit qa status #3 (Crash status table), lat/lon confirmed, geocode source #5 (Geocoder table)
    // Sample GraphQL mutation
    // mutation {
    //   update_atd_txdot_crashes(where: {crash_id: {_eq: 17168817}}, _set: {qa_status: 3, geocode_provider: 5}){
    //     returning
    //   }
    // }
    axios({
      url: "https://vzd.austintexas.io/v1/graphql",
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer ", // Add JWT here
        "x-hasura-role": "editor",
      },
      data: {
        query: `
          mutation update_atd_txdot_crashes($crash_id: Int, $qa_status: Int, $geocode_provider: Int) {
               update_atd_txdot_crashes(where: {crash_id: {_eq: $crash_id}}, _set: {qa_status: $qa_status, geocode_provider: $geocode_provider}){
                 returning {
                   crash_id
                 }
               }
             }`,
        variables: {
          qa_status: 0,
          geocode_provider: 0,
          crash_id: 17168817,
        },
      },
    }).then(result => {
      debugger;
      console.log(result.data);
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
                onClick={this._handleMapStyleChange}
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
