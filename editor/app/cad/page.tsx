"use client";
import UserEventsLogger from "@/components/UserEventsLogger";
import { cadListViewColumns } from "@/configs/cadListViewColumns";
import { cadListViewQueryConfig } from "@/configs/cadListViewTable";
import TableWrapper from "@/components/TableWrapper";
import { useDocumentTitle } from "@/utils/documentTitle";


const localStorageKey = "cadListViewQueryConfig";

export default function Crashes() {
  useDocumentTitle("CAD Incidents");

  return (
    <UserEventsLogger eventName="cad_list_view">
      <div className="h-100 d-flex flex-column">
        <div className="d-flex justify-content-between">
          <span className="fs-3 fw-bold">CAD Incidents</span>
        </div>
        <TableWrapper
          columns={cadListViewColumns}
          initialQueryConfig={cadListViewQueryConfig}
          localStorageKey={localStorageKey}
          filtersEventName="cad_list_filters_toggle"
          mapEventName="cad_map_toggle"
          downloadEventName="cad_list_download_toggle"
        />
      </div>
    </UserEventsLogger>
  );
}
