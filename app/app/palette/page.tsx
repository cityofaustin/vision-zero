"use client";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import AppBreadCrumb from "@/components/AppBreadCrumb";

interface Color {
  name: string;
  textColor: "white" | "dark";
}

const colors: Color[] = [
  { name: "dark", textColor: "white" },
  { name: "primary", textColor: "white" },
  { name: "secondary", textColor: "white" },
  { name: "light", textColor: "dark" },
  { name: "success", textColor: "white" },
  { name: "warning", textColor: "dark" },
  { name: "danger", textColor: "white" },
  { name: "info", textColor: "white" },
];

export default function Palette() {
  return (
    <>
      <AppBreadCrumb />
      {colors.map((color) => (
        <Row className="mb-2" key={color.name}>
          <Col className={`bg-${color.name} d-flex align-items-center rounded`}>
            <span className={`fs-4 text-${color.textColor}`}>{color.name}</span>
          </Col>
          <Col>
            <Alert variant={color.name}>{`Alert: ${color.name}`}</Alert>
          </Col>
          <Col>
            <Button variant={color.name}>{`${color.name} button`}</Button>
          </Col>
          <Col>
            <Button
              disabled
              variant={color.name}
            >{`disabled ${color.name} button`}</Button>
          </Col>
        </Row>
      ))}
    </>
  );
}
