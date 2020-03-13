import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardBody, CardHeader, Col, Row } from "reactstrap";

class User extends Component {
  render() {
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={6}>
            <Card>
              <CardHeader>
                <strong>
                  <i className="icon-info pr-1"></i>User ID:{" "}
                  {this.props.match.params.id}
                </strong>
              </CardHeader>
              <CardBody>
                <Row className="align-items-center mb-3">
                  <Col col="6" sm="4" md="2" xl className="mb-xl-0">
                    <Link
                      to={`/users/edit/${this.props.match.params.id}`}
                      className="link"
                    >
                      <Button color="primary">
                        <i className="fa fa-user-plus"></i> Edit User
                      </Button>
                    </Link>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default User;
