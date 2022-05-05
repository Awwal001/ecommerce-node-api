import express from "express";
import { createCart, updateCart, deleteCart, getUserCart, getAllCarts } from '../views/cart.js';

import {Token ,auth, authAdmin} from "../middleware/auth.js";

const router = express.Router();

router.post('/',  Token, createCart);
router.put('/:id', auth,  updateCart);
router.delete('/:id', auth, deleteCart);
router.get('/search/:userId',  auth, getUserCart);
router.get('/', authAdmin, getAllCarts);

export default router;
