import { useState } from "react";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import DataCardInput from "./DataCardInput";
import { useMutation, useQuery, useLookupQuery } from "@/utils/graphql";
import { FaTrash, FaPencil } from "react-icons/fa6";
import {
  getRecordValue,
  renderColumnValue,
  valueToString,
  handleFormValueOutput,
} from "@/utils/formHelpers";
import { ColDataCardDef } from "@/types/types";
import { LookupTableOption } from "@/types/relationships";

interface RelatedRecordTableRowProps<T extends Record<string, unknown>> {
  record: T;
  columns: ColDataCardDef<T>[];
  mutation: string;
  deleteMutation?: string;
  isValidating: boolean;
  onSaveCallback: () => Promise<void>;
  mutationVariables?: (variables: { id: number; updates: Record<string, unknown> }) => { id: number; updates: Record<string, unknown> };
  currentUserEmail?: string;
  quickEditColumn?: string;
}

/**
 * Generic component which renders editable fields in a table row
 *
 * // todo: there is much shared code between this component and
 * the DataCard component. Essentially the only diff between the
 * two is row vs column layout 🤔
 */
export default function RelatedRecordTableRow<
  T extends Record<string, unknown>
>({
  record,
  columns,
  mutation,
  deleteMutation,
  isValidating,
  onSaveCallback,
  mutationVariables,
  currentUserEmail,
  quickEditColumn,
}: RelatedRecordTableRowProps<T>) {
  // todo: loading state, error state
  // todo: handling of null/undefined values in select input
  const [editColumn, setEditColumn] = useState<ColDataCardDef<T> | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { mutate, loading: isMutating } = useMutation(mutation);
  const { mutate: deleteRecord } = useMutation(deleteMutation || "");
  const [query, typename] = useLookupQuery(
    editColumn?.editable && editColumn?.relationship
      ? editColumn.relationship
      : undefined
  );
  const { data: selectOptions, isLoading: isLoadingLookups } =
    useQuery<LookupTableOption>({
      query,
      // we don't need to refetch lookup table options
      options: { revalidateIfStale: false },
      typename,
    });

  const onSave = async (
    recordId: number, 
    value: unknown, 
    context?: { type: string; [key: string]: unknown }
  ) => {
    if (!editColumn) {
      // not possible
      return;
    }
    // Save the value to the foreign key column, if exists
    const saveColumnName = editColumn.relationship?.foreignKey
      ? editColumn.relationship?.foreignKey
      : editColumn.path;

    const variables = {
      id: recordId,
      updates: {
        [saveColumnName]: value,
      },
    }; 

    if (context?.type === "note") {
      await mutate(mutationVariables ? mutationVariables(variables) : variables, { skip_updated_by_setter: true });
    } else {
      await mutate(variables);
    }

    await onSaveCallback();
    setEditColumn(null);
  };

  const onCancel = () => setEditColumn(null);

  const handleDelete = async () => {
    if (!deleteMutation) return;
    await deleteRecord({ id: Number(record.id) });
    await onSaveCallback();
    setShowDeleteModal(false);
  };

  return (
    <>
      <tr>
        {columns.map((col) => {
          const isEditingThisColumn = col.path === editColumn?.path;
          const isEditable = col.editable && 
            (!col.editableCheck || col.editableCheck(record, currentUserEmail));

          if (col.path === "actions") {
            return (
              <td key={String(col.path)} style={col.style}>
                {record.user_email === currentUserEmail && !editColumn && (
                  <div className="d-flex">
                    <Button
                      variant="link"
                      className="text-primary p-0 me-2"
                      onClick={() => {
                        const editableColumn = columns.find(c => c.path === quickEditColumn);
                        if (editableColumn) {
                          setEditColumn(editableColumn);
                        }
                      }}
                    >
                      <FaPencil />
                    </Button>
                    <Button
                      variant="link"
                      className="text-danger p-0"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                )}
              </td>
            );
          }

          return (
            <td
              key={String(col.path)}
              style={{
                cursor: isEditable && !isEditingThisColumn ? "pointer" : "auto",
                ...(col.style || {}),
              }}
              onClick={() => {
                if (!isEditable) {
                  return;
                }
                if (!isEditingThisColumn) {
                  setEditColumn(col);
                }
              }}
            >
              {!isEditingThisColumn && renderColumnValue(record, col)}
              {isEditingThisColumn && (
                <>
                  {isLoadingLookups && <Spinner size="sm" />}
                  {!isLoadingLookups && (
                    <DataCardInput
                      initialValue={valueToString(
                        getRecordValue(record, col, true),
                        col
                      )}
                      onSave={(value: string) =>
                        onSave(
                          Number(record.id),
                          handleFormValueOutput(
                            value,
                            !!col.relationship,
                            col.inputType
                          ),
                          { type: col.label === "Note" ? "note" : "default" }
                        )
                      }
                      onCancel={onCancel}
                      inputType={col.inputType}
                      selectOptions={selectOptions}
                      isMutating={isMutating || isValidating}
                    />
                  )}
                </>
              )}
            </td>
          );
        })}
      </tr>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this note?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
