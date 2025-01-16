"use client";
import { useRef, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { formatGreetingTime } from "@/utils/formatters";
import { FaMap, FaChartPie } from "react-icons/fa6";
import { formatFirstNameFromEmail } from "@/utils/auth";
import DashboardLinkCard, {
  DashboardLinkCardProps,
} from "@/components/DashboardLinkCard";

const VZV_ENDPOINT = process.env.NEXT_PUBLIC_VZV_ENDPOINT || "";

const dashboardLinks: DashboardLinkCardProps[] = [
  {
    title: "Arterial Management Division Overview",
    description: "Top location overview, by collision types and modes",
    href: "https://app.powerbigov.us/links/GACOsce5fi?ctid=5c5e19f6-a6ab-4b45-b1d0-be4608a9a67f&pbi_source=linkShare",
    icon: FaChartPie,
  },
  {
    title: "High Injury Roadways",
    description: "Each High Injury Roadway by Polygon with various statistics",
    href: "https://app.powerbigov.us/links/pdguGuhSGE?ctid=5c5e19f6-a6ab-4b45-b1d0-be4608a9a67f&pbi_source=linkShare",
    icon: FaChartPie,
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
    title: "Vision Zero Viewer",
    description:
      "Our public-facing dashboard with official Vision Zero statistics",
    href: "https://visionzero.austin.gov/viewer/",
    icon: FaMap,
  },
  {
    title: "Access Management Crashes",
    description: "Summary of crashes for individual locations",
    href: "https://austin.maps.arcgis.com/apps/instant/interactivelegend/index.html?appid=ea84226e6e5a4ecf998082b73b8c6cca",
    icon: FaMap,
  },
];

export default function Dashboard() {
  const { user } = useAuth0();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const sendOverflowMessage = () => {
    if (iframeRef?.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "HIDE_OVERFLOW_X" },
        VZV_ENDPOINT
      );
    }
  };

  useEffect(() => {
    /**
     * This messenger prevents a horizontal scrollbar from appearing inside
     */
    const handleIframeLoad = () => {
      sendOverflowMessage();
    };
    const currentRef = iframeRef?.current;

    currentRef?.addEventListener("load", handleIframeLoad);
    return () => {
      currentRef?.removeEventListener("load", handleIframeLoad);
    };
  }, []);

  const firstName = formatFirstNameFromEmail(user?.email || "");

  return (
    <>
      <Row className="mb-3">
        <Col md={6}>
          <h4 className="display-4">
            <span>{`Good ${formatGreetingTime(new Date())}, `}</span>
            <span className="text-capitalize">{firstName}</span>!
          </h4>
          <p>
            Welcome to the Vision Zero Editor, which provides access to the City
            of Austin&apos;s traffic crash data.
          </p>
        </Col>
      </Row>
      <Row>
        <Col>
          <iframe
            ref={iframeRef}
            src="http://localhost:3000/viewer/measures"
            title="Vision Zero Viewer Stats"
            style={{
              width: "100%",
              height: "275px",
              transformOrigin: "top left", // Anchor scaling to the top-left corner
              border: "none",
              overflowX: "hidden",
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
