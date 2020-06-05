import React from "react";
import InfoCard from "./InfoCard";
import { StyledDesktopInfo } from "./infoBoxStyles";

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
