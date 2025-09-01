const { uploadImageToBucket } = require("../config/googleCloudConfig");
const catchAsync = require("../middlewares/catchAsync");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/ErrorHandler");

exports.getProductsController = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments();
    const products = await Product.find({})
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);

    res.json({
        message: "Products fetched!..",
        products,
        hasMore: skip + products.length < total,
    });
});


exports.getProductDetailsController = catchAsync(async (req,res) => {
    const {productId} = req.params;

    const product = await Product.findById(productId).populate({
        path: "reviews",
        populate: {
        path: "user",
        select: "name email",
        },
    }).populate({
        path : "seller",
        select:"name email"
    });

    if(!product){
        throw new ErrorHandler("Product is not available",404);
    }
    res.json({
        message : "Product fetched!..",
        product
    })

})

exports.getSearchProductsController = catchAsync(async(req,res) => {
    const {productQuery} = req.params;

    const products = await Product.find({title: { $regex: productQuery, $options: "i" }});
    
    res.json({
        message : "searched Products!..",
        products
    })
})

exports.getCategoryProductsController = catchAsync(async (req,res) => {
    const {category} = req.params;
    const products = await Product.find({ category });
    res.json({
        message : `${category} Products!..`,
        products 
    });
})
