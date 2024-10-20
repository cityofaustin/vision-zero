import { useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import CrashDataCardInput from "./CrashDataCardInput";
import { useMutation, useQuery } from "@/utils/graphql";
import { gql } from "graphql-request";
import { UPDATE_CRASH } from "@/queries/crash";
import { KeyedMutator } from "swr";
import {
  Crash,
  InputType,
  TableColumn,
  LookupTableDef,
  LookupTableOption,
  HasuraLookupTableData,
  FormInputValue,
} from "@/types/types";

const handleValue = (
  value: FormInputValue,
  inputType?: InputType
): FormInputValue | null | boolean => {
  if (typeof value === "string") {
    // handle yes/no
    if (inputType === "yes_no") {
      if (value) {
        return value === "true";
      }
      return null;
    }
    // trim strings and cooerce empty to null
    return value.trim() || null;
  }
  return value;
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

/**
 * Render a field value
 * -- todo: this will be used by the table component as well
 */
const renderValue = (crash: Crash, col: TableColumn<Crash>) => {
  if (col.relationshipName) {
    const relatedObject = crash[col.relationshipName] as LookupTableOption;
    return relatedObject?.label;
  }
  if (col.inputType === "yes_no") {
    const value = crash[col.key];
    if (value === null) return "";
    return value ? "Yes" : "No";
  }
  return col.renderer ? col.renderer(crash) : String(crash[col.key] || "");
};

/**
 * Get the raw value for a field, using the relationship if needed
 */
const getValue = (crash: Crash, col: TableColumn<Crash>): FormInputValue => {
  if (col.relationshipName) {
    const relatedObject = crash[col.relationshipName] as LookupTableOption;
    return relatedObject?.id;
  }
  if (col.inputType === "yes_no") {
    const value = crash[col.key];
    if (value === null) return "";
    return value ? "true" : "false";
  }
  return String(crash[col.key] || "");
};

export default function CrashDataCard({
  crash,
  columns,
  isValidating,
  title,
  refetch,
}: {
  crash: Crash;
  columns: TableColumn<Crash>[];
  isValidating: boolean;
  title: string;
  refetch: KeyedMutator<{ crashes: Crash[] }>;
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

  const onSave = async (value: FormInputValue) => {
    await mutate({
      id: crash.id,
      updates: {
        [editColumn?.key as string]: handleValue(value, editColumn?.inputType),
      },
    });
    await refetch();
    setEditColumn(null);
  };

  const onCancel = () => setEditColumn(null);

  return (
    <Card>
      <Card.Header>{title}</Card.Header>
      <Card.Body>
        <Table striped hover>
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
                  <td style={{ textWrap: "nowrap" }} className="fw-bold">
                    {col.label}
                  </td>
                  {!isEditingThisColumn && <td>{renderValue(crash, col)}</td>}
                  {isEditingThisColumn && (
                    <td>
                      {isLoadingLookups && <Spinner size="sm" />}
                      {!isLoadingLookups && (
                        <CrashDataCardInput
                          initialValue={getValue(crash, col)}
                          onSave={onSave}
                          onCancel={onCancel}
                          inputType={col.inputType}
                          selectOptions={selectOptions}
                          isMutating={isMutating || isValidating}
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
