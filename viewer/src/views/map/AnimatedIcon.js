import React from "react";
import { CanvasOverlay } from "react-map-gl";

const SIZE = 66.6667;
const DURATION = 1000;

const AnimatedIcon = ({ location, paint }) => {
  const { x, y } = location;
  const _redraw = ({ width, height, ctx, project }) => {
    const coordinates = project([x, y]);

    const t = (performance.now() % DURATION) / DURATION;

    const radius = (SIZE / 2) * 0.3;
    const outerRadius = (SIZE / 2) * 0.7 * t + radius;

    // Draw the outer circle.
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.arc(coordinates[0], coordinates[1], outerRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${paint.r}, ${paint.g}, ${paint.b}, ${1 - t})`;
    ctx.fill();

    // Draw the inner circle.
    ctx.beginPath();
    ctx.arc(coordinates[0], coordinates[1], radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${paint.r}, ${paint.g}, ${paint.b}, ${paint.a})`;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2 + 4 * (1 - t);
    ctx.fill();
    ctx.stroke();
  };

  return <CanvasOverlay redraw={_redraw} />;
};

export default AnimatedIcon;
