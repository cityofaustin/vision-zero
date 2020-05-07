import React, { forwardRef } from "react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import styled from "styled-components";

/**
 * Add a tooltip to a target component
 * @param {JSX} targetComponent // Target component for tooltip
 * @param {object} config // Config that includes tooltip html and trigger action
 */
export const addPopover = (targetComponent, config) => (
  <InfoPopover target={targetComponent} config={config} />
);

const InfoPopover = ({ target, config }) => {
  // TODO: Add action arg (hover, click, etc.)
  const StyledPopover = styled.div`
    font-size: 12px;
  `;

  const content = <StyledPopover>{config.html}</StyledPopover>;

  return (
    <Tippy
      content={content}
      popperOptions={{
        placement: "auto",
        modifiers: [
          //   {
          //     name: "flip",
          //     enabled: false,
          //   },
          //   {
          //     name: "preventOverflow",
          //     options: {
          //       altAxis: false,
          //       tether: true,
          //     },
          //   },
        ],
      }}
    >
      <span>{target}</span>
    </Tippy>
  );
};

export default InfoPopover;
