import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { updateUserProfile } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.userData);
    const token = sessionStorage.getItem("authToken");
    const navigate = useNavigate();

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        mobile: "",
    });

    // Update local state when Redux user changes
    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name || "",
                email: user.email || "",
                mobile: user.mobile || "",
            });

            // Log updated Redux state
            console.log("✅ Redux userData updated:", user);
        }
    }, [user]);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            // API Call to backend
            const response = await axios.put(
                `http://localhost:5000/api/users/updateUser/${user.id}`,
                {
                    name: profile.name,
                    email: profile.email,
                    mobile: profile.mobile,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // If successful
            if (response.status === 200) {
                // Update Redux Store
                await dispatch(
                    updateUserProfile({
                        userId: user.id,
                        name: profile.name,
                        email: profile.email,
                        mobile: profile.mobile,
                    })
                ).unwrap();

                alert("Profile Updated Successfully!");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to update profile");
        }
    };

    const handlePasswordReset = () => {
        navigate("/reset-password");
    };

    const handleDeactivate = async () => {
        if (window.confirm(`Are you sure you want to deactivate your account?`)) {
            try {
                await axios.put(
                    `http://localhost:5000/api/users/${user.id}/status`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                alert("Account Deactivated");
                handleLogout();
            } catch (error) {
                console.error("Error updating user status:", error);
                alert("Failed to deactivate account");
            }
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        window.location.href = "/login";
    };

    return (
        <div className="container-fluid min-vh-100 d-flex flex-column justify-content-center p-4 bg-light">
            <div className="mx-auto w-100 p-5">
                <h2 className="mb-5">
                    <i className="fas fa-user me-2"></i> Profile
                </h2>

                {/* Profile Fields */}
                <div className="row mb-4 align-items-center">
                    <label className="col-sm-3 col-form-label fw-bold">Name:</label>
                    <div className="col-sm-9">
                        <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={profile.name}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="row mb-4 align-items-center">
                    <label className="col-sm-3 col-form-label fw-bold">Email ID:</label>
                    <div className="col-sm-9">
                        <input
                            type="email"
                            name="email"
                            value={profile.email}
                            className="form-control"
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="row mb-4 align-items-center">
                    <label className="col-sm-3 col-form-label fw-bold">Phone Number:</label>
                    <div className="col-sm-9">
                        <input
                            type="text"
                            name="mobile"
                            value={profile.mobile}
                            className="form-control"
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="row mb-5">
                    <div className="col-sm-3"></div>
                    <div className="col-sm-9">
                        <button className="btn btn-primary" onClick={handleSave}>
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Reset Password */}
                <div className="row mb-4 align-items-center">
                    <label className="col-sm-3 col-form-label fw-bold">Reset Password:</label>
                    <div className="col-sm-9">
                        <button className="btn btn-warning" onClick={handlePasswordReset}>
                            Reset Password
                        </button>
                    </div>
                </div>

                {/* Deactivate */}
                <div className="row mb-4 align-items-center">
                    <label className="col-sm-3 col-form-label fw-bold">
                        {user.isActive ? "Deactivate Account:" : "Activate Account:"}
                    </label>
                    <div className="col-sm-9">
                        <button
                            className={`btn ${user.isActive ? "btn-danger" : "btn-success"}`}
                            onClick={handleDeactivate}
                        >
                            {user.isActive ? "Deactivate Account" : "Activate Account"}
                        </button>
                    </div>
                </div>


                {/* Logout */}
                <div className="row mb-4 align-items-center">
                    <label className="col-sm-3 col-form-label fw-bold">Log Out:</label>
                    <div className="col-sm-9">
                        <button className="btn btn-secondary" onClick={handleLogout}>
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
