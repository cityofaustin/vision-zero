import React from "react";
import styled from "styled-components";
import InfoCard from "./InfoCard";
import { responsive } from "../../constants/responsive";

const StyledDesktopInfo = styled.div`
  position: absolute;
  margin: 8px;
  padding: 2px;
  max-width: ${responsive.drawerWidth - 20}px;
  z-index: 9 !important;
  pointer-events: none;
`;

const MapPolygonInfoBox = ({ crashCounts }) => {
  const createCrashContent = (crashCounts) => {
    const content = [];
    crashCounts.fatalities > 0 &&
      content.push({
        title: "Fatalities",
        content: `${crashCounts.fatalities}`,
      });
    crashCounts.injuries > 0 &&
      content.push({
        title: "Serious Injuries",
        content: `${crashCounts.injuries}`,
      });
    return content;
  };

  const content = createCrashContent(crashCounts);

  const infoCard = <InfoCard content={content} />;

  return <StyledDesktopInfo>{infoCard}</StyledDesktopInfo>;
};

export default MapPolygonInfoBox;
