import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({ totalClubs: 0, totalUsers: 0 });
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  useEffect(() => {
    if (userData && userData.userType !== "superAdmin") {
      navigate("/"); // Redirect non-superadmins
    }
    // fetchStats();
  }, [userData, navigate]);

  // Uncomment when API is ready
  // const fetchStats = async () => {
  //   try {
  //     const { data } = await axios.get("http://localhost:5000/api/superadmin/stats");
  //     setStats(data);
  //   } catch (error) {
  //     console.error("Error fetching stats:", error);
  //   }
  // };

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">Super Admin Dashboard</h1>

      {/* Stats Section (Uncomment when API is ready) */}
      {/* <div className="row mb-4">
        <div className="col-md-6">
          <div className="card shadow p-3 text-center">
            <h4 className="text-secondary">Total Clubs</h4>
            <h2 className="fw-bold">{stats.totalClubs}</h2>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow p-3 text-center">
            <h4 className="text-secondary">Total Users</h4>
            <h2 className="fw-bold">{stats.totalUsers}</h2>
          </div>
        </div>
      </div> */}

      {/* Actions Section */}
      <div className="row justify-content-center">
        <div className="col-md-3 mb-3">
          <button className="btn btn-primary w-100 p-3" onClick={() => navigate("/usersList")}>
            Manage Users
          </button>
        </div>
        <div className="col-md-3 mb-3">
          <button className="btn btn-primary w-100 p-3" onClick={() => navigate("/clubList")}>
            Manage Clubs
          </button>
        </div>
        {/* Uncomment when needed */}
        {/* <div className="col-md-3 mb-3">
          <button className="btn btn-outline-secondary w-100 p-3" onClick={() => navigate("/categories")}>
            Manage Categories & Languages
          </button>
        </div>
        <div className="col-md-3 mb-3">
          <button className="btn btn-outline-secondary w-100 p-3" onClick={() => navigate("/reports")}>
            View Reports & Analytics
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
