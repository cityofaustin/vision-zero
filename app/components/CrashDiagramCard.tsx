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

interface DiagramAlertProps {
  variant: "info" | "danger" | "success" | "warning";
  message: React.ReactNode;
  link?: {
    href: string;
    text: string;
  };
}

const DiagramAlert: React.FC<DiagramAlertProps> = ({
  variant,
  message,
  link,
}) => (
  <Alert variant={variant} className="mt-3">
    {message}
    {link && (
      <p>
        For additional assistance, you can&nbsp;
        <a href={link.href} target="_blank" rel="noopener noreferrer">
          {link.text}
          <i className="fa fa-external-link"></i>
        </a>
        .
      </p>
    )}
  </Alert>
);

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
          <FaMagnifyingGlassPlus />
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={() => zoomOut()}
          title="Zoom Out"
        >
          <FaMagnifyingGlassMinus />
        </Button>
      </ButtonGroup>
      <Button size="sm" variant="primary" onClick={handleReset} title="Reset">
        <SlActionUndo />
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
        {!diagramError && (
          <TransformWrapper initialScale={1}>
            <ZoomResetControls setRotation={setRotation} />
            <TransformComponent>
              <Image
                fluid
                style={{ transform: `rotate(${rotation}deg)` }}
                src={`${CR3_DIAGRAM_BASE_URL}/${crash.record_locator}.jpeg`}
                alt="crash diagram"
                onError={() => {
                  console.error("Error loading CR3 diagram image");
                  setDiagramError(true);
                }}
              />
            </TransformComponent>
          </TransformWrapper>
        )}

        {diagramError && crash.is_temp_record && (
          <DiagramAlert
            variant="info"
            message={
              <>
                <i className="fa fa-info-circle" />
                Crash diagrams are not available for temporary crash records
              </>
            }
          />
        )}

        {diagramError && !crash.is_temp_record && (
          <DiagramAlert
            variant="danger"
            message={<p>The crash diagram is not available.</p>}
            link={{
              href: "https://atd.knack.com/dts#new-service-request/?view_249_vars=%7B%22field_398%22%3A%22Bug%20Report%20%E2%80%94%20Something%20is%20not%20working%22%2C%22field_399%22%3A%22Vision%20Zero%20Editor%22%7D",
              text: "report a bug",
            }}
          />
        )}
      </Card.Body>
      {!diagramError && (
        <Card.Footer className="text-center">
          <RotateControls rotation={rotation} setRotation={setRotation} />
        </Card.Footer>
      )}
    </Card>
  );
}
