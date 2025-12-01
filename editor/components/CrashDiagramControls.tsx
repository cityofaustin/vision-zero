import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormHandleSubmit,
  SubmitHandler,
} from "react-hook-form";
import {
  FaMagnifyingGlassPlus,
  FaMagnifyingGlassMinus,
  FaFloppyDisk,
} from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { SlActionUndo } from "react-icons/sl";
import { useControls } from "react-zoom-pan-pinch";
import { CrashDiagramOrientation } from "@/types/crashDiagramOrientation";
import AlignedLabel from "@/components/AlignedLabel";
import PermissionsRequired from "@/components/PermissionsRequired";

const allowedUserSaveDiagramRoles = ["vz-admin", "editor"];

export const RotateControls = ({
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

export const ZoomResetSaveControls = ({
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
