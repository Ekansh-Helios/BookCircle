import { pool } from "../config/db.js";

// Get all clubs
export const getAllClubs = async (req, res) => {
  try {
    const [clubs] = await pool.query(`
      SELECT 
          c.ClubID, 
          c.Name, 
          c.Location, 
          c.CentralLocation, 
          c.ContactEmail, 
          c.isActive, 
          c.CreatedAt, 
          c.UpdatedAt,
          COUNT(u.id) AS totalMembers  -- Count total members in each club
      FROM clubs c
      LEFT JOIN users u ON c.ClubID = u.clubID  -- Join clubs with users based on clubID
      GROUP BY c.ClubID;  -- Group by ClubID to avoid duplication
    `);

    res.json(clubs); // Send updated response to the frontend
  } catch (err) {
    console.error("Error fetching clubs:", err);
    res.status(500).json({ message: "Database error" });
  }
};


// Get club by ID
export const getClubById = async (req, res) => {
  const { id } = req.params;
  try {
    const [club] = await pool.query(`
      SELECT 
          c.ClubID, 
          c.Name, 
          c.Location, 
          c.CentralLocation, 
          c.ContactEmail, 
          c.isActive, 
          c.CreatedAt, 
          c.UpdatedAt,
          (SELECT COUNT(id) FROM users WHERE clubId = c.ClubID) AS totalMembers
      FROM clubs c
      WHERE c.ClubID = ?;
    `, [id]);

    if (club.length === 0) return res.status(404).json({ message: "Club not found" });

    res.json(club[0]); // Send only the first row
  } catch (err) {
    console.error("Error fetching club details:", err);
    res.status(500).json({ message: "Database error" });
  }
};



// Create a new club
export const createClub = async (req, res) => {
  const { Name, Location, CentralLocation, ContactEmail } = req.body;
  
  if (!Name || !Location || !CentralLocation || !ContactEmail) {
    return res.status(400).json({ message: "All fields are required from backend" });
  }

  try {
    const [existingClub] = await pool.query("SELECT * FROM clubs WHERE Name = ?", [Name]);
    if (existingClub.length > 0) {
      return res.status(400).json({ message: "Club with this name already exists" });
    }

    const query = `INSERT INTO clubs (Name, Location, CentralLocation, ContactEmail, isActive) VALUES (?, ?, ?, ?, ?)`;
    const values = [Name, Location, CentralLocation, ContactEmail, true];

    await pool.query(query, values);
    res.status(201).json({ message: "Club created successfully" });
  } catch (err) {
    console.error("Error creating club:", err);
    res.status(500).json({ message: "Database error" });
  }
};

// Update club details
export const updateClub = async (req, res) => {
  const { id } = req.params;
  const { Name, Location, CentralLocation, ContactEmail } = req.body;

  try {
    const query = `UPDATE clubs SET Name = ?, Location = ?, CentralLocation = ?, ContactEmail = ?, UpdatedAt = NOW() WHERE ClubID = ?`;
    const values = [Name, Location, CentralLocation, ContactEmail, id];

    const [result] = await pool.query(query, values);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Club not found" });

    res.json({ message: "Club updated successfully" });
  } catch (err) {
    console.error("Error updating club:", err);
    res.status(500).json({ message: "Database error" });
  }
};

// Toggle club status (Activate/Deactivate)
export const toggleClubStatus = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [club] = await pool.query("SELECT isActive FROM clubs WHERE ClubID = ?", [id]);
    if (club.length === 0) return res.status(404).json({ message: "Club not found" });

    const newStatus = !club[0].isActive;
    await pool.query("UPDATE clubs SET isActive = ?, UpdatedAt = NOW() WHERE ClubID = ?", [newStatus, id]);

    res.json({ message: `Club ${newStatus ? "activated" : "deactivated"} successfully` });
  } catch (err) {
    console.error("Error toggling club status:", err);
    res.status(500).json({ message: "Database error" });
  }
};

export const getClubMembers = async (req, res) => {
  const { clubId } = req.params;

  try {
    const [members] = await pool.query(
      `SELECT 
          id AS userID, 
          name, 
          email, 
          mobile AS phone, 
          isActive AS status, 
          CreatedAt 
      FROM users 
      WHERE clubId = ?`, 
      [clubId]
    );

    res.json(members);
  } catch (err) {
    console.error("Error fetching members:", err);
    res.status(500).json({ message: "Database error" });
  }
};

