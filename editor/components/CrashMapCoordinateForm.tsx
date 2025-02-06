import { Dispatch, SetStateAction } from "react";
import Form from "react-bootstrap/Form";
import { LatLon } from "@/components/CrashMap";

interface CrashMapCoordianteFormProps {
  editCoordinates: LatLon;
  setEditCoordinates: Dispatch<SetStateAction<LatLon>>;
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
          inputMode="numeric"
          size="sm"
          value={String(editCoordinates.latitude)}
          onChange={(e) => {
            setEditCoordinates({
              ...editCoordinates,
              latitude: Number(e.target.value),
            });
          }}
        />
        <Form.Label className="fw-bold me-1 my-auto">Lon</Form.Label>
        <Form.Control
          inputMode="numeric"
          size="sm"
          value={String(editCoordinates.longitude)}
          onChange={(e) => {
            setEditCoordinates({
              ...editCoordinates,
              latitude: Number(e.target.value),
            });
          }}
        />
      </Form.Group>
    </Form>
  );
}
