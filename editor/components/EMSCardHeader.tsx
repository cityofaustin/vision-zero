import Badge from "react-bootstrap/Badge";
import { FaCircleInfo } from "react-icons/fa6";

export default function EMSCardHeader() {
  return (
    <>
      <div className="d-flex mb-2">
        <span className="fs-5 fw-bold me-2">EMS Patient care</span>
        <div className="align-self-center align-items-center">
          <Badge bg="info">Beta</Badge>
        </div>
      </div>
      <div className="fw-light text-secondary">
        <span className="d-flex align-items-center">
          <FaCircleInfo className="me-2" style={{ minWidth: "1rem" }} />
          <span>
            EMS analysis is currently in beta. Data may be inaccurate or change
            significantly as we continue to refine the system.
          </span>
        </span>
      </div>
    </>
  );
}
