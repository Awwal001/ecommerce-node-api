import express from "express";
import {
    signin,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    updatePassword,
  } from '../views/auth.js';
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/logout", logout);
router.post('/login', signin);
router.post('/register', signup);
router.put("/me/update", auth, updatePassword);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);

export default router;
