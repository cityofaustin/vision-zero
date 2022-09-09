import React, { Component } from "react";
import MapGL, {
  Marker,
  NavigationControl,
  FullscreenControl,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import Pin from "./Pin";
import { LOCATION_MAP_CONFIG } from "../../../helpers/map";

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

export default class CrashMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: this.props.data.latitude_primary,
        longitude: this.props.data.longitude_primary,
        zoom: 17,
        bearing: 0,
        pitch: 0,
      },
      popupInfo: null,
    };
  }

  _updateViewport = (viewport) => {
    this.setState({ viewport });
  };

  _renderCityMarker = (city, index) => {
    return (
      <Marker
        key={`marker-${index}`}
        longitude={city.longitude}
        latitude={city.latitude}
      >
        <Pin size={30} onClick={() => this.setState({ popupInfo: city })} />
      </Marker>
    );
  };

  componentDidUpdate(prevProps) {
    // Update viewport after an edit has been submitted with CrashEditCoordsMap component
    if (
      prevProps.data.latitude_primary !== this.props.data.latitude_primary ||
      prevProps.data.longitude_primary !== this.props.data.longitude_primary
    ) {
      const updatedViewport = {
        ...this.state.viewport,
        latitude: this.props.data.latitude_primary,
        longitude: this.props.data.longitude_primary,
      };
      this.setState({ viewport: updatedViewport });
    }
  }

  render() {
    const { viewport } = this.state;
    const isDev = window.location.hostname === "localhost";

    return (
      <MapGL
        {...viewport}
        width="100%"
        height="100%"
        mapStyle={LOCATION_MAP_CONFIG.mapStyle}
        onViewportChange={this._updateViewport}
        mapboxApiAccessToken={TOKEN}
      >
        <div className="fullscreen" style={fullscreenControlStyle}>
          <FullscreenControl />
        </div>
        <div className="nav" style={navStyle}>
          <NavigationControl showCompass={false} />
        </div>
        {/* add nearmap raster source and style */}
        <Source {...LOCATION_MAP_CONFIG.sources.aerials} />
        <Layer {...LOCATION_MAP_CONFIG.layers.aerials} />
        {/* show street labels on top of other layers */}
        <Layer {...LOCATION_MAP_CONFIG.layers.streetLabels} />
        <Marker
          latitude={this.props.data.latitude_primary}
          longitude={this.props.data.longitude_primary}
        >
          <Pin size={40} color={"warning"} />
        </Marker>
      </MapGL>
    );
  }
}
