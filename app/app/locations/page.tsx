"use client";
import Card from "react-bootstrap/Card";
import AppBreadCrumb from "@/components/AppBreadCrumb";
import { locationsListViewColumns } from "@/configs/locationsListViewColumns";
import { locationsListViewQueryConfig } from "@/configs/locationsListViewTable";
import TableWrapper from "@/components/TableWrapper";

const localStorageKey = "locationsListViewQueryConfig";

export default function Locations() {
  return (
    <>
      <AppBreadCrumb />
      <Card>
        <Card.Header className="fs-5 fw-bold">Locations</Card.Header>
        <Card.Body>
          <TableWrapper
            columns={locationsListViewColumns}
            initialQueryConfig={locationsListViewQueryConfig}
            localStorageKey={localStorageKey}
          />
        </Card.Body>
      </Card>
    </>
  );
}
