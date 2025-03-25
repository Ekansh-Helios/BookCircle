import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

const ClubAdminDashboard = () => {
  const [clubName, setClubName] = useState("");
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalSuccessfulTransactions, setTotalSuccessfulTransactions] = useState(0);
  const navigate = useNavigate();

  const clubId = useSelector((state) => state.auth.userData.clubId); // Adjust based on your Redux state structure

  useEffect(() => {
    if (!clubId) return; // Ensure clubId is available before making a request

    // Fetch club details
    axios.get(`http://localhost:5000/api/clubs/${clubId}`)
      .then(response => {
        setTotalMembers(response.data.totalMembers);
        setClubName(response.data.Name);
      })
      .catch(error => console.error("Error fetching club details:", error));

    // Fetch total successful transactions (completed borrow requests)
    axios.get(`http://localhost:5000/api/transactions/successful/${clubId}`)
      .then(response => setTotalSuccessfulTransactions(response.data.totalSuccessfulTransactions))
      .catch(error => console.error("Error fetching successful transactions:", error));

  }, [clubId]);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">{clubName} - Club Admin Dashboard</h2>
      <div className="row">
        <div className="col-md-6">
          <div className="card p-3 text-center">
            <h4>Total Members</h4>
            <p className="display-6">{totalMembers}</p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card p-3 text-center">
            <h4>Total Successful Transactions</h4>
            <p className="display-6">{totalSuccessfulTransactions}</p>
          </div>
        </div>
      </div>

      {/* Manage Members Button */}
      <div className="row mt-4">
        <div className="col-md-3">
          <button className="btn btn-secondary w-100" onClick={() => navigate("/clubMembers")}>Manage Members</button>
        </div>
      </div>
    </div>
  );
};

export default ClubAdminDashboard;
