import { Form } from "react-bootstrap";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "react-bootstrap";

/**
 * Custom map control that fits the map to current bounds
 */
export default function MapSelectBasemap() {
  return (
    <div className="map-select-basemap-bottom-left">
      <Card>
        <Card.Header className="pb-0 ">Basemap</Card.Header>
        <Card.Body className="py-1">
          <Form.Check
            type="radio"
            label="Streets"
            // value="readonly"
            // inline
            // id="readonly"
            // checked={field.value === "readonly"}
          />
          <Form.Check
            type="radio"
            label="Aerial"
            // value="editor"
            // inline
            // id="editor"
            // checked={field.value === "editor"}
          />
        </Card.Body>
      </Card>
    </div>
  );
}
