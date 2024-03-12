import React from "react";
import MapGL, {
  Marker,
  NavigationControl,
  FullscreenControl,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import Pin from "./Pin";
import {
  LOCATION_MAP_CONFIG,
  LabeledAerialSourceAndLayer,
} from "../../../helpers/map";

const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

// export default class CrashMap extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       viewport: {
//         latitude: this.props.data.latitude_primary,
//         longitude: this.props.data.longitude_primary,
//         zoom: 17,
//         bearing: 0,
//         pitch: 0,
//       },
//       popupInfo: null,
//     };
//   }

//   _updateViewport = viewport => {
//     this.setState({ viewport });
//   };

//   _renderCityMarker = (city, index) => {
//     return (
//       <Marker
//         key={`marker-${index}`}
//         longitude={city.longitude}
//         latitude={city.latitude}
//       >
//         <Pin size={30} onClick={() => this.setState({ popupInfo: city })} />
//       </Marker>
//     );
//   };

//   componentDidUpdate(prevProps) {
//     // Update viewport after an edit has been submitted with CrashEditCoordsMap component
//     if (
//       prevProps.data.latitude_primary !== this.props.data.latitude_primary ||
//       prevProps.data.longitude_primary !== this.props.data.longitude_primary
//     ) {
//       const updatedViewport = {
//         ...this.state.viewport,
//         latitude: this.props.data.latitude_primary,
//         longitude: this.props.data.longitude_primary,
//       };
//       this.setState({ viewport: updatedViewport });
//     }
//   }

//   render() {
//     const { viewport } = this.state;
//     const isDev = window.location.hostname === "localhost";

//     return (
//       <MapGL
//         {...viewport}
//         width="100%"
//         height="100%"
//         mapStyle={
//           isDev
//             ? "mapbox://styles/mapbox/satellite-streets-v11"
//             : LOCATION_MAP_CONFIG.mapStyle
//         }
//         onViewportChange={this._updateViewport}
//         mapboxApiAccessToken={TOKEN}
//       >
//         <div className="fullscreen" style={fullscreenControlStyle}>
//           <FullscreenControl />
//         </div>
//         <div className="nav" style={navStyle}>
//           <NavigationControl showCompass={false} />
//         </div>
//         {/* add nearmap raster source and style */}
//         {!isDev && <LabeledAerialSourceAndLayer />}
//         <Marker
//           latitude={this.props.data.latitude_primary}
//           longitude={this.props.data.longitude_primary}
//         >
//           <Pin size={40} color={"warning"} />
//         </Marker>
//       </MapGL>
//     );
//   }
// }

const CrashMap = ({ data }) => {
  const { latitude_primary, longitude_primary } = data;
  const isDev = window.location.hostname === "localhost";
  // const isDev = false;

  // if no lat/long, return message that there is nothing to show?

  return (
    <MapGL
      initialViewState={{
        latitude: latitude_primary,
        longitude: longitude_primary,
        zoom: 17,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle={
        isDev
          ? "mapbox://styles/mapbox/satellite-streets-v11"
          : LOCATION_MAP_CONFIG.mapStyle
      }
      touchPitch={false}
      dragRotate={false}
      boxZoom={false}
      maxBounds={[[-99, 29], [-96, 32]]}
      mapboxAccessToken={TOKEN}
      cooperativeGestures={true}
    >
      <FullscreenControl position="top-left" />
      <NavigationControl position="top-left" showCompass={false} />
      <Marker latitude={latitude_primary} longitude={longitude_primary}>
        <Pin size={40} color={"warning"} />
      </Marker>
      {/* add nearmap raster source and style */}
      {!isDev && <LabeledAerialSourceAndLayer />}
    </MapGL>
  );
};

export default CrashMap;
