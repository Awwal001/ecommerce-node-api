import express from "express";
import ProductModel from "../models/Product.js";
import mongoose from "mongoose";

const router = express.Router();

export const createProduct = async (req, res) => {
    const Product = req.body;

    const newProduct = new ProductModel({ ...Product, creator: req.userId })

    try {
        const savedProduct = await newProduct.save();

        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}


export const updateProduct = async (req, res) => {
      
      try {
        const updatedProduct = await ProductModel.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true }
        );
        res.status(200).json(updatedProduct);
      } catch (err) {
        res.status(500).json(err);
      }

};



export const deleteProduct = async (req, res) => {
    try {
        await ProductModel.findByIdAndDelete(req.params.id);
        res.status(200).json("Product has been deleted...");
      } catch (err) {
        res.status(500).json(err);
      }
};

export const getProduct = async (req, res) => {
    try {
        const Product = await ProductModel.findById(req.params.id);
        
        res.status(200).json(Product);
      } catch (err) {
        res.status(500).json(err);
      }
};

export const getAllProducts = async (req, res) => {
    const qNew = req.query.new;
    const qCategory = req.query.category;
    try {
        let products;

        if (qNew) {
        products = await ProductModel.find().sort({ createdAt: -1 }).limit(1);
        } else if (qCategory) {
        products = await ProductModel.find({
            categories: {
            $in: [qCategory],
            },
        });
        } else {
        products = await ProductModel.find();
        }

        res.status(200).json(products);
    } catch (err) {
        res.status(500).json(err);
    }
};

export const getProductsStats = async (req, res) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

    try {
        const data = await ProductModel.aggregate([
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


// export const getProduct = async (req, res) => {
//     const { page } = req.query;
    
//     try {
//         const LIMIT = 8;
//         const startIndex = (Number(page) - 1) * LIMIT; // get the starting index of every page
    
//         const total = await PostMessage.countDocuments({});
//         const Product = await PostMessage.find().sort({ _id: -1 }).limit(LIMIT).skip(startIndex);

//         res.json({ data: Product, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT)});
//     } catch (error) {    
//         res.status(404).json({ message: error.message });
//     }
// }

// export const getProductBySearch = async (req, res) => {
//     const { searchQuery, tags } = req.query;

//     try {
//         const title = new RegExp(searchQuery, "i");

//         const Product = await PostMessage.find({ $or: [ { title }, { tags: { $in: tags.split(',') } } ]});

//         res.json({ data: Product });
//     } catch (error) {    
//         res.status(404).json({ message: error.message });
//     }
// }

// export const getProductByCreator = async (req, res) => {
//     const { name } = req.query;

//     try {
//         const Product = await PostMessage.find({ name });

//         res.json({ data: Product });
//     } catch (error) {    
//         res.status(404).json({ message: error.message });
//     }
// }

// export const getProduct = async (req, res) => { 
//     const { id } = req.params;

//     try {
//         const Product = await ProductMessage.findById(id);
        
//         res.status(200).json(Product);
//     } catch (error) {
//         res.status(404).json({ message: error.message });
//     }
// }



// export const updateProduct = async (req, res) => {
//     const { id } = req.params;
//     const { title, message, creator, selectedFile, tags } = req.body;
    
//     if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No Product with id: ${id}`);

//     const updatedProduct = { creator, title, message, tags, selectedFile, _id: id };

//     await ProductMessage.findByIdAndUpdate(id, updatedProduct, { new: true });

//     res.json(updatedProduct);
// }

// export const deleteProduct = async (req, res) => {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No Product with id: ${id}`);

//     await ProductMessage.findByIdAndRemove(id);

//     res.json({ message: "Product deleted successfully." });
// }

// export const likeProduct = async (req, res) => {
//     const { id } = req.params;

//     if (!req.userId) {
//         return res.json({ message: "Unauthenticated" });
//       }

//     if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No Product with id: ${id}`);
    
//     const Product = await ProductMessage.findById(id);

//     const index = Product.likes.findIndex((id) => id ===String(req.userId));

//     if (index === -1) {
//       Product.likes.push(req.userId);
//     } else {
//       Product.likes = Product.likes.filter((id) => id !== String(req.userId));
//     }

//     const updatedProduct = await ProductMessage.findByIdAndUpdate(id, Product, { new: true });

//     res.status(200).json(updatedProduct);
// }

// export const commentProduct = async (req, res) => {
//     const { id } = req.params;
//     const { value } = req.body;

//     const Product = await ProductMessage.findById(id);

//     Product.comments.push(value);

//     const updatedProduct = await ProductMessage.findByIdAndUpdate(id, Product, { new: true });

//     res.json(updatedProduct);
// };