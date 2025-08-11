import Alert from "react-bootstrap/Alert";
import { FaCircleInfo } from "react-icons/fa6";
import AlignedLabel from "./AlignedLabel";

/**
 * Banner that displays environment information when not in production
 */
export default function EnvironmentBadge() {
  const environment = process.env.NEXT_PUBLIC_APP_ENV;

  if (environment === "production") return null;

  const isLocal = environment === "local";

  return (
    <Alert variant={isLocal ? "warning" : "info"} className="my-auto py-0">
      <AlignedLabel>
        {isLocal ? (
          <FaCircleInfo className="me-2" />
        ) : (
          <FaCircleInfo className="me-2" />
        )}
        <span className="text-capitalize">{`${environment} environment`}</span>
      </AlignedLabel>
    </Alert>
  );
}
