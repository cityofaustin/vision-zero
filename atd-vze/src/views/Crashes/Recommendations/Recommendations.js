import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Table,
  Button,
  Dropdown,
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
  // setNewInput,
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
  showInput,
}) => {
  const [isEditing, setIsEditing] = useState(true);

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
          // setNewInput("");
          refetch();
        })
        .catch(error => console.error(error));
    } else {
      addRecommendation({
        variables: addVariableDict,
      })
        .then(response => {
          // setNewInput("");
          refetch();
        })
        .catch(error => console.error(error));
    }
  };

  const handleSaveClick = variables => {
    console.log("saving", variables);
    // editRecommendation({
    //   variables: variables,
    // })
    //   .then(response => {
    //     refetch().then(response => {
    //       setEditedField("");
    //     });
    //   })
    //   .catch(error => console.error(error));
  };

  const handleEditClick = () => {
    // setEditedField(data);
    setIsEditing(true);
  };

  // 1. if there is a recommendation or update - show the content
  // 2. if there is not a recommendation or update - take the same width but empty
  // 3. if we are in edit mode - show text area input and check button and
  // 4. Add and edit pencil icons overlap (one col for pencil/add and on col for cancel/empty)
  // 5. Show pencil when editing

  // State:
  // 1. isEditing (toggle between #2 and #3 below)
  // Modes:
  // 1. Add (no rec yet) doesFatalityRecommendationExist = false isEditing = false showInput = true
  //  - Show input
  //  - Show Add button
  // 2. Can Edit (rec already) doesFatalityRecommendationExist = true isEditing = false showInput = false
  //  - Show value text
  //  - Show Pencil icon
  // 3. Is Editing doesFatalityRecommendationExist = true isEditing = true showInput = true
  //  - Show value in input
  //  - Show check icon (fires mutation)
  //  - Show cancel button (closes edit mode)
  const isAddingRecommendation =
    doesFatalityRecommendationExist === false &&
    isEditing === false &&
    showInput === true;
  const canEditingRecommendation =
    doesFatalityRecommendationExist === true &&
    isEditing === false &&
    showInput === false;
  const isEditingRecommendation =
    doesFatalityRecommendationExist === true &&
    isEditing === true &&
    showInput === true;

  return (
    <div>
      <p>
        <b>{label}</b>
      </p>
      <div className="row">
        {showInput && (
          <>
            <div className="col-10">
              <Input
                type="textarea"
                placeholder={placeholder}
                value={newInput}
                // onChange={e => setNewInput(e.target.value)}
              ></Input>
            </div>
            <div className="col-1">
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
          </>
        )}
        {data && !isEditing && (
          <>
            <div className="col-10">{displayData(hasData, field)}</div>
            <div className="col-1">
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
          </>
        )}
        {/* {data && isEditing && (
          <div className="col-2">
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
        )} */}
      </div>
    </div>
  );
};

const SelectValueDropdown = ({ value, onOptionClick, options, field }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = e => {
    const value = e.target.id;

    onOptionClick(field, value);
  };

  return (
    <Dropdown
      toggle={() => {
        setIsOpen(!isOpen);
      }}
      isOpen={isOpen}
      className="mb-3"
    >
      <DropdownToggle
        className="w-100 pt-1"
        style={{ backgroundColor: "transparent", border: "0" }}
      >
        <div className="row">
          <div className="col-11 px-0">{value}</div>
          <div className="col-1 px-1">
            <i className="fa fa-caret-down fa-lg"></i>
          </div>
        </div>
      </DropdownToggle>
      <DropdownMenu>
        {options.map(option => {
          return (
            <DropdownItem
              id={option.id}
              key={option.id}
              onClick={handleOptionClick}
            >
              {option.description}
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
};

// declare fatality review board recommendations component
const Recommendations = ({ crashId }) => {
  // add state variable to manage when user is editing
  const [newRecommendation, setNewRecommendation] = useState("");
  const [newUpdate, setNewUpdate] = useState("");
  const [editedRecommendation, setEditedRecommendation] = useState("");
  const [editedUpdate, setEditedUpdate] = useState("");

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
  const doesFatalityRecommendationExist = data?.recommendations?.[0]
    ? true
    : false;

  // Get current value from returned data if there is one
  const displayData = ({ lookupOptions, key }) => {
    return recommendation?.[lookupOptions]?.[key] || "";
  };

  // Use these booleans to determine what show in the UI
  // Do we need the partner and status ones?
  const hasUpdate = !!recommendation?.update;
  const hasRecommendation = !!recommendation?.text;
  const recommendationRecordId = recommendation?.id;

  const onAddFromDropdownClick = (field, id) => {
    const recommendationRecord = {
      crashId,
      userEmail,
      [field]: parseInt(id),
    };

    addRecommendation({
      variables: recommendationRecord,
    })
      .then(() => {
        refetch();
      })
      .catch(error => console.error(error));
  };

  const onEditFromDropdownClick = (field, id) => {
    const changes = { [field]: parseInt(id) };

    editRecommendation({
      variables: {
        id: recommendationRecordId,
        changes,
      },
    })
      .then(() => {
        refetch();
      })
      .catch(error => console.error(error));
  };

  return (
    <Card>
      <CardHeader>Fatality Review Board Recommendations</CardHeader>
      <CardBody>
        <div className="container">
          <div className="row border-bottom">
            <div className="col-12 col-lg-6">
              <div className="row">
                <div className="col-auto pr-0">
                  <div className="font-weight-bold pt-1">
                    {fieldConfig.fields.coordination_partner_id.label}
                  </div>
                </div>
                <div className="col-8">
                  <SelectValueDropdown
                    value={displayData(
                      fieldConfig.fields.coordination_partner_id
                    )}
                    onOptionClick={
                      doesFatalityRecommendationExist
                        ? onEditFromDropdownClick
                        : onAddFromDropdownClick
                    }
                    options={data.atd__coordination_partners_lkp}
                    field={"coordination_partner_id"}
                  />
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="row">
                <div className="col-auto pr-0">
                  <div className="font-weight-bold pt-1">
                    {fieldConfig.fields.recommendation_status_id.label}
                  </div>
                </div>
                <div className="col-8">
                  <SelectValueDropdown
                    value={displayData(
                      fieldConfig.fields.recommendation_status_id
                    )}
                    onOptionClick={
                      doesFatalityRecommendationExist
                        ? onEditFromDropdownClick
                        : onAddFromDropdownClick
                    }
                    options={data.atd__recommendation_status_lkp}
                    field={"recommendation_status_id"}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
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
            </div>
          </div>
          <div className="row">
            <div className="col-12">
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
            </div>
          </div>
        </div>
      </CardBody>
      <CardFooter></CardFooter>
    </Card>
  );
};

export default Recommendations;
