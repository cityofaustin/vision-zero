"use client";
import UserEventsLogger from "@/components/UserEventsLogger";
import { vzListViewColumns } from "@/configs/vzListViewColumns";
import { vzListViewQueryConfig } from "@/configs/vzListViewTable";
import TableWrapper from "@/components/TableWrapper";
import { useDocumentTitle } from "@/utils/documentTitle";


const localStorageKey = "vzListViewQueryConfig";

export default function Crashes() {
  useDocumentTitle("Incidents");

  return (
    <UserEventsLogger eventName="cad_list_view">
      <div className="h-100 d-flex flex-column">
        <div className="d-flex justify-content-between">
          <span className="fs-3 fw-bold">Incidents</span>
        </div>
        <TableWrapper
          columns={vzListViewColumns}
          initialQueryConfig={vzListViewQueryConfig}
          localStorageKey={localStorageKey}
          filtersEventName="vz_list_filters_toggle"
          mapEventName="vz_map_toggle"
          downloadEventName="vz_list_download_toggle"
        />
      </div>
    </UserEventsLogger>
  );
}
