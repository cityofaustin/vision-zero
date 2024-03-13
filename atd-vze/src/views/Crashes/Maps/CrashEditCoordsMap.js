import React from "react";

import MapGL, {
  Marker,
  NavigationControl,
  FullscreenControl,
} from "react-map-gl";
// import Geocoder from "react-map-gl-geocoder";
// import { CustomGeocoderMapController } from "./customGeocoderMapController";
// import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";

import Pin from "./Pin";
import { useMutation } from "react-apollo";
import { UPDATE_COORDS } from "../../../queries/crashes";
import { CrashEditLatLonForm } from "./CrashEditLatLonForm";
import {
  defaultInitialState,
  LabeledAerialSourceAndLayer,
  isDev,
  mapParameters,
} from "../../../helpers/map";

// const customGeocoderMapController = new CustomGeocoderMapController();

// class CrashEditCoordsMap extends Component {
//   constructor(props) {
//     super(props);

// Default map center
// this.initialMapCenter = {
//   latitude: this.props.data.latitude_primary || 30.26714,
//   longitude: this.props.data.longitude_primary || -97.743192,
// };

// this.state = {
//       markerLatitude: 0,
//       markerLongitude: 0,
//       isDragging: false,
//     };
//   }

//   _updateViewport = viewport => {
//     this.setState({
//       viewport,
//       markerLatitude: viewport.latitude,
//       markerLongitude: viewport.longitude,
//     });
//   };

//   getCursor = ({ isDragging }) => {
//     isDragging !== this.state.isDragging && this.setState({ isDragging });
//   };

//   handleMapFormSubmit = e => {
//     e.preventDefault();

//     const variables = {
//       qaStatus: 3, // Lat/Long entered manually to Primary
//       geocodeProvider: 5, // Manual Q/A
//       crashId: this.props.crashId,
//       latitude: this.state.markerLatitude,
//       longitude: this.state.markerLongitude,
//       updatedBy: localStorage.getItem("hasura_user_email"),
//     };

//     this.props.client
//       .mutate({
//         mutation: UPDATE_COORDS,
//         variables: variables,
//       })
//       .then(res => {
//         this.props.refetchCrashData();
//         this.props.setIsEditingCoords(false);
//       });
//   };

//   handleMapFormReset = e => {
//     e.preventDefault();
//     const updatedViewport = {
//       ...this.state.viewport,
//       latitude: this.initialMapCenter.latitude,
//       longitude: this.initialMapCenter.longitude,
//     };
//     this.setState({
//       viewport: updatedViewport,
//       markerLatitude: updatedViewport.latitude,
//       markerLongitude: updatedViewport.longitude,
//     });
//   };

//   handleMapFormCancel = e => {
//     e.preventDefault();
//     this.props.setIsEditingCoords(false);
//   };

//   render() {
//     const {
//       viewport,
//       markerLatitude,
//       markerLongitude,
//       isDragging,
//     } = this.state;
//     const geocoderAddress = this.props.mapGeocoderAddress;
//     const isDev = window.location.hostname === "localhost";

//     return (
//       <div>
//         <MapGL
//           {...viewport}
//           width="100%"
//           height="350px"
//           mapStyle={
//             isDev
//               ? "mapbox://styles/mapbox/satellite-streets-v11"
//               : LOCATION_MAP_CONFIG.mapStyle
//           }
//           getCursor={this.getCursor}
//           // controller={customGeocoderMapController}
//           mapboxApiAccessToken={TOKEN}
//         >
//           {/* <Geocoder
//             mapRef={this.mapRef}
//             onViewportChange={this._handleViewportChange}
//             mapboxApiAccessToken={TOKEN}
//             inputValue={geocoderAddress}
//             options={{ flyTo: false }}
//             // Bounding box for auto-populated results in the search bar
//             bbox={[-98.22464, 29.959694, -97.226257, 30.687526]}
//           /> */}
//           <div className="fullscreen" style={fullscreenControlStyle}>
//             <FullscreenControl />
//           </div>
//           <div className="nav" style={navStyle}>
//             <NavigationControl showCompass={false} />
//           </div>
//           {/* add nearmap raster source and style */}
//           {!isDev && <LabeledAerialSourceAndLayer />}
//           <Marker latitude={markerLatitude} longitude={markerLongitude}>
//             <Pin size={40} isDragging={isDragging} animated />
//           </Marker>
//         </MapGL>
//         <CrashEditLatLonForm
//           latitude={markerLatitude}
//           longitude={markerLongitude}
//           handleFormSubmit={this.handleMapFormSubmit}
//           handleFormReset={this.handleMapFormReset}
//           handleFormCancel={this.handleMapFormCancel}
//         />
//       </div>
//     );
//   }
// }

// export default withApollo(CrashEditCoordsMap);

const CrashEditCoordsMap = ({
  data,
  mapGeocoderAddress,
  crashId,
  refetchCrashData,
  setIsEditingCoords,
}) => {
  const { latitude_primary = null, longitude_primary = null } = data;

  const mapRef = React.useRef();
  const [isDragging, setIsDragging] = React.useState(false);
  const [markerCoordinates, setMarkerCoordinates] = React.useState({
    latitude: latitude_primary,
    longitude: longitude_primary,
  });

  const [updateCrashCoordinates] = useMutation(UPDATE_COORDS);

  const onDrag = e => {
    const latitude = e.viewState.latitude;
    const longitude = e.viewState.longitude;

    setMarkerCoordinates({ latitude, longitude });
  };

  const handleFormSubmit = e => {
    e.preventDefault();

    const variables = {
      qaStatus: 3, // Lat/Long entered manually to Primary
      geocodeProvider: 5, // Manual Q/A
      crashId: crashId,
      // TODO: Get email from context instead
      updatedBy: localStorage.getItem("hasura_user_email"),
      ...markerCoordinates,
    };

    updateCrashCoordinates({
      variables: variables,
    }).then(() => {
      refetchCrashData();
      setIsEditingCoords(false);
    });
  };

  // TODO: handle initial geocoder value?

  return (
    <div>
      <MapGL
        ref={mapRef}
        initialViewState={{
          latitude: latitude_primary || defaultInitialState.latitude,
          longitude: longitude_primary || defaultInitialState.longitude,
          zoom: defaultInitialState.zoom,
        }}
        style={{ width: "100%", height: "100%" }}
        {...mapParameters}
        cooperativeGestures={true}
        draggable
        onDragStart={() => setIsDragging(true)}
        onDrag={onDrag}
        onDragEnd={() => setIsDragging(false)}
      >
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" showCompass={false} />
        <Marker {...markerCoordinates}>
          <Pin size={40} color={"warning"} isDragging={isDragging} animated />
        </Marker>
        {/* add nearmap raster source and style */}
        {!isDev && <LabeledAerialSourceAndLayer />}
      </MapGL>
      <CrashEditLatLonForm
        {...markerCoordinates}
        handleFormSubmit={handleFormSubmit}
        handleFormReset={handleMapFormReset}
        handleFormCancel={handleMapFormCancel}
      />
    </div>
  );
};

export default CrashEditCoordsMap;
