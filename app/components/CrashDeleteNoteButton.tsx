import Button from "react-bootstrap/Button";
import { useMutation } from "@/utils/graphql";
import AlignedLabel from "@/components/AlignedLabel";
import { FaTrashCan } from "react-icons/fa6";
import { HeaderActionComponentProps } from "@/components/DataCard";
import PermissionsRequired from "@/components/PermissionsRequired";
import { DELETE_CRASH_NOTE } from "@/queries/notes";

const allowedDeleteCrashNoteRoles = ["vz-admin", "editor"];

/**
 * Button which enables a crash note to be deleted
 */
export default function CrashDeleteNoteButton<
  T extends Record<string, unknown>,
>({ record, onSaveCallback }: HeaderActionComponentProps<T>) {
  // todo: soft-delete crash notes
  // https://github.com/cityofaustin/atd-data-tech/issues/19046
  const { mutate, loading: isMutating } = useMutation(DELETE_CRASH_NOTE);

  return (
    <PermissionsRequired allowedRoles={allowedDeleteCrashNoteRoles}>
      <div>
        <Button
          size="sm"
          variant="secondary"
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
      </div>
    </PermissionsRequired>
  );
}
