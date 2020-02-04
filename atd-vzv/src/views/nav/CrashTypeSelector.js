import React, { useState, useEffect } from "react";
import classnames from "classnames";
import { Container, Nav } from "reactstrap";
import {
  fatalities,
  seriousInjuries,
  fatalitiesAndSeriousInjuries
} from "../../constants/crashTypeQueryStrings";

const CrashTypeSelector = ({ setCrashType }) => {
  const [activeTabType, setActiveTabType] = useState(
    fatalitiesAndSeriousInjuries
  );

  const toggleType = tabType => {
    if (activeTabType !== tabType) {
      setActiveTabType(tabType);
    }
  };

  useEffect(() => {
    console.log(activeTabType);
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
            { active: activeTabType === fatalities },
            "btn btn-secondary"
          )}
          onClick={() => {
            toggleType(fatalities);
          }}
        >
          Fatalities
        </button>
        <button
          type="button"
          className={classnames(
            { active: activeTabType === seriousInjuries },
            "btn btn-secondary"
          )}
          onClick={() => {
            toggleType(seriousInjuries);
          }}
        >
          Serious Injuries
        </button>
        <button
          type="button"
          className={classnames(
            {
              active: activeTabType === fatalitiesAndSeriousInjuries
            },
            "btn btn-secondary"
          )}
          onClick={() => {
            toggleType(fatalitiesAndSeriousInjuries);
          }}
        >
          Both
        </button>
      </Nav>
    </Container>
  );
};

export default CrashTypeSelector;
