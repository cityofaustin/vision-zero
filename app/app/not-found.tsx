import Link from "next/link";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

export default function NotFound() {
  return (
    <div className="d-flex flex-column flex-grow-1 justify-content-center h-100">
      <Row className="d-flex justify-content-center">
        <Col xs={6} md={3}>
          <Image src="/assets/img/brand/404.svg" alt="404" fluid />
        </Col>
      </Row>
      <Row className="d-flex justify-content-center my-4">
        <Col className="text-center">
          <h1>Page Not Found</h1>
          <h4 className="text-muted">
            Sorry, we couldn't find the page you were looking for.
          </h4>
          <div className="my-3">
            <Link href="/" passHref>
              <Button>Go home</Button>
            </Link>
          </div>
        </Col>
      </Row>
    </div>
  );
}
