"use client";
import { fatalitiesListViewColumns } from "@/configs/fatalitiesListViewColumns";
import { fatalitiesListViewQueryConfig } from "@/configs/fatalitiesListViewTable";
import TableWrapper from "@/components/TableWrapper";
import UserEventsLogger from "@/components/UserEventsLogger";
import { useDocumentTitle } from "@/utils/documentTitle";

const localStorageKey = "fatalitiesListViewQueryConfig";

export default function Fatalities() {
  useDocumentTitle("Fatalities");
  return (
    <UserEventsLogger eventName="fatalities_list_view">
      <div className="h-100 d-flex flex-column">
        <div>
          <span className="fs-3 fw-bold">Fatalities</span>
        </div>
        <TableWrapper
          columns={fatalitiesListViewColumns}
          initialQueryConfig={fatalitiesListViewQueryConfig}
          localStorageKey={localStorageKey}
          filtersEventName="fatalities_list_filters_toggle"
        />
      </div>
    </UserEventsLogger>
  );
}
