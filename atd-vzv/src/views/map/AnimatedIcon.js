import React from "react";
import { CanvasOverlay } from "react-map-gl";

const AnimatedIcon = ({ location, paint }) => {
  const { x, y } = location;
  const _redraw = ({ width, height, ctx, project }) => {
    const coordinates = project([x, y]);

    var size = 66.6667;
    var duration = 1000;
    var t = (performance.now() % duration) / duration;

    var radius = (size / 2) * 0.3;
    var outerRadius = (size / 2) * 0.7 * t + radius;

    // Draw the outer circle.
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.arc(coordinates[0], coordinates[1], outerRadius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 200, 200," + (1 - t) + ")";
    ctx.fill();

    // Draw the inner circle.
    ctx.beginPath();
    ctx.arc(coordinates[0], coordinates[1], radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 100, 100, 1)";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2 + 4 * (1 - t);
    ctx.fill();
    ctx.stroke();
  };

  return <CanvasOverlay redraw={_redraw} />;
};

export default AnimatedIcon;
