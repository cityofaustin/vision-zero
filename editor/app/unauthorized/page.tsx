"use client";
import { useRouter } from "next/navigation";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { LuShieldAlert } from "react-icons/lu";
import { SERVICE_REQUEST_URL } from "@/utils/serviceRequest";

export default function Unauthorized() {
  const router = useRouter();
  return (
    <div className="d-flex flex-column flex-grow-1 justify-content-center h-100">
      <Row className="d-flex justify-content-center">
        <Col xs={6} md={3} className="text-center">
          <LuShieldAlert size="4rem" className="text-muted" />
        </Col>
      </Row>
      <Row className="d-flex justify-content-center my-4">
        <Col className="text-center">
          <h2>Not Authorized</h2>
          <h5 className="text-muted">
            You don&apos;t have permission to view this page. If you need
            access, you can{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href={SERVICE_REQUEST_URL}
            >
              ask for help
            </a>
            .
          </h5>
          <div className="my-3">
            <Button onClick={() => router.back()}>Go back</Button>
          </div>
        </Col>
      </Row>
    </div>
  );
}
