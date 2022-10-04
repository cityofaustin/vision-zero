import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { format, parseISO } from "date-fns";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  Button,
  Spinner,
} from "reactstrap";
import Can from "../../auth/Can";
import { useAuth0 } from "../../auth/authContext";
import { rules } from "../../auth/rbac-rules";

const UserRow = ({ user }) => {
  const userLink = `/users/${user.user_id}`;

  const isBlocked = status => status === false || status === undefined;

  const getBadge = status => {
    return isBlocked(status) ? "success" : "danger";
  };

  const getStatus = status => {
    return isBlocked(status) ? "Active" : "Blocked";
  };

  return (
    <tr key={user.user_id.toString()}>
      <th scope="row">
        <Link to={userLink}>{user.name}</Link>
      </th>
      <td>
        <Link to={userLink}>{user.email}</Link>
      </td>
      <td>{format(parseISO(user.created_at), "MM/dd/yyyy")}</td>
      <td>{user.logins_count}</td>
      <td>{format(parseISO(user.last_login), "MM/dd/yyyy")}</td>
      <td>{rules[user.app_metadata.roles[0]].label}</td>
      <td>
        <Link to={userLink}>
          <Badge color={getBadge(user.blocked)}>
            {getStatus(user.blocked)}
          </Badge>
        </Link>
      </td>
    </tr>
  );
};

const Users = () => {
  const { getRoles } = useAuth0();
  const token = window.localStorage.getItem("id_token");

  const [userList, setUserList] = useState(null);

  useEffect(() => {
    const endpoint = `${process.env.REACT_APP_CR3_API_DOMAIN}/user/list_users`;
    axios
      .get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => {
        setUserList(res.data);
      });
  }, [token]);

  return (
    <Can
      roles={getRoles()}
      perform="users:get"
      yes={() => (
        <div className="animated fadeIn">
          <Row>
            <Col>
              <Card>
                <CardHeader>
                  <i className="fa fa-align-justify"></i> Users{" "}
                </CardHeader>
                <CardBody>
                  <Row className="align-items-center mb-3">
                    <Col col="6" sm="4" md="2" xl className="mb-xl-0">
                      <Link to="/users/add" className="link">
                        <Button color="primary">
                          <i className="fa fa-user-plus"></i> Add User
                        </Button>
                      </Link>
                    </Col>
                  </Row>
                  {!!userList ? (
                    <Table responsive striped hover>
                      <thead>
                        <tr>
                          <th scope="col">Name</th>
                          <th scope="col">Email</th>
                          <th scope="col">Created</th>
                          <th scope="col">Logins Count</th>
                          <th scope="col">Last Login</th>
                          <th scope="col">Role</th>
                          <th scope="col">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userList.map((user, index) => (
                          <UserRow key={index} user={user} />
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <Spinner className="mt-2" color="primary" />
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    />
  );
};

export default Users;
