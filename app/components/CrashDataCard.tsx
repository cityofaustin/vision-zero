import { useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import { useMutation, useQuery } from "@/utils/graphql";
import { gql } from "graphql-request";
import { UPDATE_CRASH } from "@/queries/crash";
import {
  Crash,
  TableColumn,
  LookupTableDef,
  LookupTableOption,
  InputType,
  FormInputValue,
  HasuraLookupTableData,
} from "@/types/types";

const handleValue = (value: any) => {
  let newValue = value;
  if (typeof value === "string") {
    // trim strings and cooerce empty to null
    newValue = newValue.trim();
    newValue = newValue || null;
  }
  return newValue;
};

const useLookupQuery = (lookupTableDef: LookupTableDef | undefined) =>
  useMemo(() => {
    if (!lookupTableDef) {
      return [];
    }
    // construct the Hasura typename, which is prefixed with the schema name
    // if schema is not public
    const prefix =
      lookupTableDef.tableSchema === "public"
        ? ""
        : lookupTableDef.tableSchema + "_";

    const typeName = `${prefix}${lookupTableDef.tableName}`;

    return [
      gql`
      query LookupTableQuery {
        ${typeName} {
          id
          label
        }
      }
    `,
      typeName,
    ];
  }, [lookupTableDef]);

const InlineFormInput = ({
  initialValue,
  inputType,
  selectOptions,
  onSave,
  onCancel,
}: {
  initialValue: FormInputValue;
  inputType?: InputType;
  selectOptions?: LookupTableOption[];
  onSave: (value: any) => Promise<any>;
  onCancel: () => void;
}) => {
  // todo: input validation; input type = number
  const [editValue, setEditValue] = useState<FormInputValue>(initialValue);

  return (
    <Form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSave(editValue);
      }}
    >
      <div className="mb-2">
        {(inputType === "text" || inputType === "number") && (
          <Form.Control
            autoFocus
            size="sm"
            type="text"
            value={String(editValue || "")}
            onChange={(e) => setEditValue(e.target.value)}
          />
        )}
        {inputType === "select" && selectOptions && (
          <Form.Select
            autoFocus
            size="sm"
            value={String(editValue || "")}
            onChange={(e) => setEditValue(e.target.value)}
          >
            {selectOptions.map((option) => (
              <option value={option.id}>{option.label}</option>
            ))}
          </Form.Select>
        )}
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
  // todo: handling of null/undefined values in select input
  const [editColumn, setEditColumn] = useState<TableColumn<Crash> | null>(null);
  const { mutate, loading: isMutating } = useMutation(UPDATE_CRASH);
  const [query, typeName] = useLookupQuery(editColumn?.lookupTable);
  const { data: lookupData, isLoading: isLoadingLookups } =
    useQuery<HasuraLookupTableData>({
      query,
      // we don't need to refetch lookup table options
      options: { revalidateIfStale: false },
    });

  const selectOptions = lookupData?.[typeName];

  const onSave = async (value: any) => {
    await mutate({
      id: crash.id,
      updates: { [editColumn?.key as string]: handleValue(value) },
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
                  <td style={{ textWrap: "nowrap" }}>{col.label}</td>
                  {!isEditingThisColumn && <td>{crash[col.key]}</td>}
                  {isEditingThisColumn && (
                    <td>
                      {isLoadingLookups && <Spinner size="sm" />}
                      {!isLoadingLookups && (
                        <InlineFormInput
                          initialValue={crash[col.key]}
                          onSave={onSave}
                          onCancel={onCancel}
                          inputType={col.inputType}
                          selectOptions={selectOptions}
                        />
                      )}
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
