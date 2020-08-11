import React from "react";

import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  Label,
  FormGroup,
  FormText,
} from "reactstrap";
import { useQuery } from "@apollo/react-hooks";
import { withApollo } from "react-apollo";
import { gql } from "apollo-boost";

const GET_VEHICLE_DESC_LKP = gql`
  {
    atd_txdot__veh_unit_desc_lkp {
      veh_unit_desc_id
      veh_unit_desc_desc
    }
  }
`;

const UnitsForm = ({ units, handleUnitFormChange, client }) => {
  const { data: lookupValues, loading } = useQuery(GET_VEHICLE_DESC_LKP);

  return (
    <>
      {units.map((unit, i) => {
        return (
          <Card key={`unitCard-${i + 1}`}>
            <CardHeader>Unit #{i + 1}</CardHeader>
            <CardBody>
              <FormGroup row>
                <Col md="3">
                  <Label htmlFor="unit-type">Unit Type</Label>
                </Col>
                <Col xs="12" md="9">
                  <Input
                    type="select"
                    id="unit-type"
                    name="unit-type"
                    placeholder="Enter Fatality Count..."
                    value={unit.unit_desc_id}
                    onChange={e =>
                      handleUnitFormChange({
                        type: "unit_desc_id",
                        payload: e.target.value,
                        unitIndex: i,
                      })
                    }
                  >
                    <option value={0}>Select the unit type...</option>
                    {!loading &&
                      lookupValues.atd_txdot__veh_unit_desc_lkp.map(item => {
                        return (
                          <option
                            value={item.veh_unit_desc_id}
                            key={`option-${item.veh_unit_desc_id}`}
                          >
                            {item.veh_unit_desc_desc}
                          </option>
                        );
                      })}
                  </Input>
                  <FormText className="help-block">
                    Please enter the Fatality Count
                  </FormText>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Col md="3">
                  <Label htmlFor={`fatality-count-${i + 1}`}>
                    Fatality Count
                  </Label>
                </Col>
                <Col xs="12" md="9">
                  <Input
                    type="number"
                    id={`fatality-count-${i + 1}`}
                    name={`fatality-count-${i + 1}`}
                    placeholder="Enter Fatality Count..."
                    value={unit.atd_fatality_count}
                    onChange={e =>
                      handleUnitFormChange({
                        type: "atd_fatality_count",
                        payload: e.target.value,
                        unitIndex: i,
                      })
                    }
                  />
                  <FormText className="help-block">
                    Please enter the Fatality Count
                  </FormText>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Col md="3">
                  <Label htmlFor={`sus-injury-cnt-${i + 1}`}>
                    Suspected Serious Injury Count
                  </Label>
                </Col>
                <Col xs="12" md="9">
                  <Input
                    type="number"
                    id={`sus-injury-cnt-${i + 1}`}
                    name={`sus-injury-cnt-${i + 1}`}
                    placeholder="Enter Suspected Serious Injury Count..."
                    value={unit.sus_serious_injry_cnt}
                    onChange={e =>
                      handleUnitFormChange({
                        type: "sus_serious_injry_cnt",
                        payload: e.target.value,
                        unitIndex: i,
                      })
                    }
                  />
                  <FormText className="help-block">
                    Please enter the Suspected Serious Injury Count
                  </FormText>
                </Col>
              </FormGroup>
            </CardBody>
          </Card>
        );
      })}
    </>
  );
};
export default withApollo(UnitsForm);
