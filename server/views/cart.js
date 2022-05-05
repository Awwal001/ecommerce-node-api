import express from "express";
import CartModel from "../models/cart.js";

const router = express.Router();

export const createCart = async (req, res) => {
    const newCart = new CartModel(req.body);

    try {
        const savedCart = await newCart.save();
    res.status(200).json(savedCart);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}


export const updateCart = async (req, res) => {
      
      try {
        const updatedCart = await CartModel.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true }
        );
        res.status(200).json(updatedCart);
      } catch (err) {
        res.status(500).json(err);
      }

};


export const deleteCart = async (req, res) => {
    try {
        await CartModel.findByIdAndDelete(req.params.id);
        res.status(200).json("Cart has been deleted...");
      } catch (err) {
        res.status(500).json(err);
      }
};

export const getUserCart = async (req, res) => {
    try {
        const cart = await CartModel.findOne({ userId: req.params.userId });
        res.status(200).json(cart);
      } catch (err) {
        res.status(500).json(err);
      }
};

export const getAllCarts = async (req, res) => {
    try {
        const carts = await CartModel.find();
        res.status(200).json(carts);
      } catch (err) {
        res.status(500).json(err);
      }
};

export default router;
