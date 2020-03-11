import React, { useContext } from "react";
import { StoreContext } from "../../auth/authContextStore";

const Profile = () => {
  const {
    user: [user],
    getToken,
  } = useContext(StoreContext);

  let token = getToken();

  return !user ? null : (
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
