"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import { FaUserPlus, FaCopy, FaCheck } from "react-icons/fa6";
import AlignedLabel from "@/components/AlignedLabel";
import PermissionsRequired from "@/components/PermissionsRequired";
import UserModal from "@/components/UserModal";
import { useUsersInfinite } from "@/utils/users";
import { User } from "@/types/users";
import { formatRoleName } from "@/utils/auth";

const allowedCreateUserRoles = ["vz-admin"];

export default function Users() {
  const router = useRouter();
  const { users, isLoading, isValidating, error, mutate } = useUsersInfinite();
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [copyUserEmailsClicked, setCopyUserEmailsClicked] = useState(false);
  const onCloseModal = () => setShowNewUserModal(false);

  if (error) {
    console.error(error);
  }

  // copy emails to clipboard and set copied state so that the button updates
  const handleCopyUserEmails = useCallback(() => {
    let userEmails = "";
    users
      // exclude test accounts
      .filter(
        (user) => !user.email.toLowerCase().startsWith("transportation.data+")
      )
      .forEach((user) => {
        userEmails += `${user.email}; `;
      });
    // only display the copied button state for a moment
    navigator.clipboard.writeText(userEmails).then(() => {
      setCopyUserEmailsClicked(true);
      const copiedStateTime = 1000;
      setTimeout(() => setCopyUserEmailsClicked(false), copiedStateTime);
    });
  }, [users]);

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
      <Card className="mt-3">
        <Card.Header className="fs-3 fw-bold">Users</Card.Header>
        <Card.Body>
          <div className="mb-3 d-flex align-items-center">
            {!isLoading && (
              <>
                <PermissionsRequired allowedRoles={allowedCreateUserRoles}>
                  <Button
                    className="me-2"
                    onClick={() => setShowNewUserModal(true)}
                    disabled={isValidating}
                  >
                    <AlignedLabel>
                      <FaUserPlus className="me-2" />
                      <span>Add user</span>
                    </AlignedLabel>
                  </Button>
                </PermissionsRequired>
                <Button
                  onClick={handleCopyUserEmails}
                  disabled={isValidating || copyUserEmailsClicked}
                >
                  {copyUserEmailsClicked ? (
                    <AlignedLabel>
                      <FaCheck className="me-2" />
                      <span>Copied</span>
                    </AlignedLabel>
                  ) : (
                    <AlignedLabel>
                      <FaCopy className="me-2" />
                      <span>Copy user emails</span>
                    </AlignedLabel>
                  )}
                </Button>
                {/* show the spinner when revalidating - this is important user feedback after a 
                user has been deleted and the user list is being refetched */}
                {isValidating && (
                  <span className="ms-2">
                    <Spinner variant="primary" />
                  </span>
                )}
              </>
            )}
          </div>
          {/* todo: standardize the way we show error messages and use error boundary */}
          {Boolean(error) && (
            <Alert variant="danger">
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
