import React, { Component } from "react";

class Profile extends Component {
  state = {
    profile: null,
    error: "",
  };

  componentDidMount() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.props.auth.getProfile((profile, error) =>
      this.setState({ profile, error })
    );
  }

  render() {
    const { profile } = this.state;
    if (!profile) return null;

    let token = localStorage.getItem("id_token");

    return (
      <>
        <h1>Profile</h1>
        <p>{profile.nickname}</p>
        <img
          style={{ maxWidth: 50, maxHeight: 50 }}
          src={profile.picture}
          alt="profile pic"
        />
        <pre>{JSON.stringify(profile, null, 2)}</pre>
        <div>
          <p>Token:</p>
          <textarea style={{ width: "80%", height: "200px" }}>{token}</textarea>
        </div>
      </>
    );
  }
}

export default Profile;
