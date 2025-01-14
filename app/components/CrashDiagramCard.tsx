import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { FaMagnifyingGlassPlus, FaMagnifyingGlassMinus } from "react-icons/fa6";
import { SlActionUndo } from "react-icons/sl";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";
import AlignedLabel from "@/components/AlignedLabel";
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

  return (
    <div className="d-flex justify-content-between w-100 mb-1">
      <ButtonGroup>
        <Button
          size="sm"
          variant="primary"
          onClick={() => zoomIn()}
          title="Zoom In"
        >
          <AlignedLabel>
            <FaMagnifyingGlassPlus className="me-2" />
            <span>Zoom In</span>
          </AlignedLabel>
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={() => zoomOut()}
          title="Zoom Out"
        >
          <AlignedLabel>
            <FaMagnifyingGlassMinus className="me-2" />
            <span>Zoom Out</span>
          </AlignedLabel>
        </Button>
      </ButtonGroup>
      <Button size="sm" variant="primary" onClick={handleReset} title="Reset">
        <AlignedLabel>
          <SlActionUndo className="me-2" />
          <span>Reset</span>
        </AlignedLabel>
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
    <div className="mt-2">
      <Form.Range
        min="-180"
        max="180"
        value={rotation}
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
      <Card.Body className="crash-header-card-body text-center d-flex flex-column">
        <TransformWrapper initialScale={1}>
          {!diagramError && <ZoomResetControls setRotation={setRotation} />}
          <TransformComponent>
            {!diagramError && (
              <Image
                fluid
                style={{
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
              <div
                className="d-flex align-items-start justify-content-center h-100 mt-3"
                style={{ width: "490px" }}
              >
                <Alert variant="info" className="mx-auto">
                  <i className="fa fa-info-circle" />
                  Crash diagrams are not available for temporary crash records
                </Alert>
              </div>
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
