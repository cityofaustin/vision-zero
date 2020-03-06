import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
} from "reactstrap";

const User = () => {
  const token = window.localStorage.getItem("id_token");
  const { id } = useParams();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const endpoint = `${process.env.REACT_APP_CR3_API_DOMAIN}/user/get_user/${id}`;
    axios
      .get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => {
        setUser(res.data);
      });
  }, [token]);

  return (
    <div className="animated fadeIn">
      <Row>
        <Col xl={6}>
          <Card>
            <CardHeader>
              <strong>
                <i className="icon-info pr-1"></i>User ID: {id}
              </strong>
            </CardHeader>
            <CardBody>
              <Row className="align-items-center mb-3">
                <Col col="6" sm="4" md="2" xl className="mb-xl-0">
                  <Link to={`/users/edit/${id}`} className="link">
                    <Button color="primary">
                      <i className="fa fa-user-plus"></i> Edit User
                    </Button>
                  </Link>
                </Col>
              </Row>
              <Table responsive striped hover>
                <tbody>
                  {!!user &&
                    Object.entries(user).map(([key, value]) => (
                      <tr key={key}>
                        <td>{`${key}:`}</td>
                        <td>
                          <strong>
                            {key !== "identities" &&
                              key !== "app_metadata" &&
                              key !== "user_metadata" &&
                              value}
                          </strong>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default User;
