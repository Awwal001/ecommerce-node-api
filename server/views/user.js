import express from "express";
import bcrypt from "bcryptjs";
import UserModel from "../models/user.js";
import mongoose from "mongoose";

const router = express.Router();

export const updateUser = async (req, res) => {
      
    if (req.body.password) {
        req.body.password = await bcrypt.hash(password, 12)
      }
    
      try {
        const updatedUser = await UserModel.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true }
        );
        res.status(200).json(updatedUser);
      } catch (err) {
        res.status(500).json(err);
      }

};


// export const updateUser = async (req, res) => {
//     const { id } = req.params;
//     const { email, password, firstname, lastname } = req.body;
    
//     if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No user with id: ${id}`);

//     if (req.body.password) {
//         req.body.password = await bcrypt.hash(password, 12)
//       }

//     const updatedUser = { email, password, firstname, lastname,  _id: id };

//     await UserModel.findByIdAndUpdate(id, updatedUser, { new: true });

//     res.json(updatedUser);
// }

export const deleteUser = async (req, res) => {
    try {
        await UserModel.findByIdAndDelete(req.params.id);
        res.status(200).json("User has been deleted...");
      } catch (err) {
        res.status(500).json(err);
      }
};

export const getUser = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        
        res.status(200).json(user);
      } catch (err) {
        res.status(500).json(err);
      }
};

export const getAllUsers = async (req, res) => {
    const query = req.query.new;
    try {
        const users = query
        ? await UserModel.find().sort({ _id: -1 }).limit(5)
        : await UserModel.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
};

export const getUsersStats = async (req, res) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

    try {
        const data = await UserModel.aggregate([
        { $match: { createdAt: { $gte: lastYear } } },
        {
            $project: {
            month: { $month: "$createdAt" },
            },
        },
        {
            $group: {
            _id: "$month",
            total: { $sum: 1 },
            },
        },
        ]);
        res.status(200).json(data)
    } catch (err) {
        res.status(500).json(err);
        }
};



export default router;