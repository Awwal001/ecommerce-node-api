import express from "express";
import OrderModel from "../models/order.js";
import ProductModel from "../models/product.js";

const router = express.Router();

export const createOrder = async (req, res) => {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
  } = req.body;

    try {
      const order = await OrderModel.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt:Date.now(),
        user: req.user._id,
    });
    res.status(200).json(order);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}


export const updateOrderAdmin = async (req, res) => {


      const order = await OrderModel.findById(req.params.id);
      
      if(!order){
        return res.status(404).json({ message: "Order is not found with this id" });
      }

      if (order.orderStatus === "Delivered") {
        return res.status(400).json({ message: "You have already delivered this order" });
      }

      if (req.body.status === "Shipped") {
        order.orderItems.forEach(async (o) => {
          await updateStock(o.product, o.quantity);
        });
      }
      order.orderStatus = req.body.status;

      if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
      }
      
      try {
        await order.save({ validateBeforeSave: false });
        res.status(200).json({
          success: true,
        });
      } catch (err) {
        res.status(500).json(err);
      }

};


async function updateStock(id, quantity) {
      
  const product = await ProductModel.findById(id);

  product.Stock -= quantity;

  await product.save({ validateBeforeSave: false });
}



export const deleteOrder = async (req, res) => {

    const order = await OrderModel.findById(req.params.id);

    if(!order){
      return res.status(404).json({ message: "Order is not found with this id" });
    }

    try {
        await order.remove();
        res.status(200).json("Order has been deleted...");
      } catch (err) {
        res.status(500).json(err);
      }
};

export const getUserOrders = async (req, res) => {
    try {
        const orders = await OrderModel.find({user: req.user._id});
        res.status(200).json(orders);
      } catch (err) {
        res.status(500).json(err);
      }
};

export const getOrdersAdmin = async (req, res) => {
    try {
        const orders = await OrderModel.find();

        let totalAmount = 0;

        orders.forEach((order) =>{
            totalAmount += order.totalPrice;
        });

        res.status(200).json({
          success: true,
          totalAmount,
          orders
      });
      } catch (err) {
        res.status(500).json(err);
      }
};


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
