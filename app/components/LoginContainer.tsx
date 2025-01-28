import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Image from "react-bootstrap/Image";
import { FaSignOutAlt } from "react-icons/fa";

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
      className=""
    >
      <div className="d-flex justify-content-center align-content-center h-100">
        <div className="align-self-center p-5 bg-white rounded text-center">
          <div className="mb-2">
            <Image
              fluid
              src="/assets/img/brand/vz_logo.png"
              alt="Vision Zero Logo"
              width="350rem"
            />
          </div>
          <div className="mb-3">
            <span className="text-secondary fs-5">
              Austin&apos;s crash data management platform
            </span>
          </div>
          <div>
            <Button onClick={onLogin} size="lg" className="w-100 bg-vz-sunshine text-vz-dark">
              <span className="text-nowrap d-flex justify-content-center align-items-center">
                <FaSignOutAlt className="me-2" />
                <span>Sign In</span>
              </span>
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
