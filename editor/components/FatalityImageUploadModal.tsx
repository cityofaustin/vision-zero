import { Modal, Button, Form, Row, Col, InputGroup } from "react-bootstrap";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useGetToken } from "@/utils/auth";

interface FatalityImageUploadModalProps {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  victimName: string;
  personId: number;
}

interface FormData {
  file: FileList;
  image_source: string;
}

export default function FatalityImageUploadModal({
  showModal,
  setShowModal,
  victimName,
  personId,
}: FatalityImageUploadModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  // Validate form when fields change
  useEffect(() => {
    if (file?.length > 0 || imageSource) {
      trigger();
    }
  }, [file, imageSource, trigger]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

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

      setSuccess(true);

      // Close modal after successful upload
      setTimeout(() => {
        setShowModal(false);
        reset();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    setSuccess(false);
    setShowModal(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size
      const maxSizeMB = 10;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      if (selectedFile.size > maxSizeBytes) {
        setError(`File must be smaller than ${maxSizeMB}MB`);
        e.target.value = "";
      } else {
        setError(null);
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(selectedFile.type)) {
        setError("File must be JPEG, JPG or PNG");
        e.target.value = "";
      }
    }
  };

  // Check if both required fields are filled
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

          {success && (
            <div className="alert alert-success" role="alert">
              Image uploaded successfully!
            </div>
          )}

          <Row className="mb-3">
            <Col>
              <Form.Group controlId="formFile">
                <Form.Label>Image file (JPEG, JPG or PNG, max 10MB)</Form.Label>
                <Form.Control
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  {...register("file", {
                    required: "Image file is required",
                    validate: {
                      fileType: (files) => {
                        if (files && files.length > 0) {
                          const file = files[0];
                          const validTypes = [
                            "image/jpeg",
                            "image/jpg",
                            "image/png",
                          ];
                          return (
                            validTypes.includes(file.type) ||
                            "File must be JPEG or PNG image"
                          );
                        }
                        return true;
                      },
                      fileSize: (files) => {
                        if (files && files.length > 0) {
                          const file = files[0];
                          const maxSizeMB = 10;
                          const maxSizeBytes = maxSizeMB * 1024 * 1024;
                          return (
                            file.size <= maxSizeBytes ||
                            `File must be smaller than ${maxSizeMB}MB`
                          );
                        }
                        return true;
                      },
                    },
                  })}
                  onChange={handleFileChange}
                  isInvalid={!!errors.file}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.file?.message}
                </Form.Control.Feedback>
                {file && file.length > 0 && (
                  <div className="mt-2">
                    <small className="text-muted">
                      Selected: {file[0].name} (
                      {(file[0].size / 1024 / 1024).toFixed(2)} MB)
                    </small>
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group controlId="formImageSource">
                <InputGroup>
                  <InputGroup.Text>Image source</InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="https://www.legacy.com/us/obituaries/statesman/"
                    {...register("image_source", {
                      required: "Image source is required",
                      validate: (value) => {
                        return (
                          value.trim() !== "" || "Image source cannot be empty"
                        );
                      },
                    })}
                    isInvalid={!!errors.image_source}
                  />
                </InputGroup>
                <Form.Control.Feedback type="invalid">
                  {errors.image_source?.message}
                </Form.Control.Feedback>
                <Form.Text className="text-muted ms-2">
                  URL or description of source
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {!isFormComplete() && (file?.length > 0 || imageSource) && (
            <div className="mt-3">
              <small className="text-danger">
                Please fill out both required fields to enable upload
              </small>
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
