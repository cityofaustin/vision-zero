"use client";
import { locationsListViewColumns } from "@/configs/locationsListViewColumns";
import { locationsListViewQueryConfig } from "@/configs/locationsListViewTable";
import TableWrapper from "@/components/TableWrapper";
import UserEventsLogger from "@/components/UserEventsLogger";
import { useDocumentTitle } from "@/utils/documentTitle";

const localStorageKey = "locationsListViewQueryConfig";

export default function Locations() {
  useDocumentTitle("Locations");
  return (
    <UserEventsLogger eventName="locations_list">
      <div className="h-100 d-flex flex-column">
        <div>
          <span className="fs-3 fw-bold">Locations</span>
        </div>
        <TableWrapper
          columns={locationsListViewColumns}
          initialQueryConfig={locationsListViewQueryConfig}
          localStorageKey={localStorageKey}
          filtersEventName="locations_list_filters"
        />
      </div>
    </UserEventsLogger>
  );
}
