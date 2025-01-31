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
    <a href={href} style={{ textDecoration: "none" }}>
      <Card className="my-2 dashboard-link-card">
        <CardBody className="d-flex">
          <div className="d-flex align-items-center me-4 py-3 px-3 bg-dark rounded fs-3 fw-bold text-white">
            <Icon />
          </div>
          <div className="d-flex flex-column text-dark">
            <span className="fs-5 fw-bold">{title}</span>
            <span className="">{description}</span>
          </div>
        </CardBody>
      </Card>
    </a>
  );
}
