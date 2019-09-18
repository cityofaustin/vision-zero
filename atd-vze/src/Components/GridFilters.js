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
}) => {
  //
  let groups = [];
  let groupFilters = [];
  let filterOptions = [];

  const filterList = () => {
    let filtersList = [];
    for (let group in filters) {
      for (let filter of filters[group]["filters"]) {
        filtersList.push(filter.id);
      }
    }
    return filtersList;
  };

  const initializeFilterState = filters => {
    if (Object.keys(filterOptionsState).length === 0) {
      let initFilterOpts = [];
      for (let filter of filterList(filters)) {
        initFilterOpts[filter] = false;
      }
      setFilterOptions(initFilterOpts);
    } else {
      Object.assign(filterOptions, filterOptionsState);
    }
  };

  const handleChange = e => {
    filterOptions[e.target.id] = e.target.checked;
    setFilterOptions(filterOptions);
  };

  // If there are filters, then initialize
  if ((filters || null) !== null) initializeFilterState(filters);

  for (let group in filters) {
    for (let filter in filters[group]["filters"]) {
      let currentFilter = filters[group]["filters"][filter];

      groupFilters.push(
        <Row>
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
    }

    groups.push(
      <Col md="6" id={group}>
        <Collapse isOpen={isCollapsed}>
          <div>
            <Card>
              <CardHeader>
                <i className={"fa fa-" + filters[group]["icon"]} />
                <b>{filters[group]["label"]} </b>
              </CardHeader>
              <CardBody>{groupFilters}</CardBody>
            </Card>
          </div>
        </Collapse>
      </Col>
    );
    // Clean the current group for the next one:
    groupFilters = [];
  }

  return <>{groups}</>;
};

export default withApollo(GridFilters);
