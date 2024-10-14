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

export default function SideBarListItem({
  Icon,
  label,
  href,
  isCollapsed,
  isCurrentPage,
}: SideBarListItemProps) {
  return (
    <ListGroup.Item
      className={`me-2 bg-dark ${
        isCurrentPage ? "text-info" : "text-white"
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
