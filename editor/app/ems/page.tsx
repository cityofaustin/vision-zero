"use client";
import Card from "react-bootstrap/Card";
import { emsListViewColumns } from "@/configs/emsColumns";
import TableWrapper from "@/components/TableWrapper";
import { emsListViewQueryConfig } from "@/configs/emsListViewTable";
const localStorageKey = "emsListQueryConfig";

export default function EMS() {
  return (
    <>
      <Card className="mt-3">
        <Card.Header className="fs-3 fw-bold">EMS Patient care</Card.Header>
        <Card.Body>
          <TableWrapper
            columns={emsListViewColumns}
            initialQueryConfig={emsListViewQueryConfig}
            localStorageKey={localStorageKey}
          />
        </Card.Body>
      </Card>
    </>
  );
}
