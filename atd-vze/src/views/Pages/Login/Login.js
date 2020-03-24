import React, { Component } from "react";
import {
  Button,
  Card,
  CardBody,
  CardGroup,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner,
} from "reactstrap";

class Login extends Component {
  render() {
    const { login, loading } = this.props;

    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="8">
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    <Form>
                      <h1>Login</h1>
                      <p className="text-muted">Sign In to your account</p>
                      <InputGroup className="mb-3" />
                      <Row>
                        <Col xs="6">
                          {loading ? (
                            <Spinner className="mt-2" color="primary" />
                          ) : (
                            <Button
                              color="primary"
                              className="px-4"
                              onClick={login}
                            >
                              Login
                            </Button>
                          )}
                        </Col>
                        <Col xs="6" className="text-right">
                          <Button color="link" className="px-0" onClick={login}>
                            Forgot password?
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Login;
