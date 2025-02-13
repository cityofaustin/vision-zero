import Button from "react-bootstrap/Button";
import { useMutation } from "@/utils/graphql";
import AlignedLabel from "@/components/AlignedLabel";
import { FaTrashCan } from "react-icons/fa6";
import { HeaderActionComponentProps } from "@/components/DataCard";
import PermissionsRequired from "@/components/PermissionsRequired";

const allowedDeleteCrashNoteRoles = ["vz-admin", "editor"];

/**
 * Button which enables a crash note to be deleted
 */
export default function DeleteNoteButton<T extends Record<string, unknown>>({
  record,
  mutation,
  onSaveCallback,
}: HeaderActionComponentProps<T>) {
  const { mutate, loading: isMutating } = useMutation(mutation);

  return (
    <PermissionsRequired allowedRoles={allowedDeleteCrashNoteRoles}>
      <Button
        size="sm"
        variant="outline-danger"
        disabled={isMutating}
        onClick={async () => {
          if (window.confirm("Are you sure you want to delete this note?")) {
            await mutate({
              id: record.id,
            });
            await onSaveCallback();
          }
        }}
      >
        <AlignedLabel>
          <FaTrashCan className="me-2" />
          <span>Delete</span>
        </AlignedLabel>
      </Button>
    </PermissionsRequired>
  );
}
