"use client";
import UserEventsLogger from "@/components/UserEventsLogger";
import TableWrapper from "@/components/TableWrapper";
import { useDocumentTitle } from "@/utils/documentTitle";
import { LuInfo } from "react-icons/lu";
import { Badge } from "react-bootstrap";
import { emsCrashesListColumns } from "@/configs/emsCrashesListColumns";
import { emsCrashesListViewQueryConfig } from "@/configs/emsCrashesListViewTable";

const localStorageKey = "vzListViewQueryConfigv2";

export default function Incidents() {
  useDocumentTitle("Incidents");

  return (
    <UserEventsLogger eventName="incidents_list_view">
      <div className="h-100 d-flex flex-column">
        <div className="d-flex">
          <div className="fs-3 fw-bold me-2">Incidents</div>
          <div className="align-self-center">
            <Badge bg="info">Beta</Badge>
          </div>
        </div>
        <div className="fw-light text-secondary d-flex align-items-center mb-2">
          <LuInfo className="me-2 flex-shrink-0" />
          <span>
            Incidents are currently in beta. Data may be inaccurate or change
            significantly as we continue to refine the system.
          </span>
        </div>
        <TableWrapper
          columns={emsCrashesListColumns}
          initialQueryConfig={emsCrashesListViewQueryConfig}
          localStorageKey={localStorageKey}
          filtersEventName="incidents_list_filters_toggle"
          mapEventName="incidents_map_toggle"
          downloadEventName="incidents_list_download_toggle"
        />
      </div>
    </UserEventsLogger>
  );
}
