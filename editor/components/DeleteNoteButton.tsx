import Button from "react-bootstrap/Button";
import { useMutation } from "@/utils/graphql";
import AlignedLabel from "@/components/AlignedLabel";
import { LuTrash } from "react-icons/lu";
import { HeaderActionComponentProps } from "@/components/DataCard";
import PermissionsRequired from "@/components/PermissionsRequired";

const allowedDeleteNoteRoles = ["vz-admin", "editor"];

/**
 * Button which enables a note to be deleted
 */
export default function DeleteNoteButton<T extends Record<string, unknown>>({
  record,
  mutation,
  onSaveCallback,
}: HeaderActionComponentProps<T>) {
  const { mutate, loading: isMutating } = useMutation(mutation);

  return (
    <PermissionsRequired allowedRoles={allowedDeleteNoteRoles}>
      <Button
        size="sm"
        className="h-100"
        variant="secondary"
        disabled={isMutating}
        onClick={async () => {
          if (window.confirm("Are you sure you want to delete this note?")) {
            const variables = {
              id: record.id,
              updates: {
                is_deleted: true,
              },
            };
            await mutate(variables);
            if (onSaveCallback) await onSaveCallback();
          }
        }}
      >
        <AlignedLabel>
          <LuTrash className="me-2" />
          Delete
        </AlignedLabel>
      </Button>
    </PermissionsRequired>
  );
}
