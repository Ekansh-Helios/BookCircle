import React from "react";
import { useSelector } from "react-redux";

function UserProfile() {
  const userData = useSelector((state) => state.auth.userData);

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Welcome to User Home Screen</h2>
      <div style={{ textAlign: "center" }}>
        <h2>
          Name: {userData?.name} <br /> Email: {userData?.email}
        </h2>
      </div>
    </div>
  );
}

export default UserProfile;