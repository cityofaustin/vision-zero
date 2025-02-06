import { Dispatch, SetStateAction } from "react";
import Form from "react-bootstrap/Form";
import {  LatLonString } from "@/components/CrashMap";

interface CrashMapCoordianteFormProps {
  editCoordinates: LatLonString;
  setEditCoordinates: Dispatch<SetStateAction<LatLonString>>;
}

/**
 * Form component to enter lat/lon coordinates
 */
export default function CrashMapCoordinateForm({
  editCoordinates,
  setEditCoordinates,
}: CrashMapCoordianteFormProps) {
  return (
    <Form id="recommendationForm">
      <Form.Group className="d-flex text-nowrap d-flex align-items-center me-2">
        <Form.Label className="fw-bold me-1 my-auto">Lat</Form.Label>
        <Form.Control
          className="me-2"
          size="sm"
          value={String(
            editCoordinates.latitude === null ? "" : editCoordinates.latitude
          )}
          onChange={(e) => {
            setEditCoordinates({
              ...editCoordinates,
              latitude: e.target.value,
            });
          }}
        />
        <Form.Label className="fw-bold me-1 my-auto">Lon</Form.Label>
        <Form.Control
          size="sm"
          value={String(
            editCoordinates.longitude === null ? "" : editCoordinates.longitude
          )}
          onChange={(e) => {
            setEditCoordinates({
              ...editCoordinates,
              longitude: e.target.value,
            });
          }}
        />
      </Form.Group>
    </Form>
  );
}
