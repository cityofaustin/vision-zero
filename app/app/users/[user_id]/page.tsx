"use client";
import Card from "react-bootstrap/Card";
import AppBreadCrumb from "@/components/AppBreadCrumb";

export default function UserDetails() {
  return (
    <>
      <AppBreadCrumb />
      <Card>
        <Card.Header className="fs-5 fw-bold">User Details</Card.Header>
        <Card.Body>
          <p>hello user</p>
        </Card.Body>
      </Card>
    </>
  );
}
