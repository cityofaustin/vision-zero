"use client";
import UserEventsLogger from "@/components/UserEventsLogger";
import { vzListViewColumns } from "@/configs/vzListViewColumns";
import { vzListViewQueryConfig } from "@/configs/vzListViewTable";
import TableWrapper from "@/components/TableWrapper";
import { useDocumentTitle } from "@/utils/documentTitle";
import AlignedLabel from "@/components/AlignedLabel";
import { LuInfo } from "react-icons/lu";
import { Badge } from "react-bootstrap";

const localStorageKey = "vzListViewQueryConfig";

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
        <div className="fw-light text-secondary mb-2">
          <AlignedLabel>
            <LuInfo className="me-2" />
            <span>
              Incidents are currently in beta. Data may be inaccurate or change
              significantly as we continue to refine the system.
            </span>
          </AlignedLabel>
        </div>
        <TableWrapper
          columns={vzListViewColumns}
          initialQueryConfig={vzListViewQueryConfig}
          localStorageKey={localStorageKey}
          filtersEventName="incidents_list_filters_toggle"
          mapEventName="incidents_map_toggle"
          downloadEventName="incidents_list_download_toggle"
        />
      </div>
    </UserEventsLogger>
  );
}
