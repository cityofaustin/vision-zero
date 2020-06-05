import React from "react";
import { Popup } from "react-map-gl";
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

const StyledMobileInfo = styled.div`
  .card {
    background: none;
    border: none;
    max-width: ${responsive.drawerWidth - 20}px;
  }
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
  };

  const content = createCrashContent(crashCounts);

  const infoCard = <InfoCard content={content} />;

  return (
    popupInfo &&
    (isMobile ? (
      <Popup
        tipSize={10}
        anchor="top"
        longitude={parseFloat(popupInfo.longitude)}
        latitude={parseFloat(popupInfo.latitude)}
        onClose={() => setSelectedFeature(null)}
      >
        <StyledMobileInfo>{infoCard}</StyledMobileInfo>
      </Popup>
    ) : (
      <StyledDesktopInfo>{infoCard}</StyledDesktopInfo>
    ))
  );
};

export default MapPolygonInfoBox;
