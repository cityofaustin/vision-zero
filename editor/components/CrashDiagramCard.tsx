import React, { useState, useRef, useMemo } from "react";
import Alert from "react-bootstrap/Alert";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
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

export default function CrashDiagramCard({ crash }: { crash: Crash }) {
  const [diagramError, setDiagramError] = useState(false);
  const [isSaved, setIsSaved] = useState(!!crash.diagram_zoom_rotate);
  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);

  console.log(crash.diagram_zoom_rotate)

  const defaultValues = useMemo(() => {
    return crash.diagram_zoom_rotate
      ? {
          scale: crash.diagram_zoom_rotate.scale,
          rotation: crash.diagram_zoom_rotate.rotation,
          positionX: crash.diagram_zoom_rotate.positionX,
          positionY: crash.diagram_zoom_rotate.positionY
        }
      : {
          // scaled undefined zooms to fit whole image in frame
          scale: undefined,
          rotation: 0,
          positionX: undefined,
          positionY: undefined
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

    // zoom to the scale saved in database, or default
  const initPositionImage = (defaultValues) => {
    if (transformComponentRef.current) {
      const { zoomToElement, setTransform } = transformComponentRef.current;
      if (defaultValues.positionX && defaultValues.positionY) {
        console.log("transform")
        setTransform(defaultValues.positionX, defaultValues.positionY, defaultValues.scale)
      } else {
      zoomToElement("crashDiagramImage", defaultValues.scale, 1);
      }
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
            onTransformed={(e) => {
              setValue("positionX", e.state.positionX, {shouldDirty:true});
              setValue("positionY", e.state.positionY, {shouldDirty:true});
              setValue("scale", e.state.scale)
              console.log(e.state)}}
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
                  if (defaultValues.positionX) {
                    initPositionImage(defaultValues)
                  } else {
                  initZoomToImage(defaultValues.scale); }
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
