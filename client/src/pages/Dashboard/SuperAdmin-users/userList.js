import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState({});
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchClubs();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/users");
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchClubs = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/clubs");
      // console.log("Fetched Clubs from API:", response.data);
      const clubsMap = {};
      response.data.forEach((club) => {
        clubsMap[club.ClubID] = club.Name;
      });
      // console.log("Mapped Clubs:", clubsMap);
      setClubs(clubsMap);
    } catch (error) {
      console.error("Error fetching clubs:", error);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(value.toLowerCase()) ||
        user.email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleEdit = (id) => {
    navigate(`/edit-user/${id}`);
  };

  const handleToggleStatus = async (id, isActive) => {
    if (window.confirm(`Are you sure you want to ${isActive ? "deactivate" : "activate"} this user?`)) {
      try {
        await axios.put(`http://localhost:5000/api/users/${id}/status`);
        fetchUsers(); // Refresh list
      } catch (error) {
        console.error("Error updating user status:", error);
      }
    }
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Users Management</h2>
      <div className="d-flex justify-content-between mb-3">
        <button className="btn btn-primary" onClick={() => navigate("/addUser")}>Add User</button>
        <input
          type="text"
          className="form-control w-25"
          placeholder="Search by name or email"
          value={search}
          onChange={handleSearch}
        />
      </div>
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile Number</th>
            <th>Club</th>
            <th>User Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user, index) => (
            <tr key={user.id}>
              <td>{index + 1 + indexOfFirstUser}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.mobile}</td>
              {/* <td>{user.clubId ? clubs[user.clubId] || "Unknown Club" : "N/A"}</td> */}
              <td>{user.clubId && clubs[user.clubId] ? clubs[user.clubId] : "No Club Assigned"}</td>
              <td>{user.userType}</td>
              <td>
                <button className="btn btn-success btn-sm me-2" onClick={() => handleEdit(user.id)}>
                  Edit
                </button>
                <button 
                  className={`btn ${user.isActive ? "btn-danger" : "btn-success"}`} 
                  onClick={() => handleToggleStatus(user.id, user.isActive)}
                > 
                  {user.isActive ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="d-flex justify-content-between align-items-center">
        <button
          className="btn btn-secondary"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Prev
        </button>
        <span>Page {currentPage}</span>
        <button
          className="btn btn-secondary"
          disabled={indexOfLastUser >= filteredUsers.length}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UsersList;
