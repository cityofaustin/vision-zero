import { Form } from "react-bootstrap";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "react-bootstrap";
import { mapStyleOptions } from "@/configs/map";
import { Dispatch, SetStateAction } from "react";

interface MapSelectBasemapProps {
  /** The mapbox basemap style URL to be used in the map */
  basemap: string;
  /** Sets the state for the basemap URL */
  setBasemap: Dispatch<SetStateAction<string | undefined>>;
}

/**
 * Custom map control that fits the map to current bounds
 */
export default function MapSelectBasemap({
  basemap,
  setBasemap,
}: MapSelectBasemapProps) {
  return (
    <div className="map-select-basemap-bottom-left">
      <Card>
        <Card.Header className="pb-0 ">Basemap</Card.Header>
        <Card.Body className="py-1">
          <Form.Check
            type="radio"
            label="Streets"
            checked={
              basemap === mapStyleOptions.darkStreets ||
              basemap === mapStyleOptions.lightStreets
            }
            onChange={() => {
              setBasemap(mapStyleOptions.lightStreets);
            }}
          />
          <Form.Check
            type="radio"
            label="Aerial"
            checked={basemap === mapStyleOptions.aerial}
            onChange={() => {
              setBasemap(mapStyleOptions.aerial);
            }}
          />
        </Card.Body>
      </Card>
    </div>
  );
}
