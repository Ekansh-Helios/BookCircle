import express from "express";
import { getUserNotifications, markAsRead } from "../controllers/notificationController.js";
import { authenticateUser } from "../middleware/authenticateUser.js";

const router = express.Router();

router.get("/:id", authenticateUser, getUserNotifications);
router.put("/read/:id", authenticateUser, markAsRead);

export default router;
