
import express from 'express';
import { getUsers, addUser, toggleUserStatus, updateUser, resetPassword} from '../controllers/userController.js';

const router = express.Router();

router.get('/', getUsers);
router.post('/addUser', addUser);
router.put("/:id/status", toggleUserStatus);
router.put("/updateUser/:id", updateUser);
router.put("/resetPassword/:id", resetPassword);

export default router;
