import React from "react";
import { useParams } from "react-router-dom";
import UserForm from "./UserForm";

const EditUser = () => {
  const { id } = useParams();

  return <UserForm type="Edit" id={id} />;
};

export default EditUser;
