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

//           {/* <Geocoder
//             mapRef={this.mapRef}
//             onViewportChange={this._handleViewportChange}
//             mapboxApiAccessToken={TOKEN}
//             inputValue={geocoderAddress}
//             options={{ flyTo: false }}
//             // Bounding box for auto-populated results in the search bar
//             bbox={[-98.22464, 29.959694, -97.226257, 30.687526]}
//           /> */}

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

  const handleFormReset = () => {
    // Reset marker to original coordinates or default fallback
    const originalMarkerCoordinates = {
      latitude: latitude_primary || defaultInitialState.latitude,
      longitude: longitude_primary || defaultInitialState.latitude,
    };

    // TODO: Move map center to original coordinates or default fallback
    setMarkerCoordinates(originalMarkerCoordinates);
  };

  const handleFormCancel = () => {
    setIsEditingCoords(false);
  };

  // TODO: handle initial geocoder value?

  return (
    <>
      <MapGL
        ref={mapRef}
        initialViewState={{
          latitude: latitude_primary || defaultInitialState.latitude,
          longitude: longitude_primary || defaultInitialState.longitude,
          zoom: defaultInitialState.zoom,
        }}
        style={{ width: "100%", height: "50vh" }}
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
        handleFormReset={handleFormReset}
        handleFormCancel={handleFormCancel}
      />
    </>
  );
};

export default CrashEditCoordsMap;
