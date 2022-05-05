import mongoose from "mongoose";
import validator from "validator";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
        firstname: {type: String, required: true},
        lastname: {type: String, required: true},
        email:{
            type:String,
            required:[true,"Please enter your email"],
            validate: [validator.isEmail,"Please enter a valid email"],
            unique: true,
        },
        password: {type: String, required: true},
        isAdmin: {
            type: Boolean,
            default: false,
        },
        avatar:{
            public_id:{
                type:String,
                required:true,
            },
            url:{ 
                type:String,
                required:true,
            },
        },
    },
    {timestamps: true},
);


userSchema.pre("save", async function(next){
    if (!this.isModified("password")) {
       next();
     }
   this.password = await bcrypt.hash(this.password,10);
});

// jwt token
userSchema.methods.getJwtToken = function(){
   return jwt.sign({id:this._id}, process.env.JWT_SECRET_KEY, {
       expiresIn: process.env.JWT_EXPIRES
   });
};



// Forgot password
userSchema.methods.getResetToken = function(){
   // Generating token
  const resetToken = crypto.randomBytes(20).toString("hex");
   
//    hashing and adding resetPasswordToken to userSchema
this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

this.resetPasswordTime = Date.now() + 15 * 60 * 1000;

return resetToken;
}


export default mongoose.model("user", userSchema);
