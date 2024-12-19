import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import { Crash } from "@/types/crashes";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";

const CR3_DIAGRAM_BASE_URL = process.env.NEXT_PUBLIC_CR3_DIAGRAM_BASE_URL!;

const Controls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  return (
    <div className="tools">
      <button onClick={() => zoomIn()}>+</button>
      <button onClick={() => zoomOut()}>-</button>
      <button onClick={() => resetTransform()}>x</button>
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
    <div className="rotate-controls">
      <input
        type="range"
        min="-180"
        max="180"
        value={rotation}
        className="form-control-range"
        id="formControlRange"
        onChange={rotate}
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
          <TransformComponent>
            {!diagramError && (
              <Image
                fluid
                style={{
                  height: "100%",
                  maxWidth: "100%",
                  transform: `rotate(${rotation}deg)`,
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
              <Alert variant="info">
                <i className="fa fa-info-circle" /> Crash diagrams are not
                available for user-created crash records
              </Alert>
            )}
            {diagramError && !crash.is_temp_record && (
              <Alert variant="danger">
                <p>
                  The crash diagram is not available. Typically, this indicates
                  there was an error when processing this crash&aposs CR3 PDF.
                </p>
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
          </TransformComponent>
          <Controls />
          <RotateControls rotation={rotation} setRotation={setRotation} />
        </TransformWrapper>
      </Card.Body>
      <Card.Footer>Something else here</Card.Footer>
    </Card>
  );
}
