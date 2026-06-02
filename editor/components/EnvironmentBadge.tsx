import Alert from "react-bootstrap/Alert";
import AlignedLabel from "./AlignedLabel";
import { LuInfo } from "react-icons/lu";

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
        <LuInfo className="me-2" />
        <span className="text-capitalize">{`${environment} environment`}</span>
      </AlignedLabel>
    </Alert>
  );
}
