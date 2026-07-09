"use client";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {
  LuMapPinned,
  LuFileChartColumn,
  LuPanelsTopLeft,
} from "react-icons/lu";
import DashboardLinkCard, {
  DashboardLinkCardProps,
} from "@/components/DashboardLinkCard";
import UserEventsLogger from "@/components/UserEventsLogger";
import { useDocumentTitle } from "@/utils/documentTitle";

const VZV_ENDPOINT = process.env.NEXT_PUBLIC_VZV_ENDPOINT || "";

const dashboardLinks: DashboardLinkCardProps[] = [
  {
    title: "Vision Zero Viewer",
    description:
      "Our public-facing dashboard with official Vision Zero statistics",
    href: "https://visionzero.austin.gov/viewer/",
    icon: LuPanelsTopLeft,
  },
  {
    title: "Crash Data by Location",
    description: "Based on Vision Zero location polygons",
    href: "https://experience.arcgis.com/experience/4d642c739efe472b8a86c11be5f1b1dc",
    icon: LuMapPinned,
  },
  {
    title: "Key Metrics",
    description:
      "Collection of internal dashboards enabling a wide range of crash analysis",
    href: "https://app.powerbigov.us/links/JznhTDu8kc?ctid=5c5e19f6-a6ab-4b45-b1d0-be4608a9a67f&pbi_source=linkShare",
    icon: LuFileChartColumn,
  },
];

export default function Dashboard() {
  useDocumentTitle("Dashboard");
  return (
    <UserEventsLogger eventName="dashboard_view">
      <Row className="mt-3">
        <Col md={9}>
          <p>
            The below metrics reflect&nbsp;
            <a href={VZV_ENDPOINT} target="_blank" rel="noreferrer">
              public crash data
            </a>
            &nbsp;and exclude crashes that occurred within the last 14 days.
            Data includes crashes that occurred within the current City of
            Austin Full Purpose jurisdiction, inclusive of all public safety
            jurisdictions.
          </p>
        </Col>
      </Row>
      <Row>
        <Col>
          <iframe
            src={`https://visionzero.austin.gov/viewer/measures`}
            title="Vision Zero Viewer Stats"
            style={{
              width: "100%",
              height: "275px",
              transformOrigin: "top left", // Anchor scaling to the top-left corner
              border: "none",
              overflowX: "hidden",
              scale: ".75",
            }}
          />
        </Col>
      </Row>
      <Row>
        {dashboardLinks.map((item) => (
          <Col md={3} key={item.href} className="mb-2">
            <DashboardLinkCard {...item} />
          </Col>
        ))}
      </Row>
    </UserEventsLogger>
  );
}
