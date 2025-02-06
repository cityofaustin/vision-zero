"use client";
import Card from "react-bootstrap/Card";
import { locationsListViewColumns } from "@/configs/locationsListViewColumns";
import { locationsListViewQueryConfig } from "@/configs/locationsListViewTable";
import TableWrapper from "@/components/TableWrapper";

const localStorageKey = "locationsListViewQueryConfig";

export default function Locations() {
  return (
    <Card className="mt-3">
      <Card.Header className="fs-3 fw-bold">Locations</Card.Header>
      <Card.Body>
        <TableWrapper
          columns={locationsListViewColumns}
          initialQueryConfig={locationsListViewQueryConfig}
          localStorageKey={localStorageKey}
        />
      </Card.Body>
    </Card>
  );
}
