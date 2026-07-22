"use client";
import { emsListViewColumns } from "@/configs/emsColumns";
import TableWrapper from "@/components/TableWrapper";
import UserEventsLogger from "@/components/UserEventsLogger";
import { emsListViewQueryConfig } from "@/configs/emsListViewTable";
import { useDocumentTitle } from "@/utils/documentTitle";
import { Filter } from "@/types/queryBuilder";

const localStorageKey = "emsListQueryConfig";

const isDeletedFilter: Filter[] = [
  {
    id: "is_deleted",
    value: false,
    column: "is_deleted",
    operator: "_eq",
  },
];

export default function EMS() {
  useDocumentTitle("EMS");
  return (
    <UserEventsLogger eventName="ems_list_view">
      <div className="h-100 d-flex flex-column">
        <div className="fs-3 fw-bold me-2">EMS Patient care</div>
        <TableWrapper
          columns={emsListViewColumns}
          initialQueryConfig={emsListViewQueryConfig}
          localStorageKey={localStorageKey}
          /**
           * Filters out records that have been soft deleted
           */
          contextFilters={isDeletedFilter}
          filtersEventName="ems_list_filters_toggle"
          mapEventName="ems_list_map_toggle"
        />
      </div>
    </UserEventsLogger>
  );
}
