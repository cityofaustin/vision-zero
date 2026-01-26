import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  Image,
} from "react-bootstrap";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useGetToken } from "@/utils/auth";

interface FatalityImageUploadModalProps {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  victimName: string;
  personId: number;
  setImageVersion: Dispatch<SetStateAction<number>>;
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
  setImageVersion,
}: FatalityImageUploadModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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

  // Validate form when fields change
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
      setImageVersion((prev) => prev + 1);

      // Close modal after successful upload
      setTimeout(() => {
        setShowModal(false);
        reset();
        setSuccess(false);
      }, 2000);
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
    setPreviewUrl(null);
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
      const maxSizeMB = 5;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (selectedFile.size > maxSizeBytes) {
        setError(`File must be smaller than ${maxSizeMB}MB`);
        e.target.value = "";
        return;
      }

      // Finally if file is valid, create preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
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
                <Form.Label>Image file (JPEG, JPG or PNG, max 5MB)</Form.Label>
                <Form.Control
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  {...register("file", {
                    required: "Image file is required",
                  })}
                  onChange={handleFileChange}
                  isInvalid={!!errors.file}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.file?.message}
                </Form.Control.Feedback>
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
                    })}
                    isInvalid={!!errors.image_source}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.image_source?.message}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
          {previewUrl && (
            <div className="mt-3">
              <Image
                src={previewUrl}
                alt="Preview"
                style={{ maxWidth: "600px", maxHeight: "600px" }}
                className="img-thumbnail"
              />
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
