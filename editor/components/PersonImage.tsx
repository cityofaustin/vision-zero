import { Image, Spinner } from "react-bootstrap";

interface PersonImageProps {
  onClick?: () => void;
  imageUrl: string | null;
  isLoading: boolean;
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * Renders the person image based on a given URL, or a placeholder image
 */
export default function PersonImage({
  onClick,
  imageUrl,
  isLoading,
}: PersonImageProps) {
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
        className="me-3 p-1 border rounded editable-image"
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
      className="me-3 p-1 border rounded editable-image"
      onClick={onClick}
    />
  );
}
