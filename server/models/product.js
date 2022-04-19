import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        title: {type: String, required: true, unique: true},
        description: {type: String, required: true},
        img: {type: String, required: true},
        categories: {type: Array},
        size: {type: String},
        color: {type: String},
        creator: {type: String},
        comments: {type: [String], default: []},
        ratings: {type: [Number], default: []},
        price: {type: Number, required: true},
    },
    {timestamps: true}
);

export default mongoose.model("product", productSchema);
