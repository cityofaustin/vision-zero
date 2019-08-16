import React, { Component } from "react";
import MapGL, {
  Marker,
  NavigationControl,
  FullscreenControl
} from "react-map-gl";

// import ControlPanel from "./control-panel";
import Pin from "./Pin";

const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const fullscreenControlStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  padding: "10px"
};

const navStyle = {
  position: "absolute",
  top: 36,
  left: 0,
  padding: "10px"
};

export default class CrashMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: this.props.data.latitude,
        longitude: this.props.data.longitude,
        zoom: 17,
        bearing: 0,
        pitch: 0
      },
      popupInfo: null
    };
  }

  _updateViewport = viewport => {
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

  render() {
    const { viewport } = this.state;

    return (
      <MapGL
        {...viewport}
        width="100%"
        height="350px"
        mapStyle="mapbox://styles/mapbox/satellite-streets-v9"
        onViewportChange={this._updateViewport}
        mapboxApiAccessToken={TOKEN}
      >
        <div className="fullscreen" style={fullscreenControlStyle}>
          <FullscreenControl />
        </div>
        <div className="nav" style={navStyle}>
          <NavigationControl />
        </div>

        <Marker
          latitude={this.props.data.latitude}
          longitude={this.props.data.longitude}
          offsetLeft={-20}
          offsetTop={-10}
        >
          <Pin size={40} />
        </Marker>
      </MapGL>
    );
  }
}
