import { Modal, Button, Form } from "react-bootstrap";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { useGetToken } from "@/utils/auth";

interface CrashDiagramUploadModalProps {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  recordLocator: string;
}

interface FormData {
  file: FileList;
}

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function CrashDiagramUploadModal({
  showModal,
  setShowModal,
  recordLocator,
}: CrashDiagramUploadModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = useGetToken();

  const {
    register,
    handleSubmit,
    // reset,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      file: undefined,
    },
  });

  const url = `${process.env.NEXT_PUBLIC_CR3_API_DOMAIN}/images/crash_diagram/${recordLocator}`;

  /**  Uploads the image to the API */
  const onSubmit = async (data: FormData) => {
    console.log(data.file[0], "this is the file");
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      if (data.file && data.file.length > 0) {
        formData.append("file", data.file[0]);
      }

      const token = await getToken();
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        console.log("we are here");
        const errorData = await response.json();
        throw new Error(
          `Diagram upload failed: ${errorData.error || errorData.description || response.status}`
        );
      }

      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setShowModal(false);
      setError(null);
    }
  };

  return (
    <Modal
      show={showModal}
      size="lg"
      onHide={handleClose}
      // onExited={() => {
      //   reset();
      // }}
    >
      <Modal.Header className="d-flex justify-content-between">
        <Modal.Title>{`Upload crash diagram`}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <Form.Group controlId="formFile">
            <Form.Label className="fw-bold">Image file</Form.Label>
            <Form.Control
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              {...register("file", {
                required: "Image file is required",
                validate: {
                  fileType: (files) => {
                    if (!files || files.length === 0) return true;
                    const file = files[0];
                    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
                    return (
                      validTypes.includes(file.type) ||
                      "File must be JPEG or PNG"
                    );
                  },
                  fileSize: (files) => {
                    if (!files || files.length === 0) return true;
                    const file = files[0];
                    return (
                      file.size <= MAX_SIZE_BYTES ||
                      `File must be smaller than ${MAX_SIZE_MB}MB`
                    );
                  },
                },
              })}
              isInvalid={!!errors.file}
            />
            {!errors.file?.message && (
              <Form.Text className="text-muted">JPEG or PNG, max 5MB</Form.Text>
            )}
            <Form.Control.Feedback type="invalid">
              {errors.file?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Uploading..." : "Save"}
          </Button>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
