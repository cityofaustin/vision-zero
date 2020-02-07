import React, { useState, useEffect } from "react";
import { ButtonGroup, Button } from "reactstrap";

const CrashTypeSelector = ({ setCrashType }) => {
  const fatalities = {
    queryString: "apd_confirmed_death_count > 0",
    textString: "Fatalities"
  };

  const seriousInjuries = {
    queryString: "sus_serious_injry_cnt > 0",
    textString: "Serious Injuries"
  };

  const fatalitiesAndSeriousInjuries = {
    queryString: "(apd_confirmed_death_count > 0 OR sus_serious_injry_cnt > 0)",
    textString: "Fatalities and Serious Injuries"
  };

  const [activeTab, setActiveTab] = useState([fatalities, seriousInjuries]);
  const [previousTabClicked, setPreviousTabClicked] = useState([]);

  const toggle = tab => {
      console.log(tab);
    // Make a copy of the activeTab array that exists in state in order to mutate it
    let placeHolder = [...activeTab];
    // Attempt to filter out the object in the activeTab copy that matches the clicked tab
    let filteredObject = placeHolder.filter(
      objectChild => objectChild.queryString === tab.queryString
    );
    // Store the previous object filtered out to default back to if user clicks same tab twice
    setPreviousTabClicked(filteredObject);
    // If the clicked tab object is filtered out of the activeTab copy,
    // find any remaining objects and place them into a new array
    if (filteredObject.length) {
      let placeHolderChild = [];
      placeHolder.forEach(item => {
        if (item.queryString !== tab.queryString) {
          placeHolderChild.push(item);
        }
      });
      // If there are remaining objects, set them to replace the activeTab copy, clearing out the clicked tab,
      // else if there are no remaining objects, set the previous tab to replace the activeTab copy
      // (toggling back to previous state rather than emptying activeTab completely and returning no results)
      if (placeHolderChild.length) {
        placeHolder = placeHolderChild;
      } else {
        placeHolder = previousTabClicked;
      }
      // If the clicked tab object was not found in the activeTab copy,
      // add it back into the activeTab copy
    } else {
      placeHolder.push(tab);
    }
    // Set the activeTab copy to replace activeTab in state
    setActiveTab(placeHolder);
  };

  const isFilterSet = tab => {
    let filteredObject = activeTab.find(
      element => element.queryString === tab.queryString
    );
    if (filteredObject) {
      return false;
    } else {
      return true;
    }
  };

  useEffect(() => {
    setCrashType(fatalitiesAndSeriousInjuries);
    debugger
  }, [fatalitiesAndSeriousInjuries, setCrashType]);

  return (
    <ButtonGroup className="mb-3 d-flex">
      <Button
        id="fatalities-btn"
        type="button"
        color="info"
        className={`w-100 pt-1 pb-1 pl-0 pr-0`}
        onClick={() => {
          toggle(fatalities);
        }}
        outline={isFilterSet(fatalities)}
      >
        Fatalities
      </Button>
      <Button
        id="serious-injuries-btn"
        type="button"
        color="info"
        className={`w-100 pt-1 pb-1 pl-0 pr-0`}
        onClick={() => {
          toggle(seriousInjuries);
        }}
        outline={isFilterSet(seriousInjuries)}
      >
        Serious Injuries
      </Button>
    </ButtonGroup>
  );
};

export default CrashTypeSelector;
