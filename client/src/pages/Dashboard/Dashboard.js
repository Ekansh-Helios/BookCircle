import React from "react";
import { useSelector } from "react-redux";
import SuperAdminDashboard from "./superAdminDashboard";
import ClubAdminDashboard from "./clubAdminDashboard";

const Dashboard = () => {
  // Get user role from Redux store
  const userRole = useSelector((state) => state.auth.userData.userType);
  
  return (
    <div>
      {userRole === "superAdmin" ? (
        <SuperAdminDashboard />
      ) : userRole === "clubAdmin" ? (
        <ClubAdminDashboard />
      ) : (
        <p>Unauthorized Access</p>
      )}
    </div>
  );
};

export default Dashboard;
