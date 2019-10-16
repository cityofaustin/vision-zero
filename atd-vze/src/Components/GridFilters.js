import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Collapse,
  Row,
  Label,
} from "reactstrap";
import { withApollo } from "react-apollo";
import { AppSwitch } from "@coreui/react";

const GridFilters = ({
  isCollapsed,
  filters,
  filterOptionsState,
  setFilterOptions,
  resetPageOnSearch,
}) => {
  // Filter options serves as a helper to load and stage the options from filterOptionsState
  let filterOptions = {};

  /**
   * Returns an array with the names of each filter in the filter configuration.
   * The map function produces a 2D array, concat.apply will flatten it to a 1D array.
   * @param {object} filterConf - the filter configuration.
   * @returns {string[]}
   */
  const filterList = filterConf => {
    return [].concat.apply(
      [],
      Object.keys(filterConf).map(groupName => {
        return filterConf[groupName]["filters"].map(item => item.id);
      })
    );
  };

  /**
   * Initializes the filter state, if the filter state is initialized then
   * it loads it into the container.
   * @param {object} filters - the filter settings
   */
  const initializeFilterState = filters => {
    if (Object.keys(filterOptionsState).length === 0) {
      // We need to build an object, from an array:
      let initFilterOpts = {};

      // We will iterate through each key, and build the object:
      filterList(filters).forEach(filterName => {
        initFilterOpts[filterName] = false;
      });

      // The object is then passed to the state:
      setFilterOptions(initFilterOpts);
    } else {
      // Load the existing sate to our filterOptions variable
      Object.assign(filterOptions, filterOptionsState);
    }
  };

  /**
   * Toggles any filter to ON or OFF (true, false), then passes the change to the state.
   * @param {object} event - the DOM event
   */
  const handleChange = event => {
    filterOptions[event.target.id] = event.target.checked;
    setFilterOptions(filterOptions);
    resetPageOnSearch();
  };

  // If there are filters, then initialize.
  if (!!filters) initializeFilterState(filters);

  let groups = Object.keys(filters || {}).map(groupName => {
    let group = filters[groupName];

    let groupFilters = group["filters"].map(currentFilter => {
      return (
        <Row key={`filter--${currentFilter.id}`}>
          <AppSwitch
            id={currentFilter.id}
            onChange={handleChange}
            className={"mx-1"}
            variant={"3d"}
            color={"success"}
            checked={filterOptionsState[currentFilter.id] || false}
          />
          <Label size={"lg"} style={{ padding: 0 }}>
            {currentFilter.label}
          </Label>
        </Row>
      );
    });

    return (
      <Col md="6" id={groupName} key={`groupName--${groupName}`}>
        <Collapse isOpen={isCollapsed}>
          <div>
            <Card>
              <CardHeader>
                <i className={"fa fa-" + group["icon"]} />
                <b>{group["label"]} </b>
              </CardHeader>
              <CardBody>{groupFilters}</CardBody>
            </Card>
          </div>
        </Collapse>
      </Col>
    );
  });

  return <>{groups}</>;
};

export default withApollo(GridFilters);
