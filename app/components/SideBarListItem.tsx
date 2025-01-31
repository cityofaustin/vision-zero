import Link from "next/link";
import ListGroup from "react-bootstrap/ListGroup";
import { IconType } from "react-icons";

interface SideBarListItemProps {
  Icon: IconType;
  label: string;
  href: string;
  isCollapsed: boolean;
  isCurrentPage: boolean;
}

/**
 * A list item that renders in our app's sidebar 👍
 */
export default function SideBarListItem({
  Icon,
  label,
  href,
  isCollapsed,
  isCurrentPage,
}: SideBarListItemProps) {
  return (
    <ListGroup.Item
      className={`mx-0 bg-dark fs-5 my-1 ${
        isCurrentPage ? "text-white" : "text-secondary"
      }`}
      style={{ cursor: "pointer", whiteSpace: "nowrap", border: "none" }}
      action
      as={Link}
      href={href}
    >
      <>
        <span className="me-3">
          <Icon />
        </span>
        {!isCollapsed && <span>{label}</span>}
      </>
    </ListGroup.Item>
  );
}
