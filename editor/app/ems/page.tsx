"use client";
import Badge from "react-bootstrap/Badge";
import Card from "react-bootstrap/Card";
import AlignedLabel from "@/components/AlignedLabel";
import { emsListViewColumns } from "@/configs/emsColumns";
import TableWrapper from "@/components/TableWrapper";
import { emsListViewQueryConfig } from "@/configs/emsListViewTable";
import { FaCircleInfo } from "react-icons/fa6";

const localStorageKey = "emsListQueryConfig";

export default function EMS() {
  return (
    <Card className="mt-3">
      <Card.Header>
        <div className="d-flex mb-2">
          <span className="fs-3 fw-bold me-2">EMS Patient care</span>
          <div className="align-self-center">
            <Badge bg="info">Beta</Badge>
          </div>
        </div>
        <Card.Subtitle className="fw-light text-secondary">
          <AlignedLabel>
            <FaCircleInfo className="me-2" />
            <span>
              EMS analysis is currently in beta. Data may be inaccurate or
              change significantly as we continue to refine the system.
            </span>
          </AlignedLabel>
        </Card.Subtitle>
      </Card.Header>
      <Card.Body>
        <TableWrapper
          columns={emsListViewColumns}
          initialQueryConfig={emsListViewQueryConfig}
          localStorageKey={localStorageKey}
        />
      </Card.Body>
    </Card>
  );
}
