"use client";
import { locationsListViewColumns } from "@/configs/locationsListViewColumns";
import { locationsListViewQueryConfig } from "@/configs/locationsListViewTable";
import TableWrapper from "@/components/TableWrapper";
import { useDocumentTitle } from "@/utils/documentTitle";

const localStorageKey = "locationsListViewQueryConfig";

export default function Locations() {
  useDocumentTitle("Locations");
  return (
    <div className="h-100 d-flex flex-column">
      <div>
        <span className="fs-3 fw-bold">Locations</span>
      </div>
      <TableWrapper
        columns={locationsListViewColumns}
        initialQueryConfig={locationsListViewQueryConfig}
        localStorageKey={localStorageKey}
      />
    </div>
  );
}
