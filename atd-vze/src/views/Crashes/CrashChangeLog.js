import { useMemo } from "react";

import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Table,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { formatDateTimeString } from "../../helpers/format";

const useChangeLogData = data =>
  useMemo(() => {
    if (!data || !data?.crashes_by_pk) {
      return [];
    }
    const changes = [];
    const crash = data?.crashes_by_pk;
    const crashChanges = crash.change_log.map(change => {
      change.record_type = "crash";
      return change;
    });
    return data;
  }, [data]);

export default function CrashChangeLog({ data }) {
  console.log("HI", data);
  return (
    <Card>
      <CardHeader>Changes</CardHeader>
      <CardBody>
        <Table responsive striped hover>
          <thead>
            <th>id</th>
          </thead>
          <tbody></tbody>
        </Table>
      </CardBody>
    </Card>
  );
}
