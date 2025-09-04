"use client";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FaMap, FaChartPie } from "react-icons/fa6";
import DashboardLinkCard, {
  DashboardLinkCardProps,
} from "@/components/DashboardLinkCard";
import { useDocumentTitle } from "@/utils/documentTitle";

const VZV_ENDPOINT = process.env.NEXT_PUBLIC_VZV_ENDPOINT || "";

const dashboardLinks: DashboardLinkCardProps[] = [
  {
    title: "Arterial Management Division Overview",
    description: "Top location overview, by collision types and modes",
    href: "https://app.powerbigov.us/links/GACOsce5fi?ctid=5c5e19f6-a6ab-4b45-b1d0-be4608a9a67f&pbi_source=linkShare",
    icon: FaChartPie,
  },
  {
    title: "Vision Zero Viewer",
    description:
      "Our public-facing dashboard with official Vision Zero statistics",
    href: "https://visionzero.austin.gov/viewer/",
    icon: FaMap,
  },
  {
    title: "Emerging Hotspots and Bond Locations",
    description:
      "Track crash impact of Vision Zero Bond Projects and changing crash trends",
    href: "https://app.powerbigov.us/links/RmMrnaSMLp?ctid=5c5e19f6-a6ab-4b45-b1d0-be4608a9a67f&pbi_source=linkShare",
    icon: FaChartPie,
  },
  {
    title: "Crash Data by Location",
    description: "Based on Vision Zero location polygons",
    href: "https://austin.maps.arcgis.com/apps/webappviewer/index.html?id=981b687bb68d465cab737792bbf56198",
    icon: FaMap,
  },
  {
    title: "High Injury Roadways",
    description: "Each High Injury Roadway by Polygon with various statistics",
    href: "https://app.powerbigov.us/links/pdguGuhSGE?ctid=5c5e19f6-a6ab-4b45-b1d0-be4608a9a67f&pbi_source=linkShare",
    icon: FaChartPie,
  },
  {
    title: "Access Management Crashes",
    description: "Summary of crashes for individual locations",
    href: "https://austin.maps.arcgis.com/apps/instant/interactivelegend/index.html?appid=ea84226e6e5a4ecf998082b73b8c6cca",
    icon: FaMap,
  },
];

export default function Dashboard() {
  useDocumentTitle("Dashboard - Vision Zero Editor");
  return (
    <>
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
            src={`${VZV_ENDPOINT}/measures`}
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
          <Col md={6} key={item.href}>
            <DashboardLinkCard {...item} />
          </Col>
        ))}
      </Row>
    </>
  );
}
