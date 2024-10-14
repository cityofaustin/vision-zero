import { useState } from "react";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Crash, TableColumn } from "@/types/types";

type FormInputValue = string | number | boolean | null | undefined;

const InlineFormInput = ({
  initialValue,
  onSave,
}: {
  initialValue: FormInputValue;
  onSave: () => void;
}) => {
  const [editValue, setEditValue] = useState<FormInputValue>(initialValue);
  return (
    <div>
      <div className="mb-2">
        <Form>
          <Form.Control
            autoFocus
            size="sm"
            type="text"
            value={String(editValue || "")}
            onChange={(e) => setEditValue(e.target.value)}
          />
        </Form>
      </div>
      <div className="text-end">
        <span className="me-2">
          <Button size="sm" onClick={onSave}>
            Save
          </Button>
        </span>
        <span>
          <Button size="sm" onClick={onSave} variant="danger">
            Cancel
          </Button>
        </span>
      </div>
    </div>
  );
};

export default function CrashDataCard({
  crash,
  columns,
  title,
}: {
  crash: Crash;
  columns: TableColumn<Crash>[];
  title: string;
}) {
  const [editColumn, setEditColumn] = useState<TableColumn<Crash> | null>(null);
  const onSave = () => setEditColumn(null);
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
