import express from "express";
import {
  getAllClubs,
  getClubById,
  createClub,
  updateClub,
  toggleClubStatus,
  getClubMembers,
} from "../controllers/clubController.js";

const router = express.Router();

// Routes for Club Management
router.get("/", getAllClubs); // Get all clubs
router.get("/:id", getClubById); // Get single club by ID
router.post("/", createClub); // Create new club
router.put("/:id", updateClub); // Update club details
router.patch("/:id/status", toggleClubStatus); // Toggle club active/inactive status

router.get("/:clubId/members", getClubMembers);// Get all members of a club

export default router;
