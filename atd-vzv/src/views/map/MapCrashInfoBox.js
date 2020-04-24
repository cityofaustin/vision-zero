import React from "react";
import { Popup } from "react-map-gl";
import styled from "styled-components";
import CrashPointCard from "./CrashPointCard";
import { drawer } from "../../constants/drawer";

const StyledDesktopInfo = styled.div`
  position: absolute;
  margin: 8px;
  padding: 2px;
  max-width: ${drawer.width - 20}px;
  z-index: 9 !important;
  pointer-events: none;
`;

const StyledMobileInfo = styled.div`
  .card {
    background: none;
    border: none;
    max-width: ${drawer.width - 20}px;
  }
`;

const MapCrashInfoBox = ({ selectedFeature, isMobile }) => {
  const popupInfo = selectedFeature;
  const crashPointCard = <CrashPointCard info={popupInfo.properties} />;

  return (
    popupInfo &&
    (isMobile ? (
      <Popup
        tipSize={10}
        anchor="top"
        longitude={parseFloat(popupInfo.properties.longitude)}
        latitude={parseFloat(popupInfo.properties.latitude)}
        closeOnClick={false}
        closeButton={true}
      >
        <StyledMobileInfo>{crashPointCard}</StyledMobileInfo>
      </Popup>
    ) : (
      <StyledDesktopInfo>{crashPointCard}</StyledDesktopInfo>
    ))
  );
};

export default MapCrashInfoBox;
