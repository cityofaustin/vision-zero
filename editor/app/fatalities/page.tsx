"use client";
import { fatalitiesListViewColumns } from "@/configs/fatalitiesListViewColumns";
import { fatalitiesListViewQueryConfig } from "@/configs/fatalitiesListViewTable";
import TableWrapper from "@/components/TableWrapper";
const localStorageKey = "fatalitiesListViewQueryConfig";

export default function Fatalities() {
  return (
    <div className="h-100 d-flex flex-column">
      <div>
        <span className="fs-3 fw-bold">Fatalities</span>
      </div>
      <TableWrapper
        columns={fatalitiesListViewColumns}
        initialQueryConfig={fatalitiesListViewQueryConfig}
        localStorageKey={localStorageKey}
      />
    </div>
  );
}
