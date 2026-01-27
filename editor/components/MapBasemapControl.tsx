import { Fragment } from "react";
import { Form } from "react-bootstrap";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "react-bootstrap";
import { Dispatch, ReactNode, SetStateAction } from "react";

export interface CustomLayerToggle {
  /**
   * ID string that uniquely identifies this toggle among all selectors in the basmap control
   */
  id: string;
  /**
   * The toggle's label
   */
  label: ReactNode;
  /**
   * If the label's checkbox input is checked
   */
  checked: boolean;
  /**
   * Handler fired when the checkbox input changes
   */
  onChange: () => void;
  /**
   * Optional header element to render above this toggle
   */
  sectionHeader?: ReactNode;
}

interface MapBasemapControlProps {
  /** The mapbox basemap type to be used in the map */
  basemapType: "streets" | "aerial";
  /** Sets the state for the basemap type */
  setBasemapType: Dispatch<SetStateAction<"streets" | "aerial">>;
  /** Type of map using the basemap control, used to differentiate multiple controls on same page */
  controlId: string;
  customLayerToggles?: CustomLayerToggle[];
}

/**
 * Custom map component for selecting the basemap option
 */
export default function MapBasemapControl({
  basemapType,
  setBasemapType,
  controlId,
  customLayerToggles,
}: MapBasemapControlProps) {
  return (
    <div className="map-select-basemap-bottom-left">
      <Card className="py-1">
        {customLayerToggles && (
          <>
            <Card.Body className="py-0">
              {customLayerToggles?.map((toggle) => (
                <Fragment key={toggle.id}>
                  {toggle.sectionHeader && toggle.sectionHeader}
                  <Form.Check
                    className="fs-6 my-1"
                    id={toggle.id}
                    type="checkbox"
                    label={toggle.label}
                    checked={toggle.checked}
                    onChange={() => toggle.onChange()}
                  />
                </Fragment>
              ))}
            </Card.Body>
          </>
        )}
        <Card.Body className="py-0">
          <div>
            <span className="fs-6 fw-bold">Basemap</span>
          </div>
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
