import { useState } from "react";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useMutation } from "@/utils/graphql";
import { UPDATE_CRASH } from "@/queries/crash";
import { Crash, TableColumn } from "@/types/types";

type FormInputValue = string | number | boolean | null | undefined;

const InlineFormInput = ({
  initialValue,
  onSave,
  onCancel,
}: {
  initialValue: FormInputValue;
  onSave: (value: any) => Promise<any>;
  onCancel: () => void;
}) => {
  const [editValue, setEditValue] = useState<FormInputValue>(initialValue);

  return (
    <Form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSave(editValue);
      }}
    >
      <div className="mb-2">
        <Form.Control
          autoFocus
          size="sm"
          type="text"
          value={String(editValue || "")}
          onChange={(e) => setEditValue(e.target.value)}
        />
      </div>
      <div className="text-end">
        <span className="me-2">
          <Button size="sm" type="submit">
            Save
          </Button>
        </span>
        <span>
          <Button size="sm" onClick={onCancel} variant="danger">
            Cancel
          </Button>
        </span>
      </div>
    </Form>
  );
};

export default function CrashDataCard({
  crash,
  columns,
  title,
  refetch,
}: {
  crash: Crash;
  columns: TableColumn<Crash>[];
  title: string;
  refetch: () => void;
}) {
  // todo: loading state, error state
  const [editColumn, setEditColumn] = useState<TableColumn<Crash> | null>(null);
  const { mutate, loading: isMutating } = useMutation(UPDATE_CRASH);

  const onSave = async (value: any) => {
    await mutate({
      id: crash.id,
      updates: { [editColumn?.key as string]: value },
    });
    await refetch();
    setEditColumn(null);
  };

  const onCancel = () => setEditColumn(null);

  return (
    <Card>
      <Card.Header>{title}</Card.Header>
      <Card.Body>
        <Table striped hover size="sm">
          <tbody>
            {columns.map((col) => {
              const isEditingThisColumn = col.key === editColumn?.key;
              return (
                <tr
                  key={col.key}
                  style={{ cursor: col.editable ? "pointer" : "auto" }}
                  onClick={() => {
                    if (!col.editable) {
                      return;
                    }
                    if (!isEditingThisColumn) {
                      setEditColumn(col);
                    }
                  }}
                >
                  <td>{col.label}</td>
                  {!isEditingThisColumn && <td>{crash[col.key]}</td>}
                  {isEditingThisColumn && (
                    <td>
                      <InlineFormInput
                        initialValue={crash[col.key]}
                        onSave={onSave}
                        onCancel={onCancel}
                      />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}
