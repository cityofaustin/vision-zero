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
import { FaCheckCircle } from "react-icons/fa";
import { SlActionUndo } from "react-icons/sl";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
  useControls,
} from "react-zoom-pan-pinch";
import {
  useForm,
  UseFormRegister,
  UseFormSetValue,
  UseFormHandleSubmit,
  SubmitHandler,
} from "react-hook-form";
import { Crash } from "@/types/crashes";
import { CrashDiagramOrientation } from "@/types/crashDiagramOrientation";
import { UPDATE_CRASH } from "@/queries/crash";
import { useMutation } from "@/utils/graphql";
import PermissionsRequired from "@/components/PermissionsRequired";
import AlignedLabel from "@/components/AlignedLabel";

const CR3_DIAGRAM_BASE_URL = process.env.NEXT_PUBLIC_CR3_DIAGRAM_BASE_URL!;
const allowedUserSaveDiagramRoles = ["vz-admin", "editor"];

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
  resetZoomToImage,
  isDirty,
  onSave,
  handleSubmit,
  isSaved,
}: {
  setValue: UseFormSetValue<CrashDiagramOrientation>;
  resetZoomToImage: () => void;
  isDirty: boolean;
  onSave: SubmitHandler<CrashDiagramOrientation>;
  handleSubmit: UseFormHandleSubmit<CrashDiagramOrientation>;
  isSaved: boolean;
}) => {
  const { zoomIn, zoomOut, resetTransform, instance } = useControls();

  const handleReset = () => {
    resetTransform();
    setValue("rotation", 0);
    setValue("scale", undefined);
    resetZoomToImage();
  };

  return (
    <div className="d-flex justify-content-between w-100 mb-1">
      <ButtonGroup>
        <Button
          size="sm"
          variant="outline-primary"
          onClick={() => {
            const newScale = instance.transformState.scale + 0.25;
            zoomIn(0.25);
            setValue("scale", newScale, {
              shouldDirty: true,
            });
          }}
          title="Zoom In"
        >
          <AlignedLabel>
            <FaMagnifyingGlassPlus />
          </AlignedLabel>
        </Button>
        <Button
          size="sm"
          variant="outline-primary"
          onClick={() => {
            const newScale = instance.transformState.scale - 0.25;
            zoomOut(0.25);
            setValue("scale", newScale, {
              shouldDirty: true,
            });
          }}
          title="Zoom Out"
        >
          <AlignedLabel>
            <FaMagnifyingGlassMinus />
          </AlignedLabel>
        </Button>
        <Button
          size="sm"
          variant="outline-primary"
          onClick={handleReset}
          title="Reset"
        >
          <AlignedLabel>
            <SlActionUndo className="me-2" />
            Reset
          </AlignedLabel>
        </Button>
      </ButtonGroup>
      <PermissionsRequired allowedRoles={allowedUserSaveDiagramRoles}>
        <AlignedLabel>
          <Button
            size="sm"
            variant={"primary"}
            onClick={handleSubmit(onSave)}
            title={"save"}
            disabled={!isDirty}
          >
            <AlignedLabel>
              {(isDirty || (!isDirty && !isSaved)) && (
                <>
                  <FaFloppyDisk className="me-2" />
                  Save
                </>
              )}
              {isSaved && !isDirty && (
                <>
                  <FaCheckCircle className="me-2" />
                  Saved
                </>
              )}
            </AlignedLabel>
          </Button>
        </AlignedLabel>
      </PermissionsRequired>
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
  const [isSaved, setIsSaved] = useState(false);
  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);

  const defaultValues = useMemo(() => {
    return crash.diagram_zoom_rotate
      ? {
          scale: crash.diagram_zoom_rotate.scale,
          rotation: crash.diagram_zoom_rotate.rotation,
        }
      : {
          // scaled undefined zooms to fit whole image in frame
          scale: undefined,
          rotation: 0,
        };
  }, [crash]);

  const {
    register,
    handleSubmit,
    formState: { isDirty },
    setValue,
    watch,
    reset,
  } = useForm({
    defaultValues,
  });

  const { mutate } = useMutation(UPDATE_CRASH);

  const onSave: SubmitHandler<CrashDiagramOrientation> = async (data) => {
    await mutate({
      id: crash.id,
      updates: { diagram_zoom_rotate: data },
    });

    // do not clear values from form, but clear dirty state to hide saved button
    reset(data, { keepDirty: false });
    setIsSaved(true);
  };

  const rotation = watch("rotation");

  // zoom image to scale "undefined" effectively zooming to fit entire image in frame
  const resetZoomToImage = () => {
    if (transformComponentRef.current) {
      const { zoomToElement } = transformComponentRef.current;
      zoomToElement("crashDiagramImage", undefined, 1);
      setValue("scale", undefined, { shouldDirty: true });
    }
  };

  // zoom to the scale saved in database, or default
  const initZoomToImage = (initScale: number | undefined) => {
    if (transformComponentRef.current) {
      const { zoomToElement } = transformComponentRef.current;
      zoomToElement("crashDiagramImage", initScale, 1);
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
            onZoom={(e) => {
              setValue("scale", e.state.scale, { shouldDirty: true });
            }}
          >
            <ZoomResetSaveControls
              setValue={setValue}
              resetZoomToImage={resetZoomToImage}
              isDirty={isDirty}
              onSave={onSave}
              handleSubmit={handleSubmit}
              isSaved={isSaved}
            />
            <TransformComponent
              wrapperStyle={{ width: "100%" }}
              contentStyle={{ mixBlendMode: "multiply" }}
            >
              <Image
                fluid
                style={{ transform: `rotate(${rotation}deg)` }}
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
