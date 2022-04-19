import express from "express";
import { createProduct, updateProduct, deleteProduct, getProduct, getAllProducts, getProductsStats } from '../views/product.js';

import {token ,auth, authAdmin} from "../middleware/auth.js";

const router = express.Router();

router.post('/',  auth, createProduct);
router.put('/:id',  auth, updateProduct);
router.delete('/:id',  auth, deleteProduct);
router.get('/search/:id',  auth, getProduct);
router.get('/',  auth, getAllProducts);
router.get('/stats',  authAdmin, getProductsStats);

export default router;