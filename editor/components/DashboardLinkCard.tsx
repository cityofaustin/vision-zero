import Card from "react-bootstrap/Card";
import CardBody from "react-bootstrap/CardBody";
import { IconType } from "react-icons";

export interface DashboardLinkCardProps {
  title: string;
  description: string;
  href: string;
  icon: IconType;
}

/**
 * A clickable card that renders an anchor tag with an icon,
 * title, and description
 */
export default function DashboardLinkCard({
  title,
  description,
  href,
  icon: Icon,
}: DashboardLinkCardProps) {
  return (
    <a href={href} className="d-block h-100" style={{ textDecoration: "none" }}>
      <Card className="my-2 h-100 hover-shadow">
        <CardBody className="d-flex align-items-center">
          <div className="d-flex align-items-center me-4 py-3 px-3 bg-light-subtle rounded fs-1 fw-bold text-primary border border-primary-subtle">
            <Icon />
          </div>
          <div className="d-flex flex-column">
            <span className="fs-5 fw-bold">{title}</span>
            <span className="">{description}</span>
          </div>
        </CardBody>
      </Card>
    </a>
  );
}
