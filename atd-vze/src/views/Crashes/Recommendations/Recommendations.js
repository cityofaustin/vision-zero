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
import AddButton from "../../../Components/AddButton";
import EditButton from "../../../Components/EditButton";
import CancelButton from "../../../Components/CancelButton";
import SaveButton from "../../../Components/SaveButton";
import { recommendationsDataMap } from "./recommendationsDataMap";
import {
  GET_RECOMMENDATIONS,
  INSERT_RECOMMENDATION,
  UPDATE_RECOMMENDATION,
} from "../../../queries/recommendations";
import { useAuth0, isReadOnly } from "../../../auth/authContext";

const RowLabelData = ({
  label,
  table,
  data,
  newInput,
  setNewInput,
  editedField,
  setEditedField,
  placeholder,
  hasData,
  field,
  displayData,
  refetch,
  addVariableDict,
  editVariableDict,
  editedVariableDict,
}) => {
  const [editMode, setEditMode] = useState(false);

  // declare mutation functions
  const [addRecommendation] = useMutation(INSERT_RECOMMENDATION);
  const [editRecommendation] = useMutation(UPDATE_RECOMMENDATION);

  const handleAddClick = () => {
    if (data) {
      const id = table?.id;
      editRecommendation({
        variables: editVariableDict,
      })
        .then(response => {
          setNewInput("");
          refetch();
        })
        .catch(error => console.error(error));
    } else {
      addRecommendation({
        variables: addVariableDict,
      })
        .then(response => {
          setNewInput("");
          refetch();
        })
        .catch(error => console.error(error));
    }
  };

  const handleSaveClick = () => {
    editRecommendation({
      variables: editedVariableDict,
    })
      .then(response => {
        refetch().then(response => {
          setEditedField("");
        });
      })
      .catch(error => console.error(error));
  };

  const handleEditClick = () => {
    setEditedField(data);
    setEditMode(true);
  };

  return (
    <td>
      <p>
        <b>{label}</b>
      </p>
      {!data && (
        <div>
          <Input
            type="textarea"
            placeholder={placeholder}
            value={newInput}
            onChange={e => setNewInput(e.target.value)}
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
      )}
      {data && !editMode && (
        <div>
          {displayData(hasData, field)}
          <Button
            color="secondary"
            size="sm"
            className="btn-pill mt-2"
            style={{ width: "50px" }}
            onClick={handleEditClick}
          >
            <i className="fa fa-pencil edit-toggle" />
          </Button>
        </div>
      )}
      {data && editMode && (
        <div>
          <Input
            type="textarea"
            defaultValue={data}
            onChange={e => setEditedField(e.target.value)}
          ></Input>
          <Button
            color="primary"
            className="btn-pill mt-2"
            size="sm"
            style={{ width: "50px" }}
            onClick={e => handleSaveClick}
          >
            <i className="fa fa-check edit-toggle" />
          </Button>
          <CancelButton></CancelButton>
        </div>
      )}
    </td>
  );
};

// declare fatality review board recommendations component
const Recommendations = ({ crashId }) => {
  // add state variable to manage when user is editing
  const [newRecommendation, setNewRecommendation] = useState("");
  const [newUpdate, setNewUpdate] = useState("");
  const [editedRecommendation, setEditedRecommendation] = useState("");
  const [editedUpdate, setEditedUpdate] = useState("");
  const [statusDropdownOpen, setStatusOpen] = useState(false);
  const [partnerDropdownOpen, setPartnerOpen] = useState(false);

  // disable edit features if role is "readonly"
  const { getRoles } = useAuth0();
  const roles = getRoles();

  // get current users email
  const userEmail = localStorage.getItem("hasura_user_email");

  // fetch recommendation table from database using graphQL query
  const { loading, error, data, refetch } = useQuery(GET_RECOMMENDATIONS, {
    variables: { crashId },
  });

  // declare mutation functions
  const [addRecommendation] = useMutation(INSERT_RECOMMENDATION);
  const [editRecommendation] = useMutation(UPDATE_RECOMMENDATION);

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const fieldConfig = recommendationsDataMap;
  const recommendation = data?.recommendations?.[0];

  // if there is data for a certain field in the recommendations table, display it
  const displayData = (hasData, { lookupOptions, key }) => {
    if (hasData) {
      if (lookupOptions) {
        return recommendation[lookupOptions][key];
      } else {
        return recommendation[key];
      }
    }
  };

  // displayData(recommendation, fieldConfig.fields.text);

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
              return <DropdownItem>{row.description}</DropdownItem>;
            })}
          </DropdownMenu>
        </DropdownToggle>
      </ButtonDropdown>
    );
  };

  const hasPartner = !!recommendation?.coordination_partner_id;
  const hasStatus = !!recommendation?.recommendation_status_id;
  const hasUpdate = !!recommendation?.update;
  const hasRecommendation = !!recommendation?.text;
  const id = recommendation?.id;

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
                  hasPartner,
                  fieldConfig.fields.coordination_partner_id
                )}
                {renderDropDown(
                  data.atd__coordination_partners_lkp,
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
                  hasStatus,
                  fieldConfig.fields.recommendation_status_id
                )}
                {renderDropDown(
                  data.atd__recommendation_status_lkp,
                  setStatusOpen,
                  statusDropdownOpen
                )}
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <RowLabelData
                label={"Recommendation"}
                table={recommendation}
                data={recommendation?.text}
                placeholder={"Enter recommendation here..."}
                displayData={displayData}
                hasData={hasRecommendation}
                field={fieldConfig.fields.text}
                editedField={editedRecommendation}
                setEditedField={setEditedRecommendation}
                newInput={newRecommendation}
                setNewInput={setNewRecommendation}
                refetch={refetch}
                addVariableDict={{
                  recommendation: newRecommendation,
                  crashId: crashId,
                  userEmail: userEmail,
                }}
                editVariableDict={{
                  recommendation: newRecommendation,
                }}
                editedVariableDict={{
                  recommendation: editedRecommendation,
                }}
              ></RowLabelData>
            </tr>
            <tr>
              <RowLabelData
                label={"Updates"}
                table={recommendation}
                data={recommendation?.update}
                placeholder={"Enter updates here..."}
                displayData={displayData}
                hasData={hasUpdate}
                field={fieldConfig.fields.update}
                editedField={editedUpdate}
                setEditedField={setEditedUpdate}
                newInput={newUpdate}
                setNewInput={setNewUpdate}
                refetch={refetch}
                addVariableDict={{
                  update: newUpdate,
                  crashId: crashId,
                  userEmail: userEmail,
                }}
                editVariableDict={{
                  update: newUpdate,
                }}
                editedVariableDict={{
                  update: editedUpdate,
                }}
              ></RowLabelData>
            </tr>
          </tbody>
        </Table>
      </CardBody>
      <CardFooter></CardFooter>
    </Card>
  );
};

export default Recommendations;
