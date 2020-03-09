import React, { useState, useEffect } from "react";
import { Link, Redirect, useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  Spinner,
} from "reactstrap";

const User = () => {
  const token = window.localStorage.getItem("id_token");
  const { id } = useParams();

  const userAttributes = {
    user_id: { label: "User ID", format: "string" },
    name: { label: "Name", format: "string" },
    email: { label: "Email", format: "string" },
    app_metadata: { label: "Roles", format: "object", nestedKey: "roles" },
    created_at: { label: "Created", format: "time" },
    blocked: { label: "Blocked", format: "bool" },
    last_login: { label: "Last login", format: "time" },
    updated_at: { label: "Update at", format: "time" },
    logins_count: { label: "Logins count", format: "string" },
    last_ip: { label: "Last IP", format: "string" },
  };

  const [user, setUser] = useState(null);
  const [isUserDeleted, setIsUserDeleted] = useState(false);
  const [isUserBlocked, setIsUserBlocked] = useState(false);

  useEffect(() => {
    const endpoint = `${process.env.REACT_APP_CR3_API_DOMAIN}/user/get_user/${id}`;
    axios
      .get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => {
        if (res.data.statusCode === 404) {
          setIsUserDeleted(true);
        } else {
          setUser(res.data);
          if (!!res.data.blocked) {
            setIsUserBlocked(true);
          }
        }
      });
  }, [token, id]);

  const formatUserData = user =>
    Object.entries(userAttributes).map(([key, value]) => {
      const label = userAttributes[key].label;
      let formattedValue = null;

      const format = userAttributes[key].format;

      if (format === "string") {
        formattedValue = user[key];
      } else if (format === "bool") {
        formattedValue = !!user[key] ? "Yes" : "No";
      } else if (format === "time") {
        formattedValue = moment(user[key]).format("MM/DD/YYYY, h:mm:ss a");
      } else if (format === "object") {
        const nestedKey = value.nestedKey;
        formattedValue = user[key][nestedKey].join(", ");
      }
      return (
        <tr key={key}>
          <td>{`${label}:`}</td>
          <td>
            <strong>{formattedValue}</strong>
          </td>
        </tr>
      );
    });

  const handleDeleteUserClick = () => {
    const endpoint = `${process.env.REACT_APP_CR3_API_DOMAIN}/user/delete_user/${id}`;
    window.confirm("Are you sure that you want to delete this user?") &&
      axios
        .delete(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          setIsUserDeleted(true);
        });
  };

  const handleUnblockUserClick = () => {
    const endpoint = `${process.env.REACT_APP_CR3_API_DOMAIN}/user/unblock_user/${id}`;
    axios
      .delete(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setIsUserBlocked(false);
      });
  };

  return isUserDeleted ? (
    <Redirect to="/users" />
  ) : (
    <div className="animated fadeIn">
      <Row>
        <Col xs="12" md="6">
          <Card>
            <CardHeader>
              <strong>
                <i className="icon-info pr-1"></i>User ID: {id}
              </strong>
            </CardHeader>
            <CardBody>
              <Row className="align-items-center mb-3">
                <Col col="6" sm="4" md="2" xl className="mb-xl-0">
                  <Link to={`/users/${id}/edit`} className="link">
                    <Button color="primary">
                      <i className="fa fa-edit"></i> Edit User
                    </Button>
                  </Link>{" "}
                  <Button color="danger" onClick={handleDeleteUserClick}>
                    <i className="fa fa-user-times"></i> Delete User
                  </Button>{" "}
                  {isUserBlocked && (
                    <Button color="warning" onClick={handleUnblockUserClick}>
                      <i className="fa fa-key"></i> Unblock User
                    </Button>
                  )}
                </Col>
              </Row>
              {!!user ? (
                <Table responsive striped hover>
                  <tbody>{formatUserData(user)}</tbody>
                </Table>
              ) : (
                <Spinner className="mt-2" color="primary" />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default User;
