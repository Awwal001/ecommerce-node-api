import express from "express";
import { 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    getProduct, 
    getAllProducts, 
    getProductsStats,
    createProductReview,
    getSingleProductReviews,
    deleteReview 
} from '../views/product.js';

import {auth, authAdmin} from "../middleware/auth.js";

const router = express.Router();

router.post('/', authAdmin, createProduct);
router.put('/:id', authAdmin, updateProduct);
router.delete('/:id', authAdmin, deleteProduct);
router.get('/search/:id', getProduct);
router.get('/', getAllProducts);
router.get('/stats', authAdmin,  getProductsStats);


router.post('/', auth, createProductReview);
router.get('/:id', auth, getSingleProductReviews);
router.delete('/:id', auth, deleteReview);

export default router;
