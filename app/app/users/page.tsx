"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import { FaUserPlus, FaCopy } from "react-icons/fa6";
import AlignedLabel from "@/components/AlignedLabel";
import AppBreadCrumb from "@/components/AppBreadCrumb";
import UserModal from "@/components/UserModal";
import { useUsersInfinite } from "@/utils/users";
import { User } from "@/types/users";
import { useToken, formatRoleName } from "@/utils/auth";

export default function Users() {
  const token = useToken();
  const router = useRouter();
  const { users, isLoading, error, mutate } = useUsersInfinite(token);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const onCloseModal = () => setShowNewUserModal(false);

  if (error) {
    console.error(error);
  }

  const onSaveUserCallback = useCallback(
    async (user: User) => {
      // refetch the entire user list in the background (do not await)
      mutate();
      // navigate to the user details pagee
      router.push(`/users/${user.user_id}`);
    },
    [router, mutate]
  );

  return (
    <>
      <AppBreadCrumb />
      <Card>
        <Card.Header className="fs-5 fw-bold">Users</Card.Header>
        <Card.Body>
          <div className="mb-3">
            {!isLoading && (
              <>
                <Button
                  className="me-2"
                  onClick={() => setShowNewUserModal(true)}
                >
                  <AlignedLabel>
                    <FaUserPlus className="me-2" />
                    <span>Add user</span>
                  </AlignedLabel>
                </Button>
                <Button>
                  {/* todo: https://github.com/cityofaustin/atd-data-tech/issues/20121 */}
                  <AlignedLabel>
                    <FaCopy className="me-2" />
                    <span>Copy user emails - todo</span>
                  </AlignedLabel>
                </Button>
              </>
            )}
          </div>
          {/* todo: standardize the way we show error messages and use error boundary */}
          {Boolean(error) && (
            <Alert variant="dange">
              <p>Something went wrong</p>
              <p>
                <details>
                  <summary>Error</summary>
                  {String(error)}
                </details>
              </p>
            </Alert>
          )}
          <Table responsive hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Created at</th>
                <th>Last login</th>
                <th>Login count</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="text-center">
                    <Spinner variant="primary" />
                  </td>
                </tr>
              )}
              {users.map((user) => {
                return (
                  <tr
                    key={user.user_id}
                    style={{ cursor: "pointer" }}
                    onClick={() => router.push(`/users/${user.user_id}`)}
                  >
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString()
                        : ""}
                    </td>
                    <td>{user.logins_count || "0"}</td>
                    <td>{formatRoleName(user.app_metadata.roles[0])}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      <UserModal
        onClose={onCloseModal}
        show={showNewUserModal}
        onSubmitCallback={onSaveUserCallback}
      />
    </>
  );
}
