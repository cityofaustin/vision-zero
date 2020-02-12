import React, { useState, useEffect } from "react";
import { ButtonGroup, Button } from "reactstrap";
import styled, { css } from "styled-components";

const CrashTypeSelector = ({ setCrashType }) => {
  const fatalities = {
    name: "fatalities",
    textString: "Fatalities",
    queryStringCrash: "(death_cnt > 0)",
    queryStringDemographics: "(prsn_injry_sev_id = 4)"
  };

  const seriousInjuries = {
    name: "seriousInjuries",
    textString: "Serious Injuries",
    queryStringCrash: "(sus_serious_injry_cnt > 0)",
    queryStringDemographics: "(prsn_injry_sev_id = 1)"
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

  const isUnselected = tab => {
    let filteredObject = activeTab.find(element => element.name === tab.name);
    let filteredBoolean = filteredObject ? false : true;
    return filteredBoolean;
  };

  useEffect(() => {
    const fatalitiesAndSeriousInjuries = {
      name: "fatalitiesAndSeriousInjuries",
      textString: "Fatalities and Serious Injuries",
      queryStringCrash: "(death_cnt > 0 OR sus_serious_injry_cnt > 0)",
      queryStringDemographics:
        "(prsn_injry_sev_id = 4 OR prsn_injry_sev_id = 1)"
    };

    const handleCrashType = () => {
      let selectedCrashType =
        activeTab.length > 1 ? fatalitiesAndSeriousInjuries : activeTab[0];
      return selectedCrashType;
    };

    setCrashType(handleCrashType());
  }, [setCrashType, activeTab]);

  const Button = styled.button`
    background: #5bc0de;
    border: 2px solid #5bc0de;
    color: white;
    margin: 0.5em 0;
    padding: 0.25em 1em;
    width: 40%;

    ${props =>
      props.unselected &&
      css`
      background: transparent;
      color: #5bc0de;
    `}

    ${props =>
      props.fatalities &&
      css`
      border-radius: 3px 0 0 3px;
    `}

    ${props =>
      props.seriousInjuries &&
      css`
      border-radius: 0 3px 3px 0;
    `}
  `;

  const Container = styled.div`
    text-align: center;
  `;

  return (
    <Container>
      <Button
        fatalities
        id="fatalities-btn"
        type="button"
        unselected={isUnselected(fatalities)}
        onClick={() => {
          toggle(fatalities);
        }}
      >
        Fatalities
      </Button>
      <Button
        seriousInjuries
        id="serious-injuries-btn"
        type="button"
        unselected={isUnselected(seriousInjuries)}
        onClick={() => {
          toggle(seriousInjuries);
        }}
      >
        Serious Injuries
      </Button>
    </Container>
  );
};

export default CrashTypeSelector;
