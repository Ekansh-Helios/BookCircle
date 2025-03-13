
import express from 'express';
import { getUsers, addUser, toggleUserStatus} from '../controllers/userController.js';

const router = express.Router();

router.get('/', getUsers);
router.post('/addUser', addUser);
router.put("/:id/status", toggleUserStatus);

export default router;
