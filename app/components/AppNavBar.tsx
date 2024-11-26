import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Image from "react-bootstrap/Image";
import Dropdown from "react-bootstrap/Dropdown";
import { User } from "@auth0/auth0-react";
import {
  FaRightFromBracket,
  FaUserLarge,
  FaBug,
  FaLightbulb,
  FaToolbox,
  FaSquareArrowUpRight,
} from "react-icons/fa6";
import DropdownAnchorToggle from "./DropdownAnchorToggle";
import AlignedLabel from "./AlignedLabel";

type NavBarProps = {
  user: User;
  logout: () => void;
};

export default function AppNavBar({ user, logout }: NavBarProps) {
  return (
    <Navbar expand="lg" className="pe-3">
      <Container fluid>
        <Navbar.Brand href="/crashes">
          <Image
            src="/assets/img/brand/visionzerotext.png"
            alt="Vision Zero Logo"
            height="24px"
            width="140px"
          />
        </Navbar.Brand>
        <Dropdown align="end">
          <Dropdown.Toggle id="avatar-toggle" as={DropdownAnchorToggle}>
            <Image
              src="/assets/img/avatars/placeholder.png"
              alt="Vision Zero Logo"
              height={35}
              className="rounded-circle"
            />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Header>{user.email}</Dropdown.Header>
            <Dropdown.Divider />
            <Dropdown.Item eventKey="1">
              <AlignedLabel>
                <FaUserLarge className="me-3" />
                Account
              </AlignedLabel>
            </Dropdown.Item>
            <Dropdown.Item eventKey="2" onClick={() => logout()}>
              <AlignedLabel>
                <FaRightFromBracket className="me-3" />
                Sign out
              </AlignedLabel>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item
              target="_blank"
              rel="noreferrer"
              href="https://atd.knack.com/dts#new-service-request/?view_249_vars=%7B%22field_398%22%3A%22Bug%20Report%20%E2%80%94%20Something%20is%20not%20working%22%2C%22field_399%22%3A%22Vision%20Zero%20Editor%22%7D"
            >
              <AlignedLabel>
                <FaBug className="me-3" />
                Report a bug
                <FaSquareArrowUpRight className="ms-3 text-muted" />
              </AlignedLabel>
            </Dropdown.Item>
            <Dropdown.Item
              target="_blank"
              rel="noreferrer"
              href="https://atd.knack.com/dts#new-service-request/?view_249_vars=%7B%22field_398%22%3A%22Feature%20or%20Enhancement%20%E2%80%94%20An%20application%20I%20use%20could%20be%20improved%22%2C%22field_399%22%3A%22Vision%20Zero%20Editor%22%7D"
            >
              <AlignedLabel>
                <FaLightbulb className="me-3" />
                Request an enhancement
                <FaSquareArrowUpRight className="ms-3 text-muted" />
              </AlignedLabel>
            </Dropdown.Item>
            <Dropdown.Item
              target="_blank"
              rel="noreferrer"
              href="https://ftp.dot.state.tx.us/pub/txdot-info/trf/crash_notifications/2023/code-sheet.pdf"
            >
              <AlignedLabel>
                <FaToolbox className="me-3" />
                CR3 code sheet
                <FaSquareArrowUpRight className="ms-3 text-muted" />
              </AlignedLabel>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Container>
    </Navbar>
  );
}
