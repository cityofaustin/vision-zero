import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Table,
  Button,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  Input,
  DropdownItem,
} from "reactstrap";
import { recommendationsDataMap } from "./recommendationsDataMap";
import {
  GET_RECOMMENDATIONS,
  GET_PARTNERS,
  GET_STATUS,
} from "../../queries/recommendations";
import { useAuth0, isReadOnly } from "../../auth/authContext";

// declare fatality review board recommendations component
const Recommendations = ({ crashId }) => {
  // add state variable to manage when user is editing
  const [editMode, setEditMode] = useState(false);
  const [newRecommendation, setNewRecommendation] = useState("");
  const [statusDropdownOpen, setStatusOpen] = useState(false);
  const [partnerDropdownOpen, setPartnerOpen] = useState(false);

  // disable edit features if role is "readonly"
  const { getRoles } = useAuth0();
  const roles = getRoles();

  // fetch recommendation table from database using graphQL query
  const { loading, error, data, refetch } = useQuery(GET_RECOMMENDATIONS, {
    variables: { crashId },
  });

  // fetch coordination partner table using graphQL query
  const {
    loading: loadingP,
    error: errorP,
    data: dataP,
    refetch: refetchP,
  } = useQuery(GET_PARTNERS);

  // fetch status table using graphQL query
  const {
    loading: loadingS,
    error: errorS,
    data: dataS,
    refetch: refetchS,
  } = useQuery(GET_STATUS);

  if (loading || loadingP || loadingS) return "Loading...";
  if (error || errorP || errorS) return `Error! ${error.message}`;

  const fieldConfig = recommendationsDataMap;
  const recommendation = data?.recommendations?.[0];

  // if crash has data in recommendations table, display it
  const displayData = (data, { lookupOptions, key }) => {
    if (recommendation) {
      if (lookupOptions) {
        return data[lookupOptions][key];
      } else {
        return data[key];
      }
    }
  };

  const renderEditButton = () => {
    return (
      <td>
        <Button
          type="submit"
          color="secondary"
          size="sm"
          className="btn-pill mt-2"
          style={{ width: "50px" }}
          onClick={handleEditClick}
        >
          <i className="fa fa-pencil edit-toggle" />
        </Button>
      </td>
    );
  };

  const renderSaveButton = () => {
    return (
      <td>
        <Button
          color="primary"
          className="btn-pill mt-2"
          size="sm"
          style={{ width: "50px" }}
          onClick={e => handleSaveClick}
        >
          <i className="fa fa-check edit-toggle" />
        </Button>
      </td>
    );
  };

  const renderCancelButton = () => {
    return (
      <td>
        <Button
          type="submit"
          color="danger"
          className="btn-pill mt-2"
          size="sm"
          style={{ width: "50px" }}
          onClick={e => handleCancelClick}
        >
          <i className="fa fa-times edit-toggle" />
        </Button>
      </td>
    );
  };

  // render input field if there is currently no record
  const renderInput = field => {
    if (recommendation?.[field]) {
      return displayData(recommendation, fieldConfig.fields.text);
    } else {
      return (
        <div>
          <Input
            type="textarea"
            placeholder="Enter recommendation here..."
            value={newRecommendation}
            onChange={e => setNewRecommendation(e.target.value)}
          ></Input>
          <Button
            type="submit"
            color="primary"
            onClick={handleAddClick}
            className="btn-pill mt-2"
            size="sm"
            style={{ width: "50px" }}
          >
            Add
          </Button>
        </div>
      );
    }
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleSaveClick = () => {};

  const handleCancelClick = () => {};

  const handleAddClick = () => {};

  const handleDropdownClick = () => {};

  // render dropdown menu
  const renderDropDown = (table, setOpen, dropdownOpen) => {
    return (
      <ButtonDropdown
        toggle={() => {
          setOpen(!dropdownOpen);
        }}
        isOpen={dropdownOpen}
        direction={"down"}
      >
        <DropdownToggle
          caret
          style={{ backgroundColor: "transparent", border: "0" }}
        >
          <DropdownMenu>
            {table.map(row => {
              return (
                <DropdownItem onClick={handleDropdownClick}>
                  {row.description}
                </DropdownItem>
              );
            })}
          </DropdownMenu>
        </DropdownToggle>
      </ButtonDropdown>
    );
  };

  return (
    <Card>
      <CardHeader>Fatality Review Board Recommendations</CardHeader>
      <CardBody style={{ padding: "5px 20px 20px 20px" }}>
        <Table>
          <thead>
            <tr>
              <th
                style={{
                  width: "17%",
                  "border-top": "0px",
                  "border-bottom": "1px",
                }}
              >
                Coordination Partner:
              </th>
              <td
                style={{
                  width: "30%",
                  "border-top": "0px",
                  "border-bottom": "1px",
                }}
              >
                {displayData(
                  recommendation,
                  fieldConfig.fields.coordination_partner_id
                )}
                {renderDropDown(
                  dataP.atd__coordination_partners_lkp,
                  setPartnerOpen,
                  partnerDropdownOpen
                )}
              </td>
              <th
                style={{
                  width: "7%",
                  "border-top": "0px",
                  "border-bottom": "1px",
                }}
              >
                Status:
              </th>
              <td
                style={{
                  width: "46%",
                  "border-top": "0px",
                  "border-bottom": "1px",
                }}
              >
                {displayData(
                  recommendation,
                  fieldConfig.fields.recommendation_status_id
                )}
                {renderDropDown(
                  dataS.atd__recommendation_status_lkp,
                  setStatusOpen,
                  statusDropdownOpen
                )}
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan={4}>
                <p>
                  <b>Recommendation</b>
                </p>
                {renderInput("text")}
              </td>
              {!isReadOnly(roles) && !editMode && renderEditButton()}
            </tr>
            <tr>
              <td colspan={4}>
                <p>
                  <b>Updates</b>
                </p>
                {renderInput("update")}
              </td>
              {!isReadOnly(roles) && !editMode && renderEditButton()}
            </tr>
          </tbody>
        </Table>
      </CardBody>
      <CardFooter></CardFooter>
    </Card>
  );
};

export default Recommendations;
