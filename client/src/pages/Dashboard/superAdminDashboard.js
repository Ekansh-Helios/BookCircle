import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({ totalClubs: 0, totalUsers: 0 });
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  useEffect(() => {
    // console.log('User Data in SuperAdminDashboard:', userData);
    if (userData && userData.userType !== "superAdmin") {
      navigate("/"); // Redirect non-superadmins
    }
    // fetchStats();
  }, [userData, navigate]);

  // const fetchStats = async () => {
  //   try {
  //     const { data } = await axios.get("http://localhost:5000/api/superadmin/stats");
  //     setStats(data);
  //   } catch (error) {
  //     console.error("Error fetching stats:", error);
  //   }
  // };

  return (
    <div className="container">
      <h1>Super Admin Dashboard</h1>
      {/* <div className="stats">
        <div className="card">
          <h2>Total Clubs</h2>
          <p>{stats.totalClubs}</p>
        </div>
        <div className="card">
          <h2>Total Users</h2>
          <p>{stats.totalUsers}</p>
        </div>
      </div> */}
      <div className="actions">
        <button onClick={() => navigate("/usersList")}>Manage Users</button>
        <button onClick={() => navigate("/clubList")}>Manage Clubs</button>
        {/* <button onClick={() => navigate("/categories")}>Manage Categories & Languages</button>
        <button onClick={() => navigate("/reports")}>View Reports & Analytics</button> */}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
