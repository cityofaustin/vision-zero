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
      className={`sidebar-list-item fs-5 py-2 ps-4 ${
        isCurrentPage ? "sidebar-list-item-current text-black fw-bold" : "text-secondary"
      }`}
      style={{ cursor: "pointer", whiteSpace: "nowrap", border: "none" }}
      action
      as={Link}
      href={href}
    >
      <>
        <span>
          <Icon />
        </span>
        {!isCollapsed && <span className="ms-3 fs-6">{label}</span>}
      </>
    </ListGroup.Item>
  );
}
