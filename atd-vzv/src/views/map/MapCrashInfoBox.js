import React from "react";
import { Popup } from "react-map-gl";
import styled from "styled-components";
import CrashPointCard from "./CrashPointCard";
import { drawer } from "../../constants/drawer";
import moment from "moment";

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

const MapCrashInfoBox = ({
  selectedFeature,
  setSelectedFeature,
  isMobile,
  type,
}) => {
  const popupInfo = selectedFeature && selectedFeature.properties;

  const cardConfig = {
    crash: (info) => [
      {
        title: "Date/Time",
        content: moment(info.crash_date).format("MM/DD/YYYY HH:MM A"),
      },
      { title: "Fatalities", content: info.death_cnt },
      { title: "Serious Injuries", content: info.sus_serious_injry_cnt },
      {
        title: "Modes Involved",
        content: info.units_involved.split(" &").join(", "),
      },
      { title: "Crash ID", content: info.crash_id },
    ],
    councilDistrict: (info) => [
      {
        title: `City Council District ${info.council_district}`,
        content: "",
      },
    ],
  };

  const crashPointCard = (
    <CrashPointCard content={cardConfig[type](popupInfo)} />
  );

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
        <StyledMobileInfo>{crashPointCard}</StyledMobileInfo>
      </Popup>
    ) : (
      <StyledDesktopInfo>{crashPointCard}</StyledDesktopInfo>
    ))
  );
};

export default MapCrashInfoBox;
