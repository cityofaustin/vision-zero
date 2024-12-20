"use client";
import { useState, useCallback } from "react";
import { notFound } from "next/navigation";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import { FaUserEdit, FaUserAltSlash } from "react-icons/fa";
import AlignedLabel from "@/components/AlignedLabel";
import AppBreadCrumb from "@/components/AppBreadCrumb";
import UserModal from "@/components/UserModal";
import { useToken, formatRoleName } from "@/utils/auth";
import { useUser } from "@/utils/users";
import { User } from "@/types/users";
import { formatDateTime } from "@/utils/formatters";

type UserColumn = {
  name: keyof User;
  label: string;
  renderer?: (user: User) => string;
};

// todo: this can be extended and used for the user list table column sorting, etc
const COLUMNS: UserColumn[] = [
  {
    name: "app_metadata",
    label: "Role",
    renderer: (user) => formatRoleName(user.app_metadata.roles[0]) || "",
  },
  { name: "name", label: "Name" },
  { name: "email", label: "Email" },
  { name: "last_ip", label: "Last IP address" },
  { name: "logins_count", label: "Login count" },
  {
    name: "created_at",
    label: "Created at",
    renderer: (user) => formatDateTime(user.created_at),
  },
  {
    name: "last_login",
    label: "Last login",
    renderer: (user) => formatDateTime(user.last_login),
  },
  {
    name: "updated_at",
    label: "Updated at",
    renderer: (user) => formatDateTime(user.updated_at),
  },
];

export default function UserDetails({
  params,
}: {
  params: { user_id: string };
}) {
  const token = useToken();
  const userId = params.user_id;
  const { data: user, mutate } = useUser(userId, token);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const onCloseModal = () => setShowNewUserModal(false);

  const onUpdateUserCallback = useCallback(async () => {
    // refetch the user details and close
    await mutate();
    setShowNewUserModal(false);
  }, [mutate]);

  if (user && "error" in user) {
    // 404
    notFound();
  }

  return (
    <>
      <AppBreadCrumb />
      <Row>
        <Col md={12} lg={6}>
          <Card>
            <Card.Header className="fs-5 fw-bold">User details</Card.Header>
            <Card.Body>
              {!user && <Spinner variant="primary" />}
              <div className="mb-3">
                {user && (
                  <>
                    <Button
                      className="me-2"
                      onClick={() => setShowNewUserModal(true)}
                    >
                      <AlignedLabel>
                        <FaUserEdit className="me-2" />
                        <span>Edit</span>
                      </AlignedLabel>
                    </Button>
                    <Button variant="danger" disabled>
                      {/* todo */}
                      <AlignedLabel>
                        <FaUserAltSlash className="me-2" />
                        <span>Delete</span>
                      </AlignedLabel>
                    </Button>
                  </>
                )}
              </div>
              {user && (
                <Table responsive hover>
                  <tbody>
                    {COLUMNS.map((col) => (
                      <tr key={col.name}>
                        <td>{col.label}</td>
                        <td>
                          {col.renderer
                            ? col.renderer(user)
                            : String(user[col.name] || "")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {user && (
        <UserModal
          onClose={onCloseModal}
          show={showNewUserModal}
          onSubmitCallback={onUpdateUserCallback}
          user={user}
        ></UserModal>
      )}
    </>
  );
}
