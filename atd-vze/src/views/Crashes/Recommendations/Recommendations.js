import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  Input,
  DropdownItem,
} from "reactstrap";
import { recommendationsDataMap } from "./recommendationsDataMap";
import {
  GET_RECOMMENDATIONS,
  INSERT_RECOMMENDATION,
  UPDATE_RECOMMENDATION,
} from "../../../queries/recommendations";
import { useAuth0, isReadOnly } from "../../../auth/authContext";

const RowLabelData = ({
  label,
  placeholder,
  existingValue,
  field,
  doesRecommendationRecordExist,
  onAdd,
  onEdit,
}) => {
  const isExistingValue = existingValue.length > 0 && existingValue !== null;
  const initialInputValue = isExistingValue ? existingValue : "";

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(initialInputValue);

  const handleAddClick = () => {
    const valuesObject = { [field]: inputValue };

    onAdd(valuesObject);
    setIsEditing(false);
  };

  const handleSaveClick = () => {
    const valuesObject = { [field]: inputValue };

    onEdit(valuesObject);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const isAddingRecommendation =
    doesRecommendationRecordExist === false && isEditing === false;
  const canEditRecommendation =
    doesRecommendationRecordExist === true && isEditing === false;
  const isEditingRecommendation =
    doesRecommendationRecordExist === true && isEditing === true;
  console.log(
    field,
    isAddingRecommendation,
    canEditRecommendation,
    isEditingRecommendation
  );

  return (
    <div>
      <p>
        <b>{label}</b>
      </p>
      <div className="row">
        {(isAddingRecommendation ||
          isEditingRecommendation ||
          !isExistingValue) && (
          <div className="col-10">
            <Input
              type="textarea"
              placeholder={placeholder}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
            ></Input>
          </div>
        )}
        {canEditRecommendation && isExistingValue && (
          <div className="col-10">{existingValue}</div>
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
        {!isExistingValue && (
          <div className="col-1">
            <Button
              type="submit"
              color="primary"
              onClick={handleSaveClick}
              className="btn-pill mt-2"
              size="sm"
              style={{ width: "50px" }}
            >
              Add
            </Button>
          </div>
        )}
        {canEditRecommendation && isExistingValue && (
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

// TODOs
// 1. Only show recommendation card if atd_fatality_count > 0 && user is role = "Admin" or above
// 2. Match styling designs
// 3. Make sure add/edit/cancel buttons align with notes
// 4. Test adding with each field in new records

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
  const recommendationRecordId = recommendation?.id;

  // Get current value from returned data if there is one
  const getLookupValue = ({ lookupOptions, key }) => {
    return recommendation?.[lookupOptions]?.[key] || "";
  };

  const getFieldValue = field => recommendation?.[field] || "";

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
                data={recommendation?.text}
                placeholder={"Enter recommendation here..."}
                existingValue={getFieldValue(fieldConfig.fields.text.key)}
                field={fieldConfig.fields.text.key}
                doesRecommendationRecordExist={doesRecommendationRecordExist}
                onAdd={onAdd}
                onEdit={onEdit}
              ></RowLabelData>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <RowLabelData
                label={"Updates"}
                data={recommendation?.update}
                placeholder={"Enter updates here..."}
                existingValue={getFieldValue(fieldConfig.fields.update.key)}
                field={fieldConfig.fields.update.key}
                doesRecommendationRecordExist={doesRecommendationRecordExist}
                onAdd={onAdd}
                onEdit={onEdit}
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
