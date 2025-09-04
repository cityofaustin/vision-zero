"use client";
import { fatalitiesListViewColumns } from "@/configs/fatalitiesListViewColumns";
import { fatalitiesListViewQueryConfig } from "@/configs/fatalitiesListViewTable";
import TableWrapper from "@/components/TableWrapper";
import { useDocumentTitle } from "@/utils/documentTitle";

const localStorageKey = "fatalitiesListViewQueryConfig";

export default function Fatalities() {
  useDocumentTitle("Fatalities");
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
