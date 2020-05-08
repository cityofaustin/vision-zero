import React, { forwardRef } from "react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

/**
 * Custom Hook to create a tooltip info icon and tooltip populated with content
 * @param {object} config // Config that includes tooltip html and trigger action
 */
export const useInfoPopover = (config) => <InfoPopover config={config} />;

const InfoPopover = ({ config }) => {
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
      <span>
        <FontAwesomeIcon className="info-icon" icon={faInfoCircle} />
      </span>
    </Tippy>
  );
};

export default InfoPopover;
