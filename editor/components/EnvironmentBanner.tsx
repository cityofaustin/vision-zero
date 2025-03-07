import Alert from "react-bootstrap/Alert";
import { FaCircleInfo, FaTriangleExclamation } from "react-icons/fa6";
import AlignedLabel from "./AlignedLabel";

/**
 * Banner that displays environment information when not in production
 */
export default function EnvironmentBanner() {
  const environment = process.env.NEXT_PUBLIC_APP_ENV;

  if (environment === "production") return null;

  const isLocal = environment === "local";
  
  return (
    <Alert 
      variant={isLocal ? "warning" : "info"} 
      className="mb-0 rounded-0"
    >
      <AlignedLabel>
        {isLocal ? (
          <FaTriangleExclamation className="me-2" />
        ) : (
          <FaCircleInfo className="me-2" />
        )}
        <span>
          This is a <b>{environment}</b> environment for testing purposes.
        </span>
      </AlignedLabel>
    </Alert>
  );
} 