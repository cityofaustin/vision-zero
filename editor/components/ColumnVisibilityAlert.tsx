import AlignedLabel from "@/components/AlignedLabel";
import Alert from "react-bootstrap/Alert";
import { LuSettings } from "react-icons/lu";

/**
 * Component that alerts users that all columns have been hidden
 */
export default function ColumnVisibilityAlert({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="d-flex justify-content-center align-items-center ">
      <Alert variant="light">
        <AlignedLabel>
          <span>
            <LuSettings className="fs-5" /> Use the settings menu to unhide
            columns
          </span>
        </AlignedLabel>
      </Alert>
    </div>
  );
}
