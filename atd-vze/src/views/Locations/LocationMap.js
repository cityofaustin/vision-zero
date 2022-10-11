import React, { Component } from "react";
import MapGL, {
  NavigationControl,
  FullscreenControl,
  Source,
  Layer,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "axios";
import { format, parse } from "date-fns";

import styled from "styled-components";
import { colors } from "../../styles/colors";
import { Button } from "reactstrap";
import { LOCATION_MAP_CONFIG } from "../../helpers/map";

const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const NEARMAP_KEY = process.env.REACT_APP_NEARMAP_KEY;

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

const TimestampDisplay = styled.div`
  top: 24px;
  right: 24px;
  position: absolute;
  #timestamp-display:hover {
    cursor: grab;
  }
`;

// Styles for location polygon overlay
const polygonDataLayer = {
  id: "data",
  type: "line",
  paint: {
    "line-color": colors.warning,
    "line-width": 3,
  },
};

export default class LocationMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: this.props.data.atd_txdot_locations[0].latitude || 30.2672,
        longitude: this.props.data.atd_txdot_locations[0].longitude || -97.7431,
        zoom: 17,
        bearing: 0,
        pitch: 0,
      },
      popupInfo: null,
      aerialTimestamp: "",
    };

    this.polygon = this.props.data.atd_txdot_locations[0];

    // Create GeoJSON object from location polygon record for Source component
    this.locationPolygonGeoJson = {
      type: "Feature",
      properties: {
        renderType: this.polygon.shape.type,
        id: this.polygon.location_id,
      },
      geometry: {
        coordinates: this.polygon.shape.coordinates,
        type: this.polygon.shape.type,
      },
    };
  }

  _updateViewport = viewport => {
    this.setState({ viewport });
  };

  getLatestAerialTimestamp = timestampArray => timestampArray.slice(-1)[0];

  convertNearMapTimeFormat = date => {
    format(parse(date, "'/Date('T')/'", new Date()), "MM/dd/yyyy");
  };

  getAerialTimestamps = () => {
    // Get all available aerial capture dates and set and format latest to state
    // Tiles from API default to latest capture
    // The following link contains helpful information about the API and its responses such as the date format:
    // https://docs.nearmap.com/display/ND/Nearmap+TMS+Integration#NearmapTMSIntegration-Attributes
    const { latitude, longitude, zoom } = this.state.viewport;
    axios
      .get(
        `https://us0.nearmap.com/maps?ll=${latitude},${longitude}&nmq=INFO&nmf=json&zoom=${zoom}&httpauth=false&apikey=${NEARMAP_KEY}`
      )
      .then(res => {
        const aerialTimestamp = this.convertNearMapTimeFormat(
          this.getLatestAerialTimestamp(res.data.layers.Vert)
        );
        this.setState({ aerialTimestamp });
      });
  };

  componentDidMount() {
    this.getAerialTimestamps();
  }

  render() {
    const { viewport } = this.state;
    const isDev = window.location.hostname === "localhost";

    return (
      <MapGL
        {...viewport}
        width="100%"
        height="500px"
        mapStyle={
          isDev
            ? "mapbox://styles/mapbox/satellite-streets-v9"
            : LOCATION_MAP_CONFIG.mapStyle
        }
        onViewportChange={this._updateViewport}
        mapboxApiAccessToken={TOKEN}
      >
        {/* add nearmap raster source and style */}
        {!isDev && (
          <>
            <Source {...LOCATION_MAP_CONFIG.sources.aerials} />
            <Layer {...LOCATION_MAP_CONFIG.layers.aerials} />
          </>
        )}

        {/* Show polygon on map */}
        <Source type="geojson" data={this.locationPolygonGeoJson}>
          <Layer {...polygonDataLayer} />
        </Source>
        {/* show street labels on top of other layers */}
        {!isDev && <Layer {...LOCATION_MAP_CONFIG.layers.streetLabels} />}
        <div className="fullscreen" style={fullscreenControlStyle}>
          <FullscreenControl />
        </div>
        <div className="nav" style={navStyle}>
          <NavigationControl showCompass={false} />
        </div>
        <TimestampDisplay>
          {this.state.aerialTimestamp && (
            <Button
              id="timestamp-display"
              block
              active
              color="ghost-light"
              aria-pressed="true"
            >
              Captured on {this.state.aerialTimestamp}
            </Button>
          )}
        </TimestampDisplay>
      </MapGL>
    );
  }
}
