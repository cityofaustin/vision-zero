import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Badge, Card, CardBody, CardHeader, Col, Row, Table } from "reactstrap";

import usersData from "./UsersData";

function UserRow(props) {
  const user = props.user;
  const userLink = `/users/${user.id}`;

  const isBlocked = status => status === false || status === undefined;

  const getBadge = status => {
    return isBlocked(status) ? "success" : "danger";
  };

  const getStatus = status => {
    return isBlocked(status) ? "Active" : "Blocked";
  };

  return (
    <tr key={user.id.toString()}>
      <th scope="row">
        <Link to={userLink}>{user.name}</Link>
      </th>
      <td>
        <Link to={userLink}>{user.email}</Link>
      </td>
      <td>{user.created_at}</td>
      <td>{user.role}</td>
      <td>
        <Link to={userLink}>
          <Badge color={getBadge(user.blocked)}>
            {getStatus(user.blocked)}
          </Badge>
        </Link>
      </td>
    </tr>
  );
}

class Users extends Component {
  render() {
    const userList = usersData;

    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={6}>
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i> Users{" "}
              </CardHeader>
              <CardBody>
                <Table responsive hover>
                  <thead>
                    <tr>
                      {/* "name" */}
                      <th scope="col">Name</th>
                      {/* "email" */}
                      <th scope="col">Email</th>
                      {/* "created_at" */}
                      <th scope="col">Registered</th>
                      {/* app_metadata.roles (returns an array) */}
                      <th scope="col">Role</th>
                      {/* status = "blocked" === undefined || "blocked"  ? "Blocked" : "Active"  */}
                      {/* "blocked" field doesn't appear until user is blocked for the first time */}
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList.map((user, index) => (
                      <UserRow key={index} user={user} />
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Users;
