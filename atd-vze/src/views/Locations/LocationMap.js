import React, { Component } from "react";
import MapGL, {
  NavigationControl,
  FullscreenControl,
  Source,
  Layer,
} from "react-map-gl";
import axios from "axios";
import moment from "moment";

import styled from "styled-components";
import { colors } from "../../styles/colors";
import { Button } from "reactstrap";

const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
// This API key is managed by CTM. Contact help desk for maintenance and troubleshooting.
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

// Provide style parameters to render Nearmap tiles in react-map-gl
// https://docs.mapbox.com/mapbox-gl-js/example/map-tiles/
const rasterStyle = {
  version: 8,
  sources: {
    "raster-tiles": {
      type: "raster",
      tiles: [
        `https://api.nearmap.com/tiles/v3/Vert/{z}/{x}/{y}.jpg?apikey=${NEARMAP_KEY}`,
      ],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: "simple-tiles",
      type: "raster",
      source: "raster-tiles",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
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
  type: "fill",
  paint: {
    "fill-color": colors.warning,
    "fill-opacity": 0.5,
  },
};

export default class LocationMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: this.props.data.atd_txdot_locations[0].latitude,
        longitude: this.props.data.atd_txdot_locations[0].longitude,
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

  convertNearMapTimeFormat = date => moment(date).format("MM/DD/YYYY");

  getAerialTimestamps = () => {
    // Get all available aerial capture dates and set and format latest to state
    // Tiles from API default to latest capture
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

    return (
      <MapGL
        {...viewport}
        width="100%"
        height="500px"
        mapStyle={rasterStyle}
        // Mapbox Satellite layer as fallback or for testing
        // mapStyle={"mapbox://styles/mapbox/satellite-streets-v9"}
        onViewportChange={this._updateViewport}
        mapboxApiAccessToken={TOKEN}
      >
        {/* Show polygon on map */}
        <Source type="geojson" data={this.locationPolygonGeoJson}>
          <Layer {...polygonDataLayer} />
        </Source>
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
