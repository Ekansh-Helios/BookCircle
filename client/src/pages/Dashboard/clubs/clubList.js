import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ClubList = () => {
  const [clubs, setClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("http://localhost:5000/api/clubs");

      // 🔹 Transform API Data with Default Values
      const formattedClubs = response.data.map((club) => ({
        id: club.ClubID ?? "N/A",
        name: club.Name?.trim() || "No Name Provided",
        location: club.Location || "Unknown",
        centralLocation: club.CentralLocation || "Not Specified",
        contactEmail: club.ContactEmail || "No Email",
        createdAt: club.CreatedAt ? new Date(club.CreatedAt).toLocaleDateString() : "N/A",
        updatedAt: club.UpdatedAt ? new Date(club.UpdatedAt).toLocaleDateString() : "N/A",
        status: club.isActive === 1 ? "Active" : "Inactive",
        totalMembers: club.totalMembers ?? 0, // 🔹 Added total members count
      }));

      setClubs(formattedClubs);
    } catch (error) {
      setError("Error fetching clubs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (clubId, currentStatus) => {
    const confirmMessage = currentStatus === "Active"
      ? "Are you sure you want to deactivate this club?"
      : "Are you sure you want to reactivate this club?";

    const isConfirmed = window.confirm(confirmMessage);

    if (!isConfirmed) return;

    try {
      await axios.patch(`http://localhost:5000/api/clubs/${clubId}/status`);
      fetchClubs();
    } catch (error) {
      alert("Error toggling club status.");
    }
  };

  // 🔹 Filter clubs based on search and status
  const filteredClubs = clubs.filter((club) => {
    const matchesSearch = searchTerm ? club.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    const matchesStatus = filterStatus ? club.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mt-4">
      <h2 className="mb-4">All Clubs</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="text-center">Loading clubs...</div>}

      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          className="form-control w-25"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="form-select w-25"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <button className="btn btn-primary" onClick={() => navigate("/createClub")}>
          Create Club
        </button>
      </div>

      {filteredClubs.length === 0 && !loading && <p className="text-center text-muted">No clubs found.</p>}

      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Club Name</th>
            <th>Location</th>
            <th>Central Location</th>
            <th>Contact Email</th>
            <th>Total Members</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredClubs.map((club) => (
            <tr key={club.id}>
              <td>{club.name}</td>
              <td>{club.location}</td>
              <td>{club.centralLocation}</td>
              <td>{club.contactEmail}</td>
              <td>{club.totalMembers}</td>
              <td>
                <span className={`badge ${club.status === "Active" ? "bg-success" : "bg-danger"}`}>
                  {club.status}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => navigate(`/update-club/${club.id}`)}
                >
                  Update
                </button>
                <button
                  className={`btn btn-sm ${club.status === "Active" ? "btn-danger" : "btn-success"}`}
                  onClick={() => handleToggleStatus(club.id, club.status)} // 🔹 Pass current status
                >
                  {club.status === "Active" ? "Deactivate" : "Reactivate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClubList;
