import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import moment from "moment";
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
      <td>{moment(user.created_at).format("MM/DD/YYYY")}</td>
      <td>{user.app_metadata.roles[0]}</td>
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
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Created</th>
                    <th scope="col">Role</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {!!userList ? (
                    userList.map((user, index) => (
                      <UserRow key={index} user={user} />
                    ))
                  ) : (
                    <Spinner className="mt-2" color="primary" />
                  )}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Users;
