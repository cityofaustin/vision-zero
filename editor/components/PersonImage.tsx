import { useState, useEffect } from "react";
import { Image, Spinner } from "react-bootstrap";
import { useGetToken } from "@/utils/auth";

interface PersonImageProps {
  personId: number;
  onClick?: () => void;
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function PersonImage({ personId, onClick }: PersonImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getToken = useGetToken();

  useEffect(() => {
    let mounted = true;

    const fetchImage = async () => {
      if (!personId) {
        if (mounted) {
          setImageUrl(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const token = await getToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CR3_API_DOMAIN}/images/person/${personId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            if (mounted) {
              setImageUrl(null);
              setIsLoading(false);
            }
            return;
          }
          throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const data = await response.json();

        if (mounted) {
          setImageUrl(data.url);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching person image:", err);
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load image");
          setImageUrl(null);
          setIsLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      mounted = false;
    };
  }, [personId, getToken]);

  // Handle image loading errors
  const handleImageError = () => {
    setImageUrl(null);
    setError("Failed to load image");
  };

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center me-3">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  if (imageUrl && !error) {
    return (
      <Image
        alt="Person image"
        src={imageUrl}
        height={100}
        width={100}
        className="me-3"
        onClick={onClick}
        style={{
          cursor: onClick ? "pointer" : "default",
          objectFit: "cover",
          borderRadius: "4px",
        }}
        onError={handleImageError}
        loading="lazy"
      />
    );
  }

  return (
    <Image
      alt="placeholder"
      src={`${BASE_PATH}/assets/img/avatars/placeholder.png`}
      height={100}
      width={100}
      className="me-3"
      onClick={onClick}
    />
  );
}
