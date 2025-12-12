"use client";
import Badge from "react-bootstrap/Badge";
import AlignedLabel from "@/components/AlignedLabel";
import { emsListViewColumns } from "@/configs/emsColumns";
import TableWrapper from "@/components/TableWrapper";
import UserEventsLogger from "@/components/UserEventsLogger";
import { emsListViewQueryConfig } from "@/configs/emsListViewTable";
import { FaCircleInfo } from "react-icons/fa6";
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
    <UserEventsLogger eventName="ems_list">
      <div className="h-100 d-flex flex-column">
        <div className="d-flex">
          <div className="fs-3 fw-bold me-2">EMS Patient care</div>
          <div className="align-self-center">
            <Badge bg="info">Beta</Badge>
          </div>
        </div>
        <div className="fw-light text-secondary mb-2">
          <AlignedLabel>
            <FaCircleInfo className="me-2" />
            <span>
              EMS analysis is currently in beta. Data may be inaccurate or change
              significantly as we continue to refine the system.
            </span>
          </AlignedLabel>
        </div>
        <TableWrapper
          columns={emsListViewColumns}
          initialQueryConfig={emsListViewQueryConfig}
          localStorageKey={localStorageKey}
          /**
           * Filters out records that have been soft deleted
           */
          contextFilters={isDeletedFilter}
          filtersEventName="ems_list_filters"
        />
      </div>
    </UserEventsLogger>
  );
}
