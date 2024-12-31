import Alert from "react-bootstrap/Alert";
import { FaTriangleExclamation } from "react-icons/fa6";
import AlignedLabel from "./AlignedLabel";

interface CrashLocationBannerProps {
  /**
   * If the crash occurred on a private drive
   */
  privateDriveFlag: boolean | null;
}

/**
 * Crash Location Banner is rendered if private flag drive is true or austin full purpose flag is false.
 */
export default function CrashLocationBanner({
  privateDriveFlag,
}: CrashLocationBannerProps) {
  return (
    <Alert variant="warning">
      <AlignedLabel>
        <FaTriangleExclamation className="me-2" />
        <span className="me-3">
          This crash is not included in Vision Zero statistical reporting
          because{" "}
          {privateDriveFlag
            ? "it occurred on a private drive"
            : "it is located outside of the Austin full purpose jurisdiction"}
        </span>
      </AlignedLabel>
    </Alert>
  );
}
