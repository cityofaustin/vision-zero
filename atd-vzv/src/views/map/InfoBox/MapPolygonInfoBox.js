import React from "react";
import InfoCard from "./InfoCard";
import { StyledDesktopInfo } from "./infoBoxStyles";

const MapPolygonInfoBox = ({ crashCounts, isMapTypeSet }) => {
  const createCrashContent = (crashCounts) => {
    const content = [];
    isMapTypeSet.fatal &&
      content.push({
        title: "Fatalities",
        content: `${crashCounts.fatality}`,
      });
    isMapTypeSet.injury &&
      content.push({
        title: "Serious Injuries",
        content: `${crashCounts.injury}`,
      });
    return content;
  };

  const content = createCrashContent(crashCounts);

  const infoCard = <InfoCard content={content} />;

  return <StyledDesktopInfo>{infoCard}</StyledDesktopInfo>;
};

export default MapPolygonInfoBox;
