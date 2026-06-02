import { COLORS } from "@/utils/constants";
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
      className="p-0 my-1 px-2"
      style={{
        cursor: "pointer",
        whiteSpace: "nowrap",
        border: "none",
        borderLeft: isCurrentPage ? `4px solid ${COLORS.primary}` : "none",
      }}
      as={Link}
      href={href}
    >
      <div
        className={`
            rounded d-flex align-items-center justify-items-between py-1
            sidebar-list-item-content ${isCurrentPage ? "sidebar-list-item-current fw-semibold" : ""}
        `}
      >
        {/* This span is load-bearing - it prevents icon resizing when label span unhides */}
        <span
          style={{
            marginLeft: isCurrentPage ? "11px" : "15px",
            marginRight: "11px",
          }}
        >
          <Icon className="sidebar-list-item-icon my-1" size={24} />
        </span>
        {!isCollapsed && (
          <span className="fs-5 sidebar-list-item-label">{label}</span>
        )}
      </div>
    </ListGroup.Item>
  );
}
