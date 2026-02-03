import { Modal, Button, Form, Row, Col, Image, Spinner } from "react-bootstrap";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useGetToken } from "@/utils/auth";

interface FatalityImageUploadModalProps {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  victimName: string;
  personId: number;
  imageUrl: string | null;
  setImageUrl: Dispatch<SetStateAction<string | null>>;
  isLoading: boolean;
  setImageVersion: Dispatch<SetStateAction<number>>;
}

interface FormData {
  file: FileList;
  image_source: string;
}

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

/**
 * The modal interface for uploading a fatality victim photo.
 */
export default function FatalityImageUploadModal({
  showModal,
  setShowModal,
  victimName,
  personId,
  imageUrl,
  isLoading,
  setImageVersion,
}: FatalityImageUploadModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const getToken = useGetToken();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    watch,
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      file: undefined,
      image_source: "",
    },
  });

  const file = watch("file");
  const imageSource = watch("image_source");

  // Keeps track of file updates and errors to update preview URL
  useEffect(() => {
    if (file && file.length > 0 && !errors.file) {
      const url = URL.createObjectURL(file[0]);
      setPreviewUrl(url);

      // Return cleanup function that revokes this specific URL
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [file, errors.file]);

  /**  Uploads the image to the API */
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      if (data.file && data.file.length > 0) {
        formData.append("file", data.file[0]);
      }

      if (data.image_source) {
        formData.append("image_source", data.image_source);
      }

      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CR3_API_DOMAIN}/images/person/${personId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Upload failed with status: ${response.status}`
        );
      }

      setImageVersion((prev) => prev + 1);
      handleClose();
    } catch (err) {
      console.log(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setShowModal(false);
    }
  };

  const isValid = !errors.file && !errors.image_source;
  const isFormComplete = () => {
    return (
      file?.length > 0 && imageSource && imageSource.trim() !== "" && isValid
    );
  };

  return (
    <Modal
      show={showModal}
      size="lg"
      onHide={handleClose}
      onExited={() => {
        setPreviewUrl(null);
        reset();
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title>{`Photo | ${victimName}`}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="formFile">
                <Form.Label className="fw-bold">Image file</Form.Label>
                <Form.Control
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  {...register("file", {
                    required: true,
                    validate: {
                      fileType: (files) => {
                        if (!files || files.length === 0) return true;
                        const file = files[0];
                        const validTypes = [
                          "image/jpeg",
                          "image/jpg",
                          "image/png",
                        ];
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
                  <Form.Text className="text-muted">
                    JPEG or PNG, max 5MB
                  </Form.Text>
                )}
                <Form.Control.Feedback type="invalid">
                  {errors.file?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="formImageSource">
                <Form.Label className="fw-bold">Image source</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="ex: https://www.legacy.com/us/obituaries/statesman/"
                  {...register("image_source", {
                    required: true,
                  })}
                  isInvalid={!!errors.image_source}
                />
                <Form.Text className="text-muted">
                  The URL or description of the original source of the image
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          {!errors.file && previewUrl && (
            <div className="d-flex mt-3 justify-content-center">
              <Image
                src={previewUrl}
                alt="Preview"
                style={{ maxWidth: "600px", maxHeight: "600px" }}
                fluid // Makes image responsive to parent width
              />
            </div>
          )}
          {!errors.file && imageUrl && !previewUrl && !isLoading && (
            <div className="d-flex mt-3 justify-content-center">
              <Image src={imageUrl} alt="Preview" fluid />
            </div>
          )}
          {isLoading && (
            <div className="d-flex align-items-center justify-content-center me-3">
              <Spinner animation="border" size="sm" />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting || !isFormComplete() || !isDirty}
          >
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
