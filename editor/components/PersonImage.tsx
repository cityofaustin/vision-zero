import { Image } from "react-bootstrap";

interface PersonImageProps {
  onClick?: () => void;
  imageUrl: string | null;
  isLoading: boolean;
  isReadOnlyUser: boolean;
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * Renders the person image based on a given URL, or a placeholder image
 */
export default function PersonImage({
  onClick,
  imageUrl,
  isLoading,
  isReadOnlyUser,
}: PersonImageProps) {
  if (isLoading) {
    return (
      <div
        className="me-3 p-1 image-loading rounded"
        style={{
          width: 100,
          height: 100,
        }}
      ></div>
    );
  } else if (imageUrl) {
    return (
      <Image
        alt="Photo of victim"
        src={imageUrl}
        height={100}
        width={100}
        className={`me-3 p-1 border rounded ${!isReadOnlyUser ? "editable-image" : ""}`}
        onClick={onClick}
        style={{
          objectFit: "cover", // crop & maintain aspect ratio
          objectPosition: "center", // centers the crop
        }}
      />
    );
  } else
    return (
      <Image
        alt="Placeholder image"
        src={`${BASE_PATH}/assets/img/avatars/placeholder.png`}
        height={100}
        width={100}
        className={`me-3 p-1 border rounded ${!isReadOnlyUser ? "editable-image" : ""}`}
        onClick={onClick}
      />
    );
}
