import React, { useState, useEffect } from "react";
import { Button } from "reactstrap";
import { trackPageEvent } from "../../../constants/nav";
import classnames from "classnames";
import { colors } from "../../../constants/colors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeartbeat, faMedkit } from "@fortawesome/free-solid-svg-icons";
import { CRASH_TYPES } from "src/constants/crashTypes";

const fatalitiesIcon = (
  <FontAwesomeIcon
    className="block-icon"
    icon={faHeartbeat}
    color={colors.fatalities}
  />
);

const seriousInjuriesIcon = (
  <FontAwesomeIcon
    className="block-icon"
    icon={faMedkit}
    color={colors.seriousInjuries}
  />
);

const CrashTypeSelector = ({ setCrashType, componentName }) => {
  const [activeTab, setActiveTab] = useState(
    CRASH_TYPES.fatalitiesAndSeriousInjuries,
  );

  const toggle = (tab) => {
    if (activeTab.name !== tab.name) {
      setActiveTab(tab);
    }
  };

  useEffect(() => {
    setCrashType(activeTab);
  }, [setCrashType, activeTab]);

  return (
    <>
      <Button
        id={`${componentName}-all-btn`}
        type="button"
        color="light"
        className={classnames(
          { active: activeTab.name === "fatalitiesAndSeriousInjuries" },
          "chart-toggle-button",
        )}
        onClick={() => {
          toggle(CRASH_TYPES.fatalitiesAndSeriousInjuries);
        }}
      >
        All
      </Button>
      <Button
        id={`${componentName}-fatalities-btn`}
        type="button"
        color="light"
        className={classnames(
          { active: activeTab.name === "fatalities" },
          "chart-toggle-button",
        )}
        onClick={() => {
          toggle(CRASH_TYPES.fatalities);
          trackPageEvent("fatal");
        }}
      >
        {fatalitiesIcon} Fatalities
      </Button>
      <Button
        id={`${componentName}-serious-injuries-btn`}
        type="button"
        color="light"
        className={classnames(
          { active: activeTab.name === "seriousInjuries" },
          "chart-toggle-button",
        )}
        onClick={() => {
          toggle(CRASH_TYPES.seriousInjuries);
          trackPageEvent("injury");
        }}
      >
        {seriousInjuriesIcon} Serious Injuries
      </Button>
    </>
  );
};

export default CrashTypeSelector;
