import { Form } from "react-bootstrap";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "react-bootstrap";
import { Dispatch, SetStateAction } from "react";
import AlignedLabel from "@/components/AlignedLabel";
import { MdOutlineLayers } from "react-icons/md";

interface MapBasemapControlProps {
  /** The mapbox basemap type to be used in the map */
  basemapType: "streets" | "aerial";
  /** Sets the state for the basemap type */
  setBasemapType: Dispatch<SetStateAction<"streets" | "aerial">>;
  /** Type of map using the basemap control, used to differentiate multiple controls on same page */
  controlId: string;
}

/**
 * Custom map component for selecting the basemap option
 */
export default function MapBasemapControl({
  basemapType,
  setBasemapType,
  controlId,
}: MapBasemapControlProps) {
  return (
    <div className="map-select-basemap-bottom-left">
      <Card>
        <Card.Header className="pb-0 ">
          <AlignedLabel>
            <MdOutlineLayers className="me-2 fs-5" />
            <span className="fs-6 fw-bold">Basemap</span>
          </AlignedLabel>
        </Card.Header>
        <Card.Body className="py-1">
          <Form.Check
            className="fs-6 my-1"
            id={`${controlId}-streets`}
            type="radio"
            label="Streets"
            checked={basemapType === "streets"}
            onChange={() => {
              setBasemapType("streets");
            }}
          />
          <Form.Check
            className="fs-6 my-1"
            id={`${controlId}-aerial`}
            type="radio"
            label="Aerial"
            checked={basemapType === "aerial"}
            onChange={() => {
              setBasemapType("aerial");
            }}
          />
        </Card.Body>
      </Card>
    </div>
  );
}
