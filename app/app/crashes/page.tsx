"use client";
import Card from "react-bootstrap/Card";
import AppBreadCrumb from "@/components/AppBreadCrumb";
import { crashesListViewColumns } from "@/configs/crashesListView";
import { crashesTableQueryConfig } from "@/configs/crashesTable";
import TableWrapper from "@/components/TableWrapper";
const localStorageKey = "crashesListViewQueryConfig";

export default function Crashes() {
  return (
    <>
      <AppBreadCrumb />
      <Card className="mx-3 mb-3">
        <Card.Header className="fs-5 fw-bold">Crashes</Card.Header>
        <Card.Body>
          <TableWrapper
            columns={crashesListViewColumns}
            initialQueryConfig={crashesTableQueryConfig}
            localStorageKey={localStorageKey}
          />
        </Card.Body>
      </Card>
    </>
  );
}
