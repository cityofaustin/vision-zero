"use client";
import { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import AppBreadCrumb from "@/components/AppBreadCrumb";
import { getUser, useToken } from "@/utils/users";
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
    renderer: (user) => user.app_metadata.roles[0] || "",
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
  const [user, setUser] = useState<User | null>(null);

  const userId = params.user_id;
  useEffect(() => {
    if (!userId || !token) {
      return;
    }
    getUser(userId, token).then((user) => {
      setUser(user);
    });
  }, [token, userId]);

  return (
    <>
      <AppBreadCrumb />
      <Card>
        <Card.Header className="fs-5 fw-bold">User Details</Card.Header>
        <Card.Body>
          {!user && <Spinner variant="primary" />}
          {user && (
            <Table responsive hover>
              <tbody>
                {COLUMNS.map((col) => (
                  <tr>
                    <td>{col.label}</td>
                    <td>
                      {col.renderer
                        ? col.renderer(user)
                        : String(user[col.name])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </>
  );
}
