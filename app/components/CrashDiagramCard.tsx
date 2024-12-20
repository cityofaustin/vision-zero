import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { BsZoomIn, BsZoomOut } from "react-icons/bs";
import { SlActionUndo } from "react-icons/sl";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";
import { Crash } from "@/types/crashes";

const CR3_DIAGRAM_BASE_URL = process.env.NEXT_PUBLIC_CR3_DIAGRAM_BASE_URL!;

const ZoomResetControls = ({
  setRotation,
}: {
  setRotation: (value: number) => void;
}) => {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  const handleReset = () => {
    resetTransform();
    setRotation(0);
  };

  // pixel pushing
  const iconStyle = {
    // 👇 Type assertion saying: the type of this string is the string "relative"
    // to satisfy Button's style prop.
    // TS will infer this as just `string` when we want something more specific.
    position: "relative" as "relative",
    top: "-1px",
    fontSize: "1.3em",
  };

  return (
    <div
      className="tools"
      style={{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: "5px",
      }}
    >
      <div>
        <ButtonGroup>
          <Button
            size="sm"
            variant="primary"
            onClick={() => zoomIn()}
            title="Zoom In"
          >
            <BsZoomIn style={iconStyle} />
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => zoomOut()}
            title="Zoom Out"
          >
            <BsZoomOut style={iconStyle} />
          </Button>
        </ButtonGroup>
      </div>
      <Button size="sm" variant="primary" onClick={handleReset} title="Reset">
        <SlActionUndo style={iconStyle} />
      </Button>
    </div>
  );
};

const RotateControls = ({
  rotation,
  setRotation,
}: {
  rotation: number;
  setRotation: (value: number) => void;
}) => {
  const rotate = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRotation(Number(event.target.value));
  };

  return (
    <div className="rotate-controls" style={{ marginTop: "10px" }}>
      <input
        type="range"
        min="-180"
        max="180"
        value={rotation}
        className="form-control-range"
        id="formControlRange"
        onChange={rotate}
        style={{ width: "70%" }}
        title="Rotate Diagram"
      />
    </div>
  );
};
export default function CrashDiagramCard({ crash }: { crash: Crash }) {
  const [diagramError, setDiagramError] = useState(false);
  const [rotation, setRotation] = useState(0);

  return (
    <Card>
      <Card.Header>Diagram</Card.Header>
      <Card.Body className="crash-header-card-body text-center">
        <TransformWrapper>
          {!diagramError && <ZoomResetControls setRotation={setRotation} />}
          <TransformComponent>
            <div style={{ height: "100%", overflow: "hidden" }}>
              {!diagramError && (
                <Image
                  fluid
                  style={{
                    height: "100%",
                    width: "100%",
                    transform: `rotate(${rotation}deg)`,
                    objectFit: "contain",
                  }}
                  src={`${CR3_DIAGRAM_BASE_URL}/${crash.record_locator}.jpeg`}
                  alt="crash diagram"
                  onError={() => {
                    console.error("Error loading CR3 diagram image");
                    setDiagramError(true);
                  }}
                />
              )}
              {diagramError && crash.is_temp_record && (
                <Alert variant="info" style={{ marginTop: "50px" }}>
                  <i className="fa fa-info-circle" />
                  Crash diagrams are not available for temporary crash records
                </Alert>
              )}
              {diagramError && !crash.is_temp_record && (
                <Alert variant="danger" style={{ marginTop: "20px" }}>
                  <p>The crash diagram is not available.</p>
                  <p>
                    For additional assistance, you can&nbsp;
                    <a
                      href="https://atd.knack.com/dts#new-service-request/?view_249_vars=%7B%22field_398%22%3A%22Bug%20Report%20%E2%80%94%20Something%20is%20not%20working%22%2C%22field_399%22%3A%22Vision%20Zero%20Editor%22%7D"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      report a bug
                      <i className="fa fa-external-link"></i>
                    </a>
                    .
                  </p>
                </Alert>
              )}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </Card.Body>
      {!diagramError && (
        <Card.Footer className="text-center">
          <RotateControls rotation={rotation} setRotation={setRotation} />
        </Card.Footer>
      )}
    </Card>
  );
}
