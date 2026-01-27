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

  const getToken = useGetToken();

  useEffect(() => {
    const fetchImage = async () => {
      if (!personId) {
        setImageUrl(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

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

        // No image exists
        if (response.status === 404) {
          setImageUrl(null);
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setImageUrl(data.url);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching person image:", err);
        setImageUrl(null);
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [personId, getToken]);

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center me-3">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  if (imageUrl) {
    return (
      <Image
        alt="Person image"
        src={imageUrl}
        height={100}
        width={100}
        className="me-3"
        onClick={onClick}
        style={{
          cursor: "pointer",
          objectFit: "cover", // crop & maintain aspect ratio
          objectPosition: "center", // centers the crop
        }}
      />
    );
  }

  return (
    <Image
      alt="placeholder"
      src={`${BASE_PATH}/assets/img/avatars/placeholder.png`}
      style={{
        cursor: "pointer",
      }}
      height={100}
      width={100}
      className="me-3"
      onClick={onClick}
    />
  );
}
