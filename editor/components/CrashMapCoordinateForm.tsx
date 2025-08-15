import { Dispatch, SetStateAction, useEffect } from "react";
import Form from "react-bootstrap/Form";
import {
  LatLonString,
  LatLon,
  CoordinateValidationError,
} from "@/components/PointMap";

interface CrashMapCoordinateFormProps {
  mapLatLon: LatLon;
  formLatLon: LatLonString;
  setFormLatLon: Dispatch<SetStateAction<LatLonString>>;
  validationError?: CoordinateValidationError;
  setValidationError: Dispatch<
    SetStateAction<CoordinateValidationError | undefined>
  >;
}

/**
 * Form component to enter lat/lon coordinates
 */
export default function CrashMapCoordinateForm({
  mapLatLon,
  formLatLon,
  setFormLatLon,
  validationError,
  setValidationError,
}: CrashMapCoordinateFormProps) {
  useEffect(() => {
    /**
     * Keeps form values in sync with map edits
     */
    setFormLatLon({
      latitude: String(mapLatLon.latitude),
      longitude: String(mapLatLon.longitude),
    });
    setValidationError(undefined);
  }, [mapLatLon, setFormLatLon, setValidationError]);

  return (
    <Form id="recommendationForm">
      <Form.Group className="d-flex align-items-center me-2">
        {/* Latitude */}
        <div className="d-flex align-items-center me-2">
          <div>
            <Form.Label className="fw-bold me-1 my-auto">Latitude</Form.Label>
            <Form.Control
              className="me-2"
              size="sm"
              value={String(formLatLon.latitude ?? "")}
              onChange={(e) => {
                setFormLatLon({
                  ...formLatLon,
                  latitude: e.target.value.trim(),
                });
              }}
              isInvalid={Boolean(validationError?.latitude)}
            />
            <Form.Control.Feedback
              type="invalid"
              className="d-block"
              style={{ minHeight: "1.2em" }}
            >
              {validationError?.latitude?._errors[0]}
            </Form.Control.Feedback>
          </div>
        </div>
        {/* Longitude */}
        <div className="d-flex align-items-center">
          <div>
            <Form.Label className="fw-bold me-1 my-auto">Longitude</Form.Label>
            <Form.Control
              size="sm"
              value={String(formLatLon.longitude ?? "")}
              onChange={(e) => {
                setFormLatLon({
                  ...formLatLon,
                  longitude: e.target.value.trim(),
                });
              }}
              isInvalid={Boolean(validationError?.longitude)}
            />
            <Form.Control.Feedback
              type="invalid"
              className="d-block"
              style={{ minHeight: "1.2em" }}
            >
              {validationError?.longitude?._errors[0]}
            </Form.Control.Feedback>
          </div>
        </div>
      </Form.Group>
    </Form>
  );
}
