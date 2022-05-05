import express from "express";
import cloudinary from "cloudinary"; 
import UserModel from "../models/user.js";


const router = express.Router();

export const updateUser = async (req, res) => {
      
      const newUserData = {
            name: req.body.name,
            email: req.body.email,
        };

      if (req.body.avatar !== "") {
        const user = await UserModel.findById(req.user.id);

        const imageId = user.avatar.public_id;

        await cloudinary.v2.uploader.destroy(imageId);

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
          folder: "avatars",
          width: 150,
          crop: "scale",
        });
        newUserData.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      try {
        const user = await UserModel.findByIdAndUpdate(req.user.id, newUserData, {
          new: true,
          runValidator: true,
          useFindAndModify: false,
        });
        res.status(200).json(user);
      } catch (err) {
        res.status(500).json(err);
      }

};


export const deleteUser = async (req, res) => {

    const user = await UserModel.findById(req.params.id);

    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);

    if(!user){
        return res.status(400).json({ message: "User is not found with this id" });
    }


    try {
        await user.remove();
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
