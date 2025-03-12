import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Image from "react-bootstrap/Image";
import { FaSignOutAlt } from "react-icons/fa";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

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
      className="d-flex flex-column flex-grow-1 p-0"
      style={{ overflow: "hidden" }}
    >
      <div className="d-flex justify-content-center align-items-center flex-grow-1">
        <div className="p-5 bg-white rounded text-center">
          <div className="mb-2">
            <Image
              fluid
              src={`${BASE_PATH}/assets/img/brand/vz_coa_logo_asphalt.png`}
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
            <Button onClick={onLogin} size="lg" className="w-100 text-vz-dark">
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
