import React, { useState, useEffect } from "react";
import { Button } from "reactstrap";
import { trackPageEvent } from "../../../constants/nav";
import styled from "styled-components";
import classnames from "classnames";
import { colors } from "../../../constants/colors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeartbeat, faMedkit } from "@fortawesome/free-solid-svg-icons";

const CrashTypeSelector = ({ setCrashType, componentName }) => {
  const fatalitiesAndSeriousInjuries = {
    name: "fatalitiesAndSeriousInjuries",
    textString: "Fatalities and Serious Injuries",
    queryStringCrash: "(death_cnt > 0 OR sus_serious_injry_cnt > 0)",
    queryStringPerson: "(prsn_injry_sev_id = 4 OR prsn_injry_sev_id = 1)",
  };

  const fatalities = {
    name: "fatalities",
    textString: "Fatalities",
    queryStringCrash: "(death_cnt > 0)",
    queryStringPerson: "(prsn_injry_sev_id = 4)",
  };

  const seriousInjuries = {
    name: "seriousInjuries",
    textString: "Serious Injuries",
    queryStringCrash: "(sus_serious_injry_cnt > 0)",
    queryStringPerson: "(prsn_injry_sev_id = 1)",
  };

  const [activeTab, setActiveTab] = useState(fatalitiesAndSeriousInjuries);

  const toggle = (tab) => {
    if (activeTab.name !== tab.name) {
      setActiveTab(tab);
    }
  };

  useEffect(() => {
    setCrashType(activeTab);
  }, [setCrashType, activeTab]);

  // Set styles to override Bootstrap default styling
  const StyledButton = styled.div`
    .crash-type {
      font-size: 14px;
      color: ${colors.dark};
      background: ${colors.buttonBackground} 0% 0% no-repeat padding-box;
      border-style: none;
      border-radius: 18px;
      opacity: 1;
      margin-right: 2px;
    }
  `;

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

  return (
    <StyledButton>
      <Button
        id={`${componentName}-all-btn`}
        type="button"
        className={classnames(
          { active: activeTab.name === "fatalitiesAndSeriousInjuries" },
          "crash-type"
        )}
        onClick={() => {
          toggle(fatalitiesAndSeriousInjuries);
        }}
      >
        All
      </Button>
      <Button
        id={`${componentName}-fatalities-btn`}
        type="button"
        className={classnames(
          { active: activeTab.name === "fatalities" },
          "crash-type"
        )}
        onClick={() => {
          toggle(fatalities);
          trackPageEvent("fatal");
        }}
      >
        {fatalitiesIcon} Fatalities
      </Button>
      <Button
        id={`${componentName}-serious-injuries-btn`}
        type="button"
        className={classnames(
          { active: activeTab.name === "seriousInjuries" },
          "crash-type"
        )}
        onClick={() => {
          toggle(seriousInjuries);
          trackPageEvent("injury");
        }}
      >
        {seriousInjuriesIcon} Serious Injuries
      </Button>
    </StyledButton>
  );
};

export default CrashTypeSelector;
