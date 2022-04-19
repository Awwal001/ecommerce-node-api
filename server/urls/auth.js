import express from "express";
import { signin, signup } from '../views/auth.js';


const router = express.Router();

router.post('/login', signin);
router.post('/register', signup);

export default router;