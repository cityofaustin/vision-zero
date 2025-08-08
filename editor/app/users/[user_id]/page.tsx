"use client";
import { useState, useCallback } from "react";
import { notFound, useRouter } from "next/navigation";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import { FaUserEdit, FaUserAltSlash } from "react-icons/fa";
import AlignedLabel from "@/components/AlignedLabel";
import UserModal from "@/components/UserModal";
import PermissionsRequired from "@/components/PermissionsRequired";
import { formatRoleName, useGetToken } from "@/utils/auth";
import { useUser } from "@/utils/users";
import { User } from "@/types/users";
import { formatDateTimeWithDay } from "@/utils/formatters";

const allowedUserEditRoles = ["vz-admin"];

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
  { name: "logins_count", label: "Login count" },
  {
    name: "created_at",
    label: "Created at",
    renderer: (user) => formatDateTimeWithDay(user.created_at),
  },
  {
    name: "last_login",
    label: "Last login",
    renderer: (user) => formatDateTimeWithDay(user.last_login),
  },
  {
    name: "updated_at",
    label: "Updated at",
    renderer: (user) => formatDateTimeWithDay(user.updated_at),
  },
];

export default function UserDetails({
  params,
}: {
  params: { user_id: string };
}) {
  const getToken = useGetToken();
  const router = useRouter();
  const userId = params.user_id;
  const { data: user, mutate } = useUser(userId);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const onCloseModal = () => setShowEditUserModal(false);

  const onUpdateUserCallback = useCallback(async () => {
    // refetch the user details and close
    await mutate();
    setShowEditUserModal(false);
  }, [mutate]);

  const onDeleteUser = useCallback(async () => {
    setIsDeleting(true);
    const url = `${
      process.env.NEXT_PUBLIC_CR3_API_DOMAIN
    }/user/delete_user/${encodeURIComponent(userId)}`;
    const method = "DELETE";
    const token = await getToken();
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method,
      });
      if (!response.ok) {
        // the API may not return JSON for this endpoint — unclear from Auth0 docs
        // auth0 api docs: https://auth0.com/docs/api/management/v2/users/delete-users-by-id
        // very low priority todo: implement better error handling
        const responseText = await response.text();
        console.error(responseText);
        window.alert(`Failed to delete user: ${String(responseText)}`);
      } else {
        router.push(`/users`);
      }
    } catch (err) {
      console.error(err);
      window.alert(`Failed to delete user: An unknown error has occured`);
    }
    setIsDeleting(false);
  }, [router, userId, getToken]);

  if (user && "error" in user) {
    // 404
    notFound();
  }

  return (
    <>
      <Row>
        <Col md={12} lg={6}>
          <Card>
            <Card.Header className="fs-5 fw-bold">User details</Card.Header>
            <Card.Body>
              {!user && <Spinner variant="primary" />}
              <div className="mb-3">
                {user && (
                  <PermissionsRequired allowedRoles={allowedUserEditRoles}>
                    <Button
                      className="me-2"
                      onClick={() => setShowEditUserModal(true)}
                    >
                      <AlignedLabel>
                        <FaUserEdit className="me-2" />
                        <span>Edit</span>
                      </AlignedLabel>
                    </Button>
                    <Button
                      variant="danger"
                      disabled={isDeleting}
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this user?"
                          )
                        ) {
                          onDeleteUser();
                        }
                      }}
                    >
                      {isDeleting && <Spinner variant="dange" size="sm" />}
                      {!isDeleting && (
                        <AlignedLabel>
                          <FaUserAltSlash className="me-2" />
                          <span>Delete</span>
                        </AlignedLabel>
                      )}
                    </Button>
                  </PermissionsRequired>
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
          show={showEditUserModal}
          onSubmitCallback={onUpdateUserCallback}
          user={user}
        />
      )}
    </>
  );
}
