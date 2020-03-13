import React from "react";
import { useAuth0 } from "../../auth/authContext";
import { Spinner } from "reactstrap";

const Profile = () => {
  const { user, userClaims } = useAuth0();

  let token = userClaims.__raw;

  return !user ? (
    <Spinner className="mt-2" color="primary" />
  ) : (
    <>
      <h1>Profile</h1>
      <p>{user.nickname}</p>
      <img
        style={{ maxWidth: 50, maxHeight: 50 }}
        src={user.picture}
        alt="profile pic"
      />
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <div>
        <p>Token:</p>
        <textarea style={{ width: "80%", height: "200px" }}>{token}</textarea>
      </div>
    </>
  );
};

export default Profile;
