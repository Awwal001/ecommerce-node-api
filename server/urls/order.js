import express from "express";
import { createOrder, updateOrder, deleteOrder, getOrders, getUserOrders, getOrdersStats } from '../views/order.js';

import {token ,auth, authAdmin} from "../middleware/auth.js";

const router = express.Router();

router.post('/', auth, createOrder);
router.put('/:id', auth, updateOrder);
router.delete('/:id', auth, deleteOrder);
router.get('/', auth, getOrders);
router.get('/search/:userId', authAdmin, getUserOrders);
router.get('/stats', authAdmin, getOrdersStats);

export default router;