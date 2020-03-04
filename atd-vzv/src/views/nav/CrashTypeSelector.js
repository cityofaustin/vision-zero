import React, { useState, useEffect } from "react";
import { Button, ButtonGroup } from "reactstrap";
import styled from "styled-components";
import { colors } from "../../constants/colors";

const CrashTypeSelector = ({ setCrashType }) => {
  const fatalities = {
    name: "fatalities",
    textString: "Fatalities",
    queryStringCrash: "(death_cnt > 0)",
    queryStringPerson: "(prsn_injry_sev_id = 4)"
  };

  const seriousInjuries = {
    name: "seriousInjuries",
    textString: "Serious Injuries",
    queryStringCrash: "(sus_serious_injry_cnt > 0)",
    queryStringPerson: "(prsn_injry_sev_id = 1)"
  };

  const [activeTab, setActiveTab] = useState([fatalities, seriousInjuries]);
  const [previousTabClicked, setPreviousTabClicked] = useState([]);

  const toggle = tab => {
    // Make a copy of the activeTab array that exists in state in order to mutate it
    let placeHolder = [...activeTab];
    // Attempt to filter out the object in the activeTab copy that matches the clicked tab
    let filteredObject = placeHolder.filter(
      objectChild => objectChild.name === tab.name
    );
    // Store the previous object filtered out to default back to if user clicks same tab twice
    setPreviousTabClicked(filteredObject);
    // If the clicked tab object is filtered out of the activeTab copy,
    // find any remaining objects and place them into a new array
    if (filteredObject.length) {
      let placeHolderChild = [];
      placeHolder.forEach(item => {
        if (item.name !== tab.name) {
          placeHolderChild.push(item);
        }
      });
      // If there are remaining objects, set them to replace the activeTab copy, clearing out the clicked tab,
      // else if there are no remaining objects, set the previous tab to replace the activeTab copy
      // (toggling back to previous state rather than emptying activeTab completely and returning no results)
      placeHolder = placeHolderChild.length
        ? placeHolderChild
        : previousTabClicked;
      // If the clicked tab object was not found in the activeTab copy,
      // add it back into the activeTab copy
    } else {
      placeHolder.push(tab);
    }
    // Set the activeTab copy to replace activeTab in state
    setActiveTab(placeHolder);
  };

  // Check to see whether a tab is unselected, return true if unselected
  const isUnselected = tab => {
    let filteredObject = activeTab.find(element => element.name === tab.name);
    let unselected = filteredObject ? false : true;
    return unselected;
  };

  // Set hover class based on whether button is unselected
  const setHoverClass = (unselected) => {
    return unselected
    ? "unselected"
    : "selected"
  };

  useEffect(() => {
    const fatalitiesAndSeriousInjuries = {
      name: "fatalitiesAndSeriousInjuries",
      textString: "Fatalities and Serious Injuries",
      queryStringCrash: "(death_cnt > 0 OR sus_serious_injry_cnt > 0)",
      queryStringPerson:
        "(prsn_injry_sev_id = 4 OR prsn_injry_sev_id = 1)"
    };

    const handleCrashType = () => {
      let selectedCrashType =
        activeTab.length > 1 ? fatalitiesAndSeriousInjuries : activeTab[0];
      return selectedCrashType;
    };

    setCrashType(handleCrashType());
  }, [setCrashType, activeTab]);

  // Set styles to override Bootstrap hover behavior based on whether button is selected
  const StyledButton = styled.div`
    .selected:hover {
      background-color: ${colors.info};
      border: 1px solid ${colors.info};
      color: ${colors.white};
    }
    .unselected:hover {
      background-color: ${colors.white};
      border: 1px solid ${colors.info};
      color: ${colors.info};
    }
  `;

  return (
    <StyledButton>
      <ButtonGroup className="mb-3 d-flex">
        <Button
          id="fatalities-btn"
          type="button"
          color="info"
          className={`${setHoverClass(isUnselected(fatalities))} w-100 pt-1 pb-1 pl-0 pr-0`}
          onClick={() => {
            toggle(fatalities);
          }}
          outline={isUnselected(fatalities)}
        >
          Fatalities
        </Button>
        <Button
          id="serious-injuries-btn"
          type="button"
          color="info"
          className={`${setHoverClass(isUnselected(seriousInjuries))} w-100 pt-1 pb-1 pl-0 pr-0`}
          onClick={() => {
            toggle(seriousInjuries);
          }}
          outline={isUnselected(seriousInjuries)}
        >
          Serious Injuries
        </Button>
      </ButtonGroup>
    </StyledButton>
  );
};

export default CrashTypeSelector;
