import React, { Component } from "react";

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

export default function CrashChangeLog({ data }) {
  console.log("HI", data);
  return (
    <Card >
      <CardHeader>Changes</CardHeader>
      <CardBody></CardBody>
    </Card>
  );
}
