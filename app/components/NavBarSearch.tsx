import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { FaMagnifyingGlass } from "react-icons/fa6";

export default function NavBarSearch() {
  return (
    <InputGroup className="me-4">
      <Button>Crash ID</Button>
      <Form.Control placeholder="Search..." />
      <Button>
        <FaMagnifyingGlass />
      </Button>
    </InputGroup>
  );
}
