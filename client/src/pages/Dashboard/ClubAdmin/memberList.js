import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

const MemberList = () => {
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Get clubId from Redux store
    const clubId = useSelector((state) => state.auth.userData?.clubId); 

    useEffect(() => {
        if (clubId) {
            fetchMembers();
        } else {
            setError("Club ID not found. Please log in again.");
            setLoading(false);
        }
    }, [clubId]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`http://localhost:5000/api/clubs/${clubId}/members`);
            setMembers(response.data);
        } catch (error) {
            setError(
                error.response?.data?.message || 
                "Error fetching members. Please try again later."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, isActive) => {
        if (window.confirm(`Are you sure you want to ${isActive ? "deactivate" : "activate"} this user?`)) {
            try {
                await axios.put(`http://localhost:5000/api/users/${id}/status`);
                fetchMembers(); // Refresh list
            } catch (error) {
                console.error("Error updating user status:", error);
                setError(
                    error.response?.data?.message || 
                    "Failed to update user status. Please try again."
                );
            }
        }
    };

    const filteredMembers = members.filter((member) => {
        const matchesSearch = searchTerm 
            ? member.name.toLowerCase().includes(searchTerm.toLowerCase()) 
            : true;
    
        const matchesStatus = filterStatus 
            ? (filterStatus === "Active" ? member.status === 1 : member.status === 0) 
            : true;
    
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Club Members</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {loading && <div className="text-center">Loading members...</div>}

            {!loading && !error && (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex">
                            <input
                                type="text"
                                className="form-control me-2"
                                placeholder="Search by name"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <select
                                className="form-select"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">All</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        <button 
                            className="btn btn-primary"
                            onClick={() => navigate("/addUser")}
                        >
                            + Add Member
                        </button>
                    </div>

                    {filteredMembers.length === 0 ? (
                        <p className="text-center text-muted">No members found.</p>
                    ) : (
                        <table className="table table-bordered">
                            <thead className="table-dark">
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>Date of Registration</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.map((member) => (
                                    <tr key={member.id}>
                                        <td>{member.name}</td>
                                        <td>{member.email}</td>
                                        <td>{member.phone || "N/A"}</td>
                                        <td>
                                            <span className={`badge ${member.status === 1 ? "bg-success" : "bg-danger"}`}>
                                                {member.status === 1 ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td>{new Date(member.CreatedAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric"
                                        })}</td>
                                        <td>
                                            <button 
                                                className="btn btn-warning btn-sm me-2" 
                                                onClick={() => navigate(`/update-member/${member.id}`)}
                                            >
                                                Update
                                            </button>
                                            <button 
                                                className={`btn ${member.status ? "btn-danger" : "btn-success"}`} 
                                                onClick={() => handleToggleStatus(member.userID, member.status)}
                                            > 
                                                {member.status ? "Deactivate" : "Activate"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            )}
        </div>
    );
};

export default MemberList;
