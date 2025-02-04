"use client";
import Card from "react-bootstrap/Card";
import AppBreadCrumb from "@/components/AppBreadCrumb";
import { fatalitiesListViewColumns } from "@/configs/fatalitiesListViewColumns";
import { fatalitiesListViewQueryConfig } from "@/configs/fatalitiesListViewTable";
import TableWrapper from "@/components/TableWrapper";
const localStorageKey = "fatalitiesListViewQueryConfig";

export default function Fatalities() {
  return (
    <>
      <AppBreadCrumb />
      <Card>
        <Card.Header className="fs-5 fw-bold">Fatalities</Card.Header>
        <Card.Body>
          <TableWrapper
            columns={fatalitiesListViewColumns}
            initialQueryConfig={fatalitiesListViewQueryConfig}
            localStorageKey={localStorageKey}
          />
        </Card.Body>
      </Card>
    </>
  );
}
