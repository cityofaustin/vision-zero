import { useRouter } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { FaTrash, FaTriangleExclamation } from "react-icons/fa6";
import AlignedLabel from "./AlignedLabel";
import { useMutation } from "@/utils/graphql";
import { DELETE_CRIS_CRASH } from "@/queries/crash";

interface CrashIsTemporaryBannerProps {
  crashId: number;
}

/**
 * Banner that alerts the user when viewing a "temporary" crash record, aka
 * a crash record that was manually created through the UI
 */
export default function CrashIsTemporaryBanner({
  crashId,
}: CrashIsTemporaryBannerProps) {
  const { user } = useAuth0();
  const { mutate, loading: isMutating } = useMutation(DELETE_CRIS_CRASH);
  const router = useRouter();

  return (
    <Alert
      variant="warning"
      className="d-flex justify-content-between align-items-center"
    >
      <span className="d-flex align-items-center">
        <FaTriangleExclamation className="me-2 d-none d-lg-inline" />
        <span className="me-3">
          This crash record was created by the Vision Zero team and serves as a
          placeholder until the CR3 report is received from TxDOT. It may be
          deleted at any time.
        </span>
      </span>
      <span>
        <Button
          variant="danger"
          onClick={async () => {
            if (
              window.confirm(
                "Are you sure you want to delete this crash record?"
              )
            ) {
              await mutate({ id: crashId, updated_by: user?.email });
              router.push("/create-crash-record");
            }
          }}
          disabled={isMutating}
        >
          <AlignedLabel>
            {isMutating ? (
              <Spinner size="sm" />
            ) : (
              <>
                <FaTrash className="me-2" />
                <span>Delete</span>
              </>
            )}
          </AlignedLabel>
        </Button>
      </span>
    </Alert>
  );
}
