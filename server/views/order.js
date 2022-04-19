import express from "express";
import OrderModel from "../models/order.js";
import mongoose from "mongoose";

const router = express.Router();

export const createOrder = async (req, res) => {
    const newOrder = new OrderModel(req.body);

    try {
        const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}


export const updateOrder = async (req, res) => {
      
      try {
        const updatedOrder = await OrderModel.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true }
        );
        res.status(200).json(updatedOrder);
      } catch (err) {
        res.status(500).json(err);
      }

};



export const deleteOrder = async (req, res) => {
    try {
        await OrderModel.findByIdAndDelete(req.params.id);
        res.status(200).json("Order has been deleted...");
      } catch (err) {
        res.status(500).json(err);
      }
};

export const getUserOrders = async (req, res) => {
    try {
        const orders = await OrderModel.find({ userId: req.params.userId });
        res.status(200).json(orders);
      } catch (err) {
        res.status(500).json(err);
      }
};

export const getOrders = async (req, res) => {
    try {
        const orders = await OrderModel.find();
        res.status(200).json(orders);
      } catch (err) {
        res.status(500).json(err);
      }
};

// export const getOrder = async (req, res) => {
//     try {
//         const order = await OrderModel.findOne({ userId: req.params.userId });
//         res.status(200).json(order);
//       } catch (err) {
//         res.status(500).json(err);
//       }
// };


export const getOrdersStats = async (req, res) => {
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

    try {
        const income = await OrderModel.aggregate([
        { $match: { createdAt: { $gte: previousMonth } } },
        {
            $project: {
            month: { $month: "$createdAt" },
            sales: "$amount",
            },
        },
        {
            $group: {
            _id: "$month",
            total: { $sum: "$sales" },
            },
        },
        ]);
        res.status(200).json(income);
    } catch (err) {
        res.status(500).json(err);
    }
};



export default router;