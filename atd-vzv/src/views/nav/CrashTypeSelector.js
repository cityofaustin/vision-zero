import React, { useState, useEffect } from "react";
import classnames from "classnames";
import { Container, Nav } from "reactstrap";

const CrashTypeSelector = ({ setCrashType }) => {
    
  const [activeTabType, setActiveTabType] = useState(
    "death_cnt > 0 OR sus_serious_injry_cnt > 0"
  );

  const toggleType = tabType => {
    if (activeTabType !== tabType) {
      setActiveTabType(tabType);
    }
  };

  useEffect(() => {
    setCrashType(activeTabType);
  });

  return (
    <Container>
      <Nav
        className="btn-group justify-content-center"
        role="group"
        aria-label="Crash type filter"
      >
        <button
          type="button"
          className={classnames(
            { active: activeTabType === "death_cnt > 0" },
            "btn btn-secondary"
          )}
          onClick={() => {
            toggleType("death_cnt > 0");
          }}
        >
          Fatalities
        </button>
        <button
          type="button"
          className={classnames(
            { active: activeTabType === "sus_serious_injry_cnt > 0" },
            "btn btn-secondary"
          )}
          onClick={() => {
            toggleType("sus_serious_injry_cnt > 0");
          }}
        >
          Serious Injuries
        </button>
        <button
          type="button"
          className={classnames(
            {
              active:
                activeTabType === "death_cnt > 0 OR sus_serious_injry_cnt > 0"
            },
            "btn btn-secondary"
          )}
          onClick={() => {
            toggleType("death_cnt > 0 OR sus_serious_injry_cnt > 0");
          }}
        >
          Both
        </button>
      </Nav>
    </Container>
  );
};

export default CrashTypeSelector;
