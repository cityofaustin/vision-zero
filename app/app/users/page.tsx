"use client";
import { useRouter } from "next/navigation";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import AppBreadCrumb from "@/components/AppBreadCrumb";
import { useUsers, useToken } from "@/utils/users";
import AlignedLabel from "@/components/AlignedLabel";
import { FaUserPlus, FaCopy } from "react-icons/fa6";

export default function Users() {
  const token = useToken();
  const router = useRouter();
  const [users, isLoading, error] = useUsers(token);

  return (
    <>
      <AppBreadCrumb />
      <Card>
        <Card.Header className="fs-5 fw-bold">Users</Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-end mb-3">
            {isLoading && (
              <AlignedLabel>
                <Spinner variant="primary" />
              </AlignedLabel>
            )}
            {!isLoading && (
              <>
                <Button className="me-2">
                  <AlignedLabel>
                    <FaUserPlus className="me-2" />
                    <span>Add user</span>
                  </AlignedLabel>
                </Button>
                <Button>
                  <AlignedLabel>
                    <FaCopy className="me-2" />
                    <span>Copy user emails</span>
                  </AlignedLabel>
                </Button>
              </>
            )}
          </div>
          {Boolean(error) && (
            <Alert variant="danger">Something went wrong</Alert>
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
                    <td>{user.logins_count}</td>
                    <td>{user.app_metadata.roles[0]}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );
}