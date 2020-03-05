import React, { useState } from "react";
import {
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
    name: "",
    email: "",
    blocked: false, // Initialize blocked status
    connection: "Username-Password-Authentication", // Tie user to VZ app
    verify_email: true, // Send email verification
    app_metadata: {
      roles: ["readOnly"], // Default to lowest level access
    },
  };

  const [userFormData, setUserFormData] = useState(defaultFormData);

  const roles = [
    { id: "itSupervisor", label: "IT Supervisor" },
    { id: "admin", label: "Admin" },
    { id: "editor", label: "Editor" },
    { id: "readOnly", label: "Read-only" },
  ];

  const handleTextInputChange = event => {
    const text = event.target.value;
    const field = event.target.id;
    const updatedFormData = { ...userFormData, [field]: text };

    setUserFormData(updatedFormData);
  };

  const handleRoleRadioInputChange = event => {
    const role = event.target.value;
    const field = "app_metadata";
    const appMetadata = {
      roles: [role],
    };
    const updatedFormData = { ...userFormData, [field]: appMetadata };

    setUserFormData(updatedFormData);
  };

  const resetForm = () => {
    setUserFormData(defaultFormData);
  };

  return (
    <div className="animated fadeIn">
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
                      id="name"
                      name="text-input"
                      placeholder="Name"
                      value={userFormData.name}
                      onChange={handleTextInputChange}
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
                      id="email"
                      name="email-input"
                      placeholder="Enter Email"
                      autoComplete="email"
                      value={userFormData.email}
                      onChange={handleTextInputChange}
                    />
                    <FormText color="muted">
                      Please enter an austintexas.gov address
                    </FormText>
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Col md="3">
                    <Label>Role</Label>
                  </Col>
                  <Col md="9">
                    {roles.map(role => (
                      <FormGroup key={role.id} check className="radio">
                        <Input
                          className="form-check-input"
                          type="radio"
                          id={role.id}
                          name="radios"
                          value={role.id}
                          checked={
                            userFormData.app_metadata.roles[0] === role.id
                          }
                          onChange={handleRoleRadioInputChange}
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
              <Button type="reset" size="sm" color="danger" onClick={resetForm}>
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
