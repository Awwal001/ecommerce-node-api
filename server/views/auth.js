import express from "express";
import UserModel from "../models/user.js";
import cloudinary from "cloudinary";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import sendMail from "../utils/sendMail.js";

const router = express.Router();

export const signup = async (req, res) => {

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });
    const { email, password, firstname, lastname } = req.body;
  
    try {
      const oldUser = await UserModel.findOne({ email });
  
      if (oldUser) return res.status(400).json({ message: "User already exists" });
  
      const hashedPassword = await bcrypt.hash(password, 12);
  
      const result = await UserModel.create({ 
        email, 
        password: hashedPassword, 
        firstname, 
        lastname, 
        avatar: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      }, 
    });
  
      const token = jwt.sign( { email: result.email, id: result._id }, process.env.JWT_SEC, { expiresIn: "5d" } );
  
      res.status(201).json({ result, token });
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
      
      console.log(error);
    }
  };


export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const oldUser = await UserModel.findOne({ email });

    if (!oldUser) return res.status(404).json({ message: "User doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);

    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ email: oldUser.email, id: oldUser._id, isAdmin: oldUser.isAdmin, firstname: oldUser.firstname },  process.env.JWT_SEC, { expiresIn: "5d" });

    res.status(200).json({ result: oldUser, token });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(err);
  }
};


//  Log out user
export const logout = async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Log out success",
  });
};

// Forgot password
export const forgotPassword = async (req, res) => {
  const user = await UserModel.findOne({ email: req.body.email });

  if (!user) return res.status(404).json({ message: "User doesn't exist" });

  
  // Get ResetPassword Token

  const resetToken = user.getResetToken();

  await user.save({
    validateBeforeSave: false,
  });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl}`;

  try {
    await sendMail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} succesfully`,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordTime = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    res.status(500).json({ message: "Something went wrong" });
    console.log(err);
  }
};


// Reset Password
export const resetPassword = async (req, res) => {
  // Create Token hash

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await UserModel.findOne({
    resetPasswordToken,
    resetPasswordTime: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Reset password url is invalid or has been expired" });
  }

  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json({ message: "Password does not match with the new password" });
  }

  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordTime = undefined;

  try{
    await user.save();

    res.status(200).json({
      success: true,
      user,
      
  });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(err);
  }
};
 

export const updatePassword = async (req, res) => {
   
  const user = await UserModel.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return res.status(400).json({ message: "Old Password is incorrect" });
  };

  if(req.body.newPassword  !== req.body.confirmPassword){
      return res.status(400).json({ message: "Password does not match with the new password" });
  }

  user.password = req.body.newPassword;

  try{
    await user.save();

    res.status(200).json({
      success: true,
      user,
      
  });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(err);
  }
};

export default router;
