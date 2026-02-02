import { Modal, Button, Form, Row, Col, Image, Spinner } from "react-bootstrap";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useGetToken } from "@/utils/auth";
import { MAX_SIZE_MB, MAX_SIZE_BYTES } from "@/utils/constants";

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
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const getToken = useGetToken();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    watch,
    trigger,
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      file: undefined,
      image_source: "",
    },
  });

  const file = watch("file");
  const imageSource = watch("image_source");

  // Validates form when fields change
  useEffect(() => {
    if (file?.length > 0 || imageSource) {
      trigger();
    }
  }, [file, imageSource, trigger]);

  // Cleanup previewURL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Uploads the image to the API
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);
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
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setError(null);
      setShowModal(false);
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreviewUrl(null);
    setError(null);
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(selectedFile.type)) {
        setError("File must be JPEG, JPG or PNG");
        e.target.value = "";
        return;
      }

      // Validate file size
      if (selectedFile.size > MAX_SIZE_BYTES) {
        setError(`File must be smaller than ${MAX_SIZE_MB}MB`);
        e.target.value = "";
        return;
      }

      // Finally if file is valid, create preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const isFormComplete = () => {
    return file?.length > 0 && imageSource && imageSource.trim() !== "";
  };

  return (
    <Modal show={showModal} size="lg" onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{`Photo | ${victimName}`}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="formFile">
                <Form.Label className="fw-bold">Image file</Form.Label>
                <Form.Control
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  {...register("file", {
                    required: true,
                  })}
                  onChange={handleFileChange}
                  isInvalid={!!errors.file}
                />
                <Form.Text className="text-muted">
                  JPEG or PNG, max 5MB
                </Form.Text>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="formImageSource">
                <Form.Label className="fw-bold">Image source</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="https://www.legacy.com/us/obituaries/statesman/"
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
          {previewUrl && (
            <div className="d-flex mt-3 justify-content-center">
              <Image
                src={previewUrl}
                alt="Preview"
                style={{ maxWidth: "600px", maxHeight: "600px" }}
              />
            </div>
          )}
          {imageUrl && !previewUrl && !isLoading && (
            <div className="d-flex mt-3 justify-content-center">
              <Image
                src={imageUrl}
                alt="Preview"
                style={{ maxWidth: "600px", maxHeight: "600px" }}
              />
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
