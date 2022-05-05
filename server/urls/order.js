import express from "express";
import { 
    createOrder, 
    updateOrderAdmin, 
    deleteOrder, 
    getOrdersAdmin, 
    getUserOrders, 
    getOrdersStats 
} from '../views/order.js';

import { auth, authAdmin} from "../middleware/auth.js";

const router = express.Router();

router.post('/', auth, createOrder);
router.put('/:id', authAdmin, updateOrderAdmin);
router.delete('/:id', authAdmin, deleteOrder);
router.get('/', authAdmin, getOrdersAdmin);
router.get('/orders/me', auth, getUserOrders);
router.get('/stats', authAdmin, getOrdersStats);

export default router;
