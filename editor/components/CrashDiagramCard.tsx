import React, { useState, useRef, useMemo } from "react";
import Alert from "react-bootstrap/Alert";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import Button from "react-bootstrap/Button";
import { FaRotate } from "react-icons/fa6";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import { useForm, SubmitHandler } from "react-hook-form";
import { Crash } from "@/types/crashes";
import { CrashDiagramOrientation } from "@/types/crashDiagramOrientation";
import { UPDATE_CRASH } from "@/queries/crash";
import { useMutation } from "@/utils/graphql";
import {
  RotateControls,
  ZoomResetSaveControls,
} from "@/components/CrashDiagramControls";
import { useImage } from "@/utils/images";
import { hasRole } from "@/utils/auth";
import { useAuth0 } from "@auth0/auth0-react";

interface DiagramAlertProps {
  variant: "info" | "danger" | "success" | "warning";
  message: React.ReactNode;
  link?: {
    href: string;
    text: string;
  };
  button?: React.ReactNode;
}

const DiagramAlert: React.FC<DiagramAlertProps> = ({
  variant,
  message,
  link,
  button,
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
    {button && <div className="mt-2">{button}</div>}
  </Alert>
);

export default function CrashDiagramCard({ crash }: { crash: Crash }) {
  const { imageUrl, error: diagramError } = useImage({
    recordId: crash.record_locator,
    recordType: "crash_diagram",
  });
  const [isLoaded, setIsLoaded] = useState(true);
  const [isSaved, setIsSaved] = useState(!!crash.diagram_transform);
  const [isTouched, setIsTouched] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);

  const defaultValues = useMemo(() => {
    return crash.diagram_transform
      ? {
          scale: crash.diagram_transform.scale,
          rotation: crash.diagram_transform.rotation,
          positionX: crash.diagram_transform.positionX,
          positionY: crash.diagram_transform.positionY,
        }
      : {
          // scaled undefined zooms to fit whole image in frame
          scale: undefined,
          rotation: 0,
          positionX: undefined,
          positionY: undefined,
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
      updates: { diagram_transform: data },
    });

    // do not clear values from form, but clear dirty state to hide saved button
    reset(data, { keepDirty: false });
    setIsTouched(false);
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

  const initPositionImage = (defaultValues: CrashDiagramOrientation) => {
    if (transformComponentRef.current) {
      const { zoomToElement, setTransform } = transformComponentRef.current;
      const { positionX, positionY, scale } = defaultValues;
      if (positionX && positionY && scale) {
        setTransform(positionX, positionY, scale, 1);
      } else {
        // if x/y position is not saved, zoom to image and let the centering dictate x/y position
        zoomToElement("crashDiagramImage", defaultValues.scale, 1);
      }
    }
  };

  const { user } = useAuth0();

  const isReadOnlyUser = user && hasRole(["readonly"], user);

  return (
    <Card className="h-100">
      <Card.Header>
        <Card.Title>Diagram</Card.Title>
        <div className="text-secondary fw-light">
          Use{" "}
          <span className="font-monospace rounded border px-1 bg-light-use-theme">
            shift
          </span>{" "}
          + scroll to zoom
        </div>
      </Card.Header>
      <Card.Body
        className={`crash-header-card-body text-center d-flex flex-column ${!diagramError && !isLoaded ? "image-loading" : ""}`}
      >
        {!diagramError && imageUrl && (
          <TransformWrapper
            initialScale={defaultValues.scale}
            minScale={0.5}
            centerZoomedOut={true}
            centerOnInit={true}
            ref={transformComponentRef}
            wheel={{ activationKeys: ["Meta", "Shift"] }}
            onWheel={() => setIsTouched(true)}
            onTransformed={(e) => {
              setValue("positionX", e.state.positionX);
              setValue("positionY", e.state.positionY);
              setValue("scale", e.state.scale);
            }}
            onPanningStop={() => {
              setIsTouched(true);
            }}
          >
            <ZoomResetSaveControls
              setValue={setValue}
              resetZoomToImage={resetZoomToImage}
              isDirty={isDirty || isTouched}
              onSave={onSave}
              handleSubmit={handleSubmit}
              isSaved={isSaved}
              setIsTouched={setIsTouched}
            />
            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{ mixBlendMode: "multiply" }}
            >
              <Image
                fluid
                style={{ transform: `rotate(${rotation}deg)` }}
                src={imageUrl}
                alt="crash diagram"
                id="crashDiagramImage"
                onLoad={() => {
                  setIsLoaded(true);
                  initPositionImage(defaultValues);
                }}
                onError={() => {
                  console.warn("Error loading CR3 diagram image");
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
            button={
              !isReadOnlyUser ? (
                <Button onClick={() => setShowUploadModal(true)}>
                  Upload crash diagram
                </Button>
              ) : null
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
      {!diagramError && imageUrl && (
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
