import React from "react";

import MapGL, {
  Marker,
  NavigationControl,
  FullscreenControl,
} from "react-map-gl";

import Pin from "./Pin";
import { useMutation } from "react-apollo";
import { useAuth0 } from "../../../auth/authContext";
import { UPDATE_COORDS } from "../../../queries/crashes";
import { CrashEditLatLonForm } from "./CrashEditLatLonForm";
import {
  defaultInitialState,
  LabeledAerialSourceAndLayer,
  mapParameters,
} from "../../../helpers/map";

const CrashEditCoordsMap = ({
  data,
  mapGeocoderAddress,
  crashId,
  refetchCrashData,
  setIsEditingCoords,
}) => {
  const { user } = useAuth0();
  const { email = null } = user;
  const { latitude_primary = null, longitude_primary = null } = data;

  const mapRef = React.useRef();
  const [isDragging, setIsDragging] = React.useState(false);
  const [markerCoordinates, setMarkerCoordinates] = React.useState({
    latitude: latitude_primary,
    longitude: longitude_primary,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [updateCrashCoordinates] = useMutation(UPDATE_COORDS);

  const onDrag = e => {
    const latitude = e.viewState.latitude;
    const longitude = e.viewState.longitude;

    setMarkerCoordinates({ latitude, longitude });
  };

  const handleFormSubmit = e => {
    e.preventDefault();
    setIsSubmitting(true);

    const variables = {
      qaStatus: 3, // Lat/Long entered manually to Primary
      geocodeProvider: 5, // Manual Q/A
      crashId: crashId,
      updatedBy: email,
      ...markerCoordinates,
    };

    updateCrashCoordinates({
      variables: variables,
    }).then(() => {
      // Refetch and then close edit map so CrashMap initializes with updated coordinates
      refetchCrashData().then(() => {
        setIsSubmitting(false);
        setIsEditingCoords(false);
      });
    });
  };

  const handleFormReset = () => {
    // Reset marker to original coordinates or default fallback
    const originalMarkerCoordinates = {
      latitude: latitude_primary || defaultInitialState.latitude,
      longitude: longitude_primary || defaultInitialState.latitude,
    };

    // Move map center and marks to original coordinates or default fallback
    setMarkerCoordinates(originalMarkerCoordinates);
    mapRef.current &&
      mapRef.current.jumpTo({
        center: [
          originalMarkerCoordinates.longitude,
          originalMarkerCoordinates.latitude,
        ],
      });
  };

  const handleFormCancel = () => {
    setIsEditingCoords(false);
  };

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
        <LabeledAerialSourceAndLayer />
      </MapGL>
      <CrashEditLatLonForm
        {...markerCoordinates}
        handleFormSubmit={handleFormSubmit}
        handleFormReset={handleFormReset}
        handleFormCancel={handleFormCancel}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default CrashEditCoordsMap;
