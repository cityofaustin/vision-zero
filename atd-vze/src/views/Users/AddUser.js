import React, { useState, useEffect } from "react";
import axios from "axios";
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
  Alert,
} from "reactstrap";

const AddUser = () => {
  const defaultFormData = {
    name: "",
    email: "",
    blocked: false, // Initialize blocked status
    connection: "Username-Password-Authentication", // Set account type
    verify_email: true, // Send email verification
    app_metadata: {
      roles: ["readOnly"], // Default to lowest level access
    },
  };

  const [userFormData, setUserFormData] = useState(defaultFormData);
  const [isSubmissionError, setIsSubmissionError] = useState(false);

  const roles = [
    { id: "itSupervisor", label: "IT Supervisor" },
    { id: "admin", label: "Admin" },
    { id: "editor", label: "Editor" },
    { id: "readOnly", label: "Read-only" },
  ];

  const handleTextInputChange = event => {
    const updatedFormData = {
      ...userFormData,
      [event.target.id]: event.target.value,
    };
    setUserFormData(updatedFormData);
  };

  const handleRoleRadioInputChange = event => {
    const field = "app_metadata";
    const appMetadata = {
      roles: [event.target.value],
    };
    const updatedFormData = { ...userFormData, [field]: appMetadata };

    setUserFormData(updatedFormData);
  };

  const handleFormSubmit = () => {
    // TODO POST form data to real api endpoint
    const endpoint = "endpoint/user/create_user";
    axios
      .post(endpoint, userFormData, {
        headers: { Authorization: "user_token_here" },
      })
      .then(() => {
        // TODO Redirect to Users page
      })
      .catch(() => {
        setIsSubmissionError(true);
      });
  };

  // Remove error message after rendered
  useEffect(() => {
    setTimeout(() => {
      setIsSubmissionError(false);
    }, 5000);
  }, [isSubmissionError]);

  const resetForm = () => {
    setUserFormData(defaultFormData);
  };

  const renderErrorMessage = () => (
    <Alert className="mt-3" color="danger">
      Failed to add new user - please try again.
    </Alert>
  );

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
              <Button
                type="submit"
                size="sm"
                color="primary"
                onClick={handleFormSubmit}
              >
                <i className="fa fa-dot-circle-o"></i> Submit
              </Button>{" "}
              <Button type="reset" size="sm" color="danger" onClick={resetForm}>
                <i className="fa fa-ban"></i> Reset
              </Button>
              {isSubmissionError && renderErrorMessage()}
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AddUser;
