import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";

/**
 * The login UI
 *
 * todo: should this be a page rather than a component imported by the main layout?
 */
export default function LoginContainer({
  onLogin,
}: {
  onLogin: () => Promise<void>;
}) {
  return (
    <Container
      fluid
      style={{ height: "100vh", overflow: "hidden" }}
      className="bg-dark"
    >
      <div className="d-flex justify-content-center align-content-center h-100">
        <div className="align-self-center p-5 bg-white rounded text-center">
          <h1 className="mb-5">Vision Zero Editor</h1>
          <Button onClick={onLogin} size="lg">
            <span>Sign In</span>
          </Button>
        </div>
      </div>
    </Container>
  );
}
