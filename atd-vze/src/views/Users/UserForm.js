import React, { useState, useEffect } from "react";
import axios from "axios";
import { Redirect } from "react-router-dom";
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
  Spinner,
} from "reactstrap";

const UserForm = ({ type, id = null }) => {
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
  const [isFormDataLoaded, setIsFormDataLoaded] = useState(false);
  const [isSubmissionError, setIsSubmissionError] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const roles = [
    { id: "itSupervisor", label: "IT Supervisor" },
    { id: "admin", label: "Admin" },
    { id: "editor", label: "Editor" },
    { id: "readOnly", label: "Read-only" },
  ];

  useEffect(() => {
    if (type === "Edit") {
      const endpoint = `endpoint/user/get_user/${id}`;
      // TODO POST form data to real api endpoint
      axios
        .get(endpoint, { headers: { Authorization: "user_token_here" } })
        .then(res => {
          setUserFormData(res.data);
          setIsFormDataLoaded(true);
        });
    }
  }, []);

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
    if (type === "Edit") {
      const endpoint = "endpoint/user/update_user";
      axios
        .put(endpoint, userFormData, {
          headers: { Authorization: "user_token_here" },
        })
        .then(() => {
          setIsFormSubmitted(true);
        })
        .catch(() => {
          setIsSubmissionError(true);
        });
    } else if (type === "Add") {
      // TODO POST form data to real api endpoint
      const endpoint = "endpoint/user/create_user";
      axios
        .post(endpoint, userFormData, {
          headers: { Authorization: "user_token_here" },
        })
        .then(() => {
          setIsFormSubmitted(true);
        })
        .catch(() => {
          setIsSubmissionError(true);
        });
    }
  };

  const resetForm = () => {
    setUserFormData(defaultFormData);
  };

  const renderErrorMessage = () => (
    <Alert className="mt-3" color="danger">
      Failed to {type.toLowerCase()} user - please try again.
    </Alert>
  );

  // Remove error message after rendered
  useEffect(() => {
    let errorMessageTimer = setTimeout(() => {
      setIsSubmissionError(false);
    }, 5000);
    return () => {
      clearTimeout(errorMessageTimer);
    };
  }, [isSubmissionError, setIsSubmissionError]);

  return isFormSubmitted ? (
    <Redirect to="/users" />
  ) : (
    <div className="animated fadeIn">
      <Row>
        <Col xs="12" md="6">
          <Card>
            <CardHeader>
              <strong>
                {type} User {type === "Edit" && `ID# ${id}`}
              </strong>
            </CardHeader>
            <CardBody>
              {(isFormDataLoaded && type === "Edit") || type === "Add" ? (
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
              ) : (
                <Spinner className="mt-2" color="primary" />
              )}
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

export default UserForm;
