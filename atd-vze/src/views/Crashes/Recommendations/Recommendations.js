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
  // table,
  data,
  newInput,
  // setNewInput,
  editedField,
  setEditedField,
  placeholder,
  hasFieldValue,
  // field,
  displayData,
  refetch,
  // addVariableDict,
  // editVariableDict,
  // editedVariableDict,
  // Added
  field,
  doesRecommendationRecordExist,
  onSave,
  // handleAddClick,
  // handleEditClick,
}) => {
  const isExistingValue = displayData.length > 0 && displayData !== null;
  const initialInputValue = isExistingValue ? displayData : "";

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(initialInputValue);

  const handleAddClick = () => {
    console.log("adding");
  };

  const handleSaveClick = () => {
    const valuesObject = { [field]: inputValue };
    onSave(valuesObject);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  // 1. if there is a recommendation or update - show the content
  // 2. if there is not a recommendation or update - take the same width but empty
  // 3. if we are in edit mode - show text area input and check button and
  // 4. Add and edit pencil icons overlap (one col for pencil/add and on col for cancel/empty)
  // 5. Show pencil when editing

  // State:
  // 1. isEditing (toggle between #2 and #3 below)
  // Modes:
  // 1. Add (no rec yet) doesRecommendationRecordExist = false isEditing = false showInput = true
  //  - Show input
  //  - Show Add button
  // 2. Can Edit (rec already) doesRecommendationRecordExist = true isEditing = false showInput = false
  //  - Show value text
  //  - Show Pencil icon
  // 3. Is Editing doesRecommendationRecordExist = true isEditing = true showInput = true
  //  - Show value in input
  //  - Show check icon (fires mutation)
  //  - Show cancel button (closes edit mode)
  const isAddingRecommendation =
    doesRecommendationRecordExist === false && isEditing === false;
  const canEditRecommendation =
    doesRecommendationRecordExist === true && isEditing === false;
  const isEditingRecommendation =
    doesRecommendationRecordExist === true && isEditing === true;
  console.log(canEditRecommendation, displayData, inputValue);

  return (
    <div>
      <p>
        <b>{label}</b>
      </p>
      <div className="row">
        {(isAddingRecommendation || isEditingRecommendation) && (
          <div className="col-10">
            <Input
              type="textarea"
              placeholder={placeholder}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
            ></Input>
          </div>
        )}
        {isAddingRecommendation && (
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
        )}
        {canEditRecommendation && (
          <>
            <div className="col-10">{displayData}</div>
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
        {isEditingRecommendation && (
          <>
            <div className="col-1">
              <Button
                color="primary"
                className="btn-pill mt-2"
                size="sm"
                style={{ width: "50px" }}
                onClick={handleSaveClick}
              >
                <i className="fa fa-check edit-toggle" />
              </Button>
            </div>
            <div className="col-1">
              <Button
                color="danger"
                className="btn-pill mt-2"
                size="sm"
                style={{ width: "50px" }}
                onClick={handleCancelClick}
              >
                <i className="fa fa-times edit-toggle" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const SelectValueDropdown = ({ value, onOptionClick, options, field }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = e => {
    const { id } = e.target;

    // Mutation expects ids as integers
    const valuesObject = { [field]: parseInt(id) };
    onOptionClick(valuesObject);
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
  const doesRecommendationRecordExist = recommendation ? true : false;

  // Get current value from returned data if there is one
  const getLookupValue = ({ lookupOptions, key }) => {
    return recommendation?.[lookupOptions]?.[key] || "";
  };

  const getFieldValue = field => recommendation?.[field] || "";

  // Use these booleans to determine what show in the UI
  // Do we need the partner and status ones?
  const hasUpdate = !!recommendation?.update;
  const hasRecommendation = !!recommendation?.text;
  const recommendationRecordId = recommendation?.id;

  const onAdd = valuesObject => {
    const recommendationRecord = {
      crashId,
      userEmail,
      ...valuesObject,
    };

    addRecommendation({
      variables: recommendationRecord,
    })
      .then(() => {
        refetch();
      })
      .catch(error => console.error(error));
  };

  const onEdit = changesObject => {
    editRecommendation({
      variables: {
        id: recommendationRecordId,
        changes: changesObject,
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
        <div className="container-fluid">
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
                    value={getLookupValue(
                      fieldConfig.fields.coordination_partner_id
                    )}
                    onOptionClick={
                      doesRecommendationRecordExist ? onEdit : onAdd
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
                    value={getLookupValue(
                      fieldConfig.fields.recommendation_status_id
                    )}
                    onOptionClick={
                      doesRecommendationRecordExist ? onEdit : onAdd
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
                displayData={getFieldValue(fieldConfig.fields.text.key)}
                hasFieldValue={hasRecommendation}
                field={fieldConfig.fields.text.key}
                doesRecommendationRecordExist={doesRecommendationRecordExist}
                onSave={doesRecommendationRecordExist ? onEdit : onAdd}
                refecth={refetch}
                // editedField={editedRecommendation}
                // setEditedField={setEditedRecommendation}
                // newInput={newRecommendation}
                // setNewInput={setNewRecommendation}
                // refetch={refetch}
                // addVariableDict={{
                //   recommendation: newRecommendation,
                //   crashId: crashId,
                //   userEmail: userEmail,
                // }}
                // editVariableDict={{
                //   recommendation: newRecommendation,
                // }}
                // editedVariableDict={{
                //   recommendation: editedRecommendation,
                // }}
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
                displayData={getFieldValue(fieldConfig.fields.update.key)}
                hasData={hasUpdate}
                field={fieldConfig.fields.update.key}
                doesRecommendationRecordExist={doesRecommendationRecordExist}
                onSave={doesRecommendationRecordExist ? onEdit : onAdd}
                refecth={refetch}
                // editedField={editedUpdate}
                // setEditedField={setEditedUpdate}
                // newInput={newUpdate}
                // setNewInput={setNewUpdate}
                // refetch={refetch}
                // addVariableDict={{
                //   update: newUpdate,
                //   crashId: crashId,
                //   userEmail: userEmail,
                // }}
                // editVariableDict={{
                //   update: newUpdate,
                // }}
                // editedVariableDict={{
                //   update: editedUpdate,
                // }}
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
