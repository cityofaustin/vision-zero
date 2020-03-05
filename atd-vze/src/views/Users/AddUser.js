import React, { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Form,
  FormGroup,
  FormText,
  Input,
  Label,
  Row,
} from "reactstrap";

const AddUser = () => {
  const defaultFormData = {
    blocked: false,
    connection: "Username-Password-Authentication",
    verify_email: true,
  };

  const [userFormData, setUserFormData] = useState(defaultFormData);

  const roles = [
    { id: "itSupervisor", label: "IT Supervisor" },
    { id: "admin", label: "Admin" },
    { id: "editor", label: "Editor" },
    { id: "readOnly", label: "Read-only" },
  ];

  return (
    <div className="animated fadeIn">
      {/* {
   "email": "test_email",
   "blocked": false,
   "name": "John Doe",
   "connection": "Username-Password-Authentication",
   "password": "thisissecure123!",
   "verify_email": true,
   "app_metadata": {
        "roles": [
            "role",
        ]
    }
 } */}
      <Row>
        <Col xs="12" md="6">
          <Card>
            <CardHeader>
              <strong>Add User</strong>
            </CardHeader>
            <CardBody>
              <Form
                action=""
                method="post"
                encType="multipart/form-data"
                className="form-horizontal"
              >
                <FormGroup row>
                  <Col md="3">
                    <Label htmlFor="text-input">Name</Label>
                  </Col>
                  <Col xs="12" md="9">
                    <Input
                      type="text"
                      id="text-input"
                      name="text-input"
                      placeholder="Name"
                    />
                    <FormText color="muted">This is a help text</FormText>
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Col md="3">
                    <Label htmlFor="email-input">Email</Label>
                  </Col>
                  <Col xs="12" md="9">
                    <Input
                      type="email"
                      id="email-input"
                      name="email-input"
                      placeholder="Enter Email"
                      autoComplete="email"
                    />
                    <FormText color="muted">
                      Please enter an austintexas.gov address
                    </FormText>
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Col md="3">
                    <Label htmlFor="password-input">Password</Label>
                  </Col>
                  <Col xs="12" md="9">
                    <Input
                      type="password"
                      id="password-input"
                      name="password-input"
                      placeholder="Password"
                      autoComplete="new-password"
                    />
                    <FormText className="help-block">
                      Please enter a complex password
                    </FormText>
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Col md="3">
                    <Label>Role</Label>
                  </Col>
                  <Col md="9">
                    {roles.map(role => (
                      <FormGroup check className="radio">
                        <Input
                          className="form-check-input"
                          type="radio"
                          id={role.id}
                          name="radios"
                          value={role.id}
                        />
                        <Label
                          check
                          className="form-check-label"
                          htmlFor={role.id}
                        >
                          {role.label}
                        </Label>
                      </FormGroup>
                    ))}
                  </Col>
                </FormGroup>
              </Form>
            </CardBody>
            <CardFooter>
              <Button type="submit" size="sm" color="primary">
                <i className="fa fa-dot-circle-o"></i> Submit
              </Button>{" "}
              <Button type="reset" size="sm" color="danger">
                <i className="fa fa-ban"></i> Reset
              </Button>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AddUser;
