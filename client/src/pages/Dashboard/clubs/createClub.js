import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ClubCreation = () => {
  const [clubData, setClubData] = useState({
    Name: "",
    Location: "",
    CentralLocation: "",
    ContactEmail: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClubData({ ...clubData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!clubData.Name || !clubData.Location || !clubData.CentralLocation || !clubData.ContactEmail) {
      setError("All fields are required from frontend");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/clubs", clubData);
      setSuccess("Club created successfully");
      setTimeout(() => navigate("/clubList"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Error creating club");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Create Club</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      
      <form onSubmit={handleSubmit}>
        <input type="text" name="Name" placeholder="Club Name" value={clubData.name} onChange={handleChange} className="w-full p-2 border rounded mb-3" />
        <input type="text" name="Location" placeholder="Location" value={clubData.location} onChange={handleChange} className="w-full p-2 border rounded mb-3" />
        <input type="text" name="CentralLocation" placeholder="Central Location" value={clubData.centralLocation} onChange={handleChange} className="w-full p-2 border rounded mb-3" />
        <input type="email" name="ContactEmail" placeholder="Contact Email" value={clubData.contactEmail} onChange={handleChange} className="w-full p-2 border rounded mb-3" />

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Create Club</button>
      </form>

      <button onClick={() => navigate("/clubList")} className="mt-4 text-blue-500">Cancel</button>
    </div>
  );
};

export default ClubCreation;
