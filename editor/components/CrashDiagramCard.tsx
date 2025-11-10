import React, { useState, useRef, useMemo } from "react";
import Alert from "react-bootstrap/Alert";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import {
  FaMagnifyingGlassPlus,
  FaMagnifyingGlassMinus,
  FaRotate,
  FaFloppyDisk,
} from "react-icons/fa6";
import { SlActionUndo } from "react-icons/sl";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
  useControls,
} from "react-zoom-pan-pinch";
import { Crash } from "@/types/crashes";
import {
  useForm,
  UseFormRegister,
  UseFormSetValue,
  UseFormHandleSubmit,
  SubmitHandler,
} from "react-hook-form";
import { CrashDiagramOrientation } from "@/types/crashDiagramOrientation";
import { UPDATE_CRASH } from "@/queries/crash";
import { useMutation } from "@/utils/graphql";

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

const ZoomResetSaveControls = ({
  setValue,
  zoomToImage,
  isDirty,
  onSave,
  handleSubmit,
  diagramSaved,
}: {
  setValue: UseFormSetValue<CrashDiagramOrientation>;
  zoomToImage: () => void;
  isDirty: boolean;
  onSave: SubmitHandler<CrashDiagramOrientation>;
  handleSubmit: UseFormHandleSubmit<CrashDiagramOrientation>;
  diagramSaved: boolean;
}) => {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  const handleReset = () => {
    resetTransform();
    setValue("rotation", 0);
    setValue("scale", 1);
    zoomToImage();
  };

  return (
    <div className="d-flex justify-content-between w-100 mb-1">
      <ButtonGroup>
        <Button
          size="sm"
          variant="outline-primary"
          onClick={() => zoomIn(0.25)}
          title="Zoom In"
        >
          <FaMagnifyingGlassPlus />
        </Button>
        <Button
          size="sm"
          variant="outline-primary"
          onClick={() => zoomOut(0.25)}
          title="Zoom Out"
        >
          <FaMagnifyingGlassMinus />
        </Button>
        <Button
          size="sm"
          variant="outline-primary"
          onClick={handleReset}
          title="Reset"
        >
          <SlActionUndo className="me-2" />
          Reset
        </Button>
      </ButtonGroup>
      <Button
        size="sm"
        variant={diagramSaved ? "primary" : "outline-primary"}
        onClick={handleSubmit(onSave)}
        title={"save"}
        disabled={!isDirty}
      >
        <FaFloppyDisk className="me-2" />
        {diagramSaved ? "Saved" : "Save"}
      </Button>
    </div>
  );
};

const RotateControls = ({
  setValue,
  register,
}: {
  setValue: UseFormSetValue<CrashDiagramOrientation>;
  register: UseFormRegister<CrashDiagramOrientation>;
}) => {
  return (
    <div className="mt-2">
      <Form.Range
        {...register("rotation")}
        min="-180"
        max="180"
        id="formControlRange"
        onChange={(e) =>
          setValue("rotation", Number(e.target.value), { shouldDirty: true })
        }
        title="Rotate Diagram"
      />
    </div>
  );
};

export default function CrashDiagramCard({ crash }: { crash: Crash }) {
  const [diagramError, setDiagramError] = useState(false);
  const [diagramSaved, setDiagramSaved] = useState(false);
  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);

  const defaultValues = useMemo(() => {
    return crash.diagram_zoom_rotate
      ? {
          scale: crash.diagram_zoom_rotate.scale,
          rotation: crash.diagram_zoom_rotate.rotation,
        }
      : {
          scale: 1,
          rotation: 0,
        };
  }, [crash]);

  const {
    register,
    handleSubmit,
    formState: { isDirty },
    setValue,
    watch,
  } = useForm({
    defaultValues,
  });

  const { mutate } = useMutation(UPDATE_CRASH);

  const onSave: SubmitHandler<CrashDiagramOrientation> = async (data) => {
    await mutate({
      id: crash.id,
      updates: { diagram_zoom_rotate: data },
    });
  };

  const formValues = watch();

  const resetZoomToImage = () => {
    if (transformComponentRef.current) {
      const { zoomToElement } = transformComponentRef.current;
      zoomToElement("crashDiagramImage", undefined, 1);
    }
  };

  // zoom to the scale saved in database, or default value (1)
  const initZoomToImage = (initScale: number) => {
    if (transformComponentRef.current) {
      const { zoomToElement } = transformComponentRef.current;
      zoomToElement("crashDiagramImage", undefined, initScale);
    }
  };

  return (
    <Card className="h-100">
      <Card.Header>
        <Card.Title>Diagram</Card.Title>
        <div className="text-secondary fw-light">
          Use shift + scroll to zoom
        </div>
      </Card.Header>
      <Card.Body className="crash-header-card-body text-center d-flex flex-column">
        {!diagramError && (
          <TransformWrapper
            initialScale={defaultValues.scale}
            minScale={0.5}
            centerZoomedOut={true}
            centerOnInit={true}
            ref={transformComponentRef}
            wheel={{ activationKeys: ["Meta", "Shift"] }}
            onTransformed={(e) => {
              console.log("on transform: ", e.state);
              // running into an issue where on load it zooms to fit, which is dirtying the form
              setValue("scale", e.state.scale, { shouldDirty: true });
            }}
          >
            <ZoomResetSaveControls
              setValue={setValue}
              zoomToImage={resetZoomToImage}
              isDirty={isDirty}
              onSave={onSave}
              handleSubmit={handleSubmit}
              diagramSaved={diagramSaved}
            />
            <TransformComponent contentStyle={{ mixBlendMode: "multiply" }}>
              <Image
                fluid
                style={{ transform: `rotate(${formValues.rotation}deg)` }}
                src={`${CR3_DIAGRAM_BASE_URL}/${crash.record_locator}.jpeg`}
                alt="crash diagram"
                id="crashDiagramImage"
                onLoad={() => {
                  initZoomToImage(defaultValues.scale);
                }}
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
          <div className="d-flex align-items-center w-100">
            <div className="me-3 text-secondary fs-5">
              <FaRotate />
            </div>
            <div className="flex-grow-1">
              <RotateControls setValue={setValue} register={register} />
            </div>
          </div>
        </Card.Footer>
      )}
    </Card>
  );
}
