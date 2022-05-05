import express from "express";
import ProductModel from "../models/Product.js";
import Features from "../utils/Features";
import cloudinary from "cloudinary";


const router = express.Router();

export const createProduct = async (req, res) => {
    let images = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
    req.body.user = req.user.id;
    try {
        const product = await ProductModel.create(req.body);

        res.status(201).json(product);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}


export const updateProduct = async (req, res) => {
      let product = await ProductModel.findById(req.params.id);
      if(!product){
        return res.status(404).json({ message: "product doesn't exist" });
      }

      let images = [];

      if (typeof req.body.images === "string") {
        images.push(req.body.images);
      } else {
        images = req.body.images;
      }
    
      if(images !== undefined){
        
        // Delete image from cloudinary
        for (let i = 0; i < product.images.length; i++) {
          await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }
          
        const imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
          const result = await cloudinary.v2.uploader.upload(images[i],{
            folder:"products",
          });
        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        })
      }
      req.body.images = imagesLinks;
    }

      try {
        product = await ProductModel.findByIdAndUpdate(req.params.id,req.body,{
          new: true,
          runValidators: true,
          useUnified: false
        });
        res.status(200).json(product);
      } catch (err) {
        res.status(500).json(err);
      }

};



export const deleteProduct = async (req, res) => {
    try {
      const product =  await ProductModel.findById(req.params.id);

      if(!product){
        return res.status(404).json({ message: "product doesn't exist" });
      }
      
       // Deleting images from cloudinary
      for (let i = 0; 1 < product.images.length; i++) {
          await cloudinary.v2.uploader.destroy(
          product.images[i].public_id
        );
      }
    
      await product.remove();
      } catch (err) {
        res.status(500).json(err);
      }
};

export const getProduct = async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id);
        if(!product){
          return res.status(404).json({ message: "product doesn't exist" });
        }
        
        res.status(200).json(product);
      } catch (err) {
        res.status(500).json(err);
      }
};

export const getAllProducts = async (req, res) => {
    const qNew = req.query.new;
    const qCategory = req.query.category;
    
    try {
        let products;
        const productsCount = await ProductModel.countDocuments();
        const resultPerPage = 8;

        if (qNew) {
        products = await ProductModel.find().sort({ createdAt: -1 }).limit(1);
        } else if (qCategory) {
        products = await ProductModel.find({
            categories: {
            $in: [qCategory],
            },
        });
        } else {

          
        const feature = new Features(ProductModel.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage)
        ;
        products = await feature.query; 
        }

        res.status(200).json({
          success: true,
          products,
          productsCount,
          resultPerPage
        })
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



// Create New Review or Update the review  
export const createProductReview = async (req, res) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await ProductModel.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()){
        rev.rating = rating
        rev.comment = comment
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating; 

  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
};

// Get All reviews of a single product
export const getSingleProductReviews  = async (req, res) => {
  const product = await ProductModel.findById(req.query.id);

  if(!product){
    return res.status(404).json({ message: "product doesn't exist" });
  }
  
  res.status(200).json({
    success: true,
    reviews: product.reviews
  });
};

// Delete Review --Admin
export const deleteReview  = async (req, res) => {

  const product = await ProductModel.findById(req.query.productId);

  if(!product){
    return res.status(404).json({ message: "product doesn't exist" });
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await ProductModel.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
};

export default router;
