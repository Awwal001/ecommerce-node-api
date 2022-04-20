import express from "express";
import { createOrder, updateOrder, deleteOrder, getOrders, getUserOrders, getOrdersStats } from '../views/order.js';

import {token ,auth, authAdmin} from "../middleware/auth.js";

const router = express.Router();

router.post('/', Token, createOrder);
router.put('/:id', authAdmin, updateOrder);
router.delete('/:id', authAdmin, deleteOrder);
router.get('/', authAdmin, getOrders);
router.get('/search/:userId', auth, getUserOrders);
router.get('/stats', authAdmin, getOrdersStats);

export default router;
