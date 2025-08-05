import Link from "next/link";
import Container from "react-bootstrap/Container";
import Dropdown from "react-bootstrap/Dropdown";
import { User, LogoutOptions } from "@auth0/auth0-react";
import Image from "react-bootstrap/Image";
import Col from "react-bootstrap/Col";
import Navbar from "react-bootstrap/Navbar";
import {
  FaBug,
  FaLightbulb,
  FaRightFromBracket,
  FaSquareArrowUpRight,
  FaToolbox,
  FaUserLarge,
} from "react-icons/fa6";
import NavBarSearch from "@/components/NavBarSearch";
import AlignedLabel from "@/components/AlignedLabel";
import DropdownAnchorToggle from "@/components/DropdownAnchorToggle";
import DarkModeToggle from "@/components/DarkModeToggle";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

type NavBarProps = {
  user: User;
  logout: (options?: LogoutOptions) => void;
};

/**
 * App navbar with branding and a right-aligned dropdown menu
 */
export default function AppNavBar({ user, logout }: NavBarProps) {
  const userId = user?.["https://hasura.io/jwt/claims"]?.["x-hasura-user-id"];

  return (
    <Navbar className="app-navbar bg-light border-bottom pe-3 w-100">
      <Container fluid>
        <Col className="d-flex justify-content-start">
          <Navbar.Brand href="/crashes" as={Link}>
            <Image
              src={`${BASE_PATH}/assets/img/brand/vz_logo_transparent_asphalt.png`}
              alt="Vision Zero Logo"
              height="30px"
              className="app-brand-img"
            />
          </Navbar.Brand>
        </Col>
        <Col className="d-flex justify-content-end align-items-center">
          <NavBarSearch />
          <Dropdown align="end">
            <Dropdown.Toggle id="avatar-toggle" as={DropdownAnchorToggle}>
              <Image
                src={`${BASE_PATH}/assets/img/avatars/placeholder.png`}
                alt="Vision Zero Logo"
                height={35}
                className="rounded-circle"
              />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Header>{user.email}</Dropdown.Header>
              <Dropdown.Item eventKey="1" href={`/users/${userId}`} as={Link}>
                <AlignedLabel>
                  <FaUserLarge className="me-3" />
                  Account
                </AlignedLabel>
              </Dropdown.Item>
              <DarkModeToggle />
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
              <Dropdown.Divider />
              <Dropdown.Item
                eventKey="2"
                onClick={() =>
                  logout({
                    logoutParams: {
                      returnTo: window.location.origin + BASE_PATH,
                    },
                  })
                }
              >
                <AlignedLabel>
                  <FaRightFromBracket className="me-3" />
                  Sign out
                </AlignedLabel>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Container>
    </Navbar>
  );
}
