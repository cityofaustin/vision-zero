"use client";
import Card from "react-bootstrap/Card";
import AppBreadCrumb from "@/components/AppBreadCrumb";
import { crashesListViewColumns } from "@/configs/crashesListViewColumns";
import { crashesListViewQueryConfig } from "@/configs/crashesListViewTable";
import TableWrapper from "@/components/TableWrapper";
const localStorageKey = "crashesListViewQueryConfig";

export default function Crashes() {
  return (
    <>
      <AppBreadCrumb />
      <Card>
        <Card.Header className="fs-5 fw-bold">Crashes</Card.Header>
        <Card.Body>
          <TableWrapper
            columns={crashesListViewColumns}
            initialQueryConfig={crashesListViewQueryConfig}
            localStorageKey={localStorageKey}
          />
        </Card.Body>
      </Card>
    </>
  );
}
