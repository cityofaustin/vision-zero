import Alert from "react-bootstrap/Alert";

interface CrashLocationBannerProps {
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
      This crash is not included in Vision Zero statistical reporting because{" "}
      {privateDriveFlag
        ? "it occurred on a private drive"
        : "it is located outside of the Austin full purpose jurisdiction"}
    </Alert>
  );
}
