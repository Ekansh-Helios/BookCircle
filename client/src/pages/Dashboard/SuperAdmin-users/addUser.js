import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AddUser = () => {
    const navigate = useNavigate();
    const userRole = useSelector((state) => state.auth.userData?.userType);
    const clubAdminClubId = useSelector((state) => state.auth.userData?.clubId);  

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        userType: userRole === "clubAdmin" ? "user" : "user", 
        password: "",
        clubId: userRole === "clubAdmin" ? clubAdminClubId : "", 
    });

    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userRole === "superAdmin") {
            fetchClubs();
        }
    }, [userRole]);

    const fetchClubs = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/clubs");
            setClubs(response.data);
        } catch (error) {
            console.error("Error fetching clubs:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.mobile || !formData.password || !formData.clubId) {
            alert("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            await axios.post("http://localhost:5000/api/users/addUser", formData, {
                headers: { "Content-Type": "application/json" },
            });

            alert("User added successfully!");
            if(userRole === "superAdmin"){
                navigate("/usersList");
            }else{
                navigate("/clubMembers")
            }
        } catch (error) {
            console.error("Error adding user:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Failed to add user.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h2>Add New User</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
                </div>

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="mb-3">
                    <label className="form-label">Mobile</label>
                    <input type="text" name="mobile" className="form-control" value={formData.mobile} onChange={handleChange} required />
                </div>

                {/* Role selection (visible only for Super Admin) */}
                {userRole === "superAdmin" && (
                    <div className="mb-3">
                        <label className="form-label">Role</label>
                        <select name="userType" className="form-select" value={formData.userType} onChange={handleChange}>
                            <option value="user">User</option>
                            <option value="clubAdmin">Club Admin</option>
                        </select>
                    </div>
                )}

                {/* Club Selection (only visible for Super Admin) */}
                {userRole === "superAdmin" && (
                    <div className="mb-3">
                        <label className="form-label">Assign to Club</label>
                        <select name="clubId" className="form-select" value={formData.clubId} onChange={handleChange} required>
                            <option value="">Select a Club</option>
                            {clubs.map((club) => (
                                <option key={club.ClubID} value={club.ClubID}>
                                    {club.Name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} required />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Adding..." : "Add User"}
                </button>
            </form>
        </div>
    );
};

export default AddUser;
