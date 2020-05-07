import React from "react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import styled from "styled-components";

export const usePopover = (targetComponent, config) => (
  <InfoPopover target={targetComponent} config={config} />
);

const InfoPopover = ({ target, config }) => {
  // TODO: Create custom hook to inject popover into DOM
  // TODO: Args - component to wrap, obj ref with text/icons/etc, action (hover, click, etc.)
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
