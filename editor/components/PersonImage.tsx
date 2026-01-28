import { Image, Spinner } from "react-bootstrap";
import { useGetPersonImage } from "@/utils/getPersonImage";

interface PersonImageProps {
  personId: number;
  onClick?: () => void;
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function PersonImage({ personId, onClick }: PersonImageProps) {
  const { imageUrl, isLoading } = useGetPersonImage(personId);

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
