import React from "react";
import { colors } from "../../styles/colors";

const Shadow = ({ color, size }) => {
  const pinStyle = {
    fill: colors[color],
    stroke: colors["danger"],
  };

  const ICON = `M50,93.5c0,0,31.1-30.5,31.1-56C81.1,20.4,67.2,6.5,50,6.5c-17.2,0-31.1,13.9-31.1,31.1C18.9,63.1,50,93.5,50,93.5z   M35.2,37.6c0-8.2,6.6-14.8,14.8-14.8c8.2,0,14.8,6.6,14.8,14.8c0,8.2-6.6,14.8-14.8,14.8C41.8,52.4,35.2,45.8,35.2,37.6z`;

  return (
    <svg height={size} viewBox="0 0 100 125" style={pinStyle}>
      <path d={ICON} />
    </svg>
  );
};

export default Shadow;
