import express from "express";
import { 
    updateUser, 
    deleteUser, 
    getUser, 
    getAllUsers, 
    getUsersStats 
} from '../views/user.js';

import { auth, authAdmin} from "../middleware/auth.js";

const router = express.Router();

router.put('/:id', auth, updateUser);
router.delete('/:id', auth, deleteUser);
router.get('/search/:id', auth, getUser);
router.get('/', authAdmin, getAllUsers);
router.get('/stats', authAdmin, getUsersStats);

export default router;
