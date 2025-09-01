/*
const mongoose = require("mongoose");
const axios = require("axios");
const Product = require("../models/productModel");
const Seller = require("../models/SellerModel");
const { uploadImageToBucket } = require("../config/googleCloudConfig");

// ===== CATEGORY MAPPER =====
const categoryMap = {
  beauty: "Beauty,Food&More",
  fragrances: "Beauty,Food&More",
  groceries: "Grocery",
  furniture: "Home&Furniture",
  laptops: "Electronics",
  smartphones: "Mobiles&Tablets",
  home: "Home&Furniture",
  decoration: "Home&Furniture",
  automotive: "Others",
  // fallback
  default: "Others"
};

function mapCategory(dummyCategory) {
  return categoryMap[dummyCategory] || categoryMap.default;
}
//For Atlas_--
// async function seedProducts() {
//   try {
//     await mongoose.connect("mongodb+srv://ali-md321:EOMmqpHV01zOX342@trendnest-0.520igpr.mongodb.net/?retryWrites=true&w=majority&appName=TrendNest-0BD8mZim3dHYlMGTy0aaV-MAziVfokq1EoFtO44LhVGiw3DogC3GAg0eaHe0BZ8fybzEAkXd6n3bqrbUlAaQQgLE");
//     console.log("✅ Connected to MongoDB");

//     // Two sellers
//     const sellerIds = [
//       "68a99526093f5a86570f0b14",
//       "68a995bd093f5a86570f0b1f"
//     ];
//     const sellers = await Seller.find({ _id: { $in: sellerIds } });

//     if (sellers.length !== 2) {
//       throw new Error("❌ One or both sellers not found");
//     }

//     // Clear old products
//     await Product.deleteMany({});
//     console.log("🗑️ Cleared old products");

//     // Reset sellers’ addedProducts
//     for (const seller of sellers) {
//       seller.addedProducts = [];
//       await seller.save({ validateBeforeSave: false });
//     }

//     // Fetch 100 dummy products
//     const { data } = await axios.get("https://dummyjson.com/products?limit=100");
//     const productsData = data.products;

//     let sellerIndex = 0; // to alternate between sellers

//     for (const product of productsData) {
//       // Upload images to Google Cloud
//       const uploadedImageUrls = [];
//       for (const [i, imageUrl] of product.images.entries()) {
//         try {
//           const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
//           const buffer = Buffer.from(response.data, "binary");

//           const gcsUrl = await uploadImageToBucket(
//             buffer,
//             `products/${Date.now()}_${product.id}_${i}.webp`,
//             "image/webp"
//           );

//           uploadedImageUrls.push(gcsUrl);
//         } catch (err) {
//           console.error(`❌ Failed to upload image for product ${product.title}:`, err.message);
//         }
//       }

//       // Prepare product payload
//       const newProduct = {
//         title: product.title,
//         description: product.description,
//         brand: product.brand,
//         category: mapCategory(product.category),
//         price: product.price,
//         discountPercent: product.discountPercentage,
//         discountedPrice: product.price - (product.price * product.discountPercentage) / 100,
//         stock: product.stock,
//         images: uploadedImageUrls.length ? uploadedImageUrls : [product.thumbnail],
//         isTrending: Math.random() > 0.7 // randomly mark ~30% trending
//       };

//       // Assign to alternating seller
//       const sellerId = sellerIds[sellerIndex % sellerIds.length];
//       const p = await Product.create({ ...newProduct, seller: sellerId });

//       // Push into seller’s addedProducts
//       const sellerDoc = sellers.find(s => s._id.toString() === sellerId);
//       sellerDoc.addedProducts.push(p._id);
//       await sellerDoc.save({ validateBeforeSave: false });

//       sellerIndex++;
//       console.log(`✅ Added: ${product.title} -> Seller ${sellerId}`);
//     }

//     console.log("🎉 All products seeded successfully!");

//     await mongoose.disconnect();
//     console.log("🔌 Disconnected from MongoDB");
//   } catch (err) {
//     console.error("❌ Error seeding products:", err);
//     await mongoose.disconnect();
//   }
// }

//For MonGoDB LoCAl--
// async function seedProducts() {
//   try {
//     await mongoose.connect("mongodb://127.0.0.1:27017/TrendNest");
//     console.log("✅ Connected to MongoDB");

//     const sellerId = "68a9c3bd3426ceb982c3d1df";
//     const seller = await Seller.findById(sellerId);


//     await Product.deleteMany({});
//     console.log("🗑️ Cleared old products");

//       seller.addedProducts = [];
//       await seller.save({ validateBeforeSave: false });


//     // Fetch 100 dummy products
//     const { data } = await axios.get("https://dummyjson.com/products?limit=100");
//     const productsData = data.products;


//     for (const product of productsData) {
//       // Upload images to Google Cloud
//       const uploadedImageUrls = [];
//       for (const [i, imageUrl] of product.images.entries()) {
//         try {
//           const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
//           const buffer = Buffer.from(response.data, "binary");

//           const gcsUrl = await uploadImageToBucket(
//             buffer,
//             `products_Local/${Date.now()}_${product.id}_${i}.webp`,
//             "image/webp"
//           );

//           uploadedImageUrls.push(gcsUrl);
//         } catch (err) {
//           console.error(`❌ Failed to upload image for product ${product.title}:`, err.message);
//         }
//       }

//       // Prepare product payload
//       const newProduct = {
//         title: product.title,
//         description: product.description,
//         brand: product.brand,
//         category: mapCategory(product.category),
//         price: product.price,
//         discountPercent: product.discountPercentage,
//         discountedPrice: product.price - (product.price * product.discountPercentage) / 100,
//         stock: product.stock,
//         images: uploadedImageUrls.length ? uploadedImageUrls : [product.thumbnail],
//         isTrending: Math.random() > 0.7 // randomly mark ~30% trending
//       };

//       // Assign to alternating seller
//       const p = await Product.create({ ...newProduct, seller: sellerId });

//       // Push into seller’s addedProducts
//       seller.addedProducts.push(p._id);
//       await seller.save({ validateBeforeSave: false });

//       console.log(`✅ Added: ${product.title} -> Seller ${sellerId}`);
//     }

//     console.log("🎉 All products seeded successfully!");

//     await mongoose.disconnect();
//     console.log("🔌 Disconnected from MongoDB");
//   } catch (err) {
//     console.error("❌ Error seeding products:", err);
//     await mongoose.disconnect();
//   }
// }

seedProducts();
*/

// addData.js
// Usage: MONGODB_URI="your_mongo_uri" IMAGE_DIR="/path/to/images" node addData.js

const mongoose = require("mongoose");
const fs = require("fs").promises;
const path = require("path");
const Product = require("../models/productModel");
const Seller = require("../models/SellerModel");
const upload = require("../config/googleCloudConfig").uploadImageToBucket; // adjust path if needed
const products = require("./productsData"); // the data file above

// CONFIG
const MONGO_URI ="mongodb://127.0.0.1:27017/TrendNest";
const IMAGE_DIR = path.join(__dirname, "../assets/Photos");// default to container path you used
const sellerId = "68a9c3bd3426ceb982c3d1df";

// helper: mime by extension
function mimeForFile(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  return "application/octet-stream";
}

function slugify(str) {
  return String(str).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// try to require review model to avoid MissingSchemaError on cascading deletes (if your product model has cascade hooks)
try { require("../models/reviewRatingModel"); } catch (e) { /* ignore if not present */ }

async function uploadLocalImage(filePath, destName) {
  const buffer = await fs.readFile(filePath);
  const mimetype = mimeForFile(filePath);
  // call your GCS helper
  const publicUrl = await upload(buffer, destName, mimetype);
  return publicUrl;
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB.");


    const seller = await Seller.findById(sellerId);

    // Optional: clear old products (be careful if cascade hooks delete other collections)
    // await Product.deleteMany({});
    // console.log("Cleared existing products.");


    for (const prod of products) {
      const localFile = path.join(IMAGE_DIR, prod.localImageFile);
      // check file exists
      try {
        await fs.access(localFile);
      } catch (err) {
        console.warn(`Image not found: ${localFile} — skipping upload, will set images=[ ]`);
      }

      const uploaded = [];
      try {
        if (await fileExists(localFile)) {
          const ext = path.extname(localFile);
          const destName = `products_Local/${Date.now()}_${slugify(prod.key || prod.title)}${ext}`;
          const url = await uploadLocalImage(localFile, destName);
          uploaded.push(url);
          console.log(`Uploaded ${localFile} -> ${url}`);
        }
      } catch (err) {
        console.error("Upload failed for", localFile, err.message || err);
      }

      const payload = {
        title: prod.title,
        description: prod.description,
        highlights: prod.highlights || [],
        brand: prod.brand,
        category: prod.category,
        price: prod.price,
        discountedPrice: prod.discountedPrice,
        discountPercent: prod.discountPercent,
        stock: prod.stock || 1,
        images: uploaded.length, // either GCS URLs or empty
        isTrending: !!prod.isTrending,
        createdAt: prod.createdAt || Date.now()
      };

      const created = await Product.create({ ...payload, seller: sellerId});

      const sellerDoc = await Seller.findById(sellerId);
      if (sellerDoc) {
        sellerDoc.addedProducts = sellerDoc.addedProducts || [];
        sellerDoc.addedProducts.push(created._id);
        await sellerDoc.save({ validateBeforeSave: false });
      }
      console.log(`Created product: ${created.title} (seller: ${sellerId})`);
    }

    console.log("Seeding complete.");
    await mongoose.disconnect();
    console.log("Disconnected.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    try { await mongoose.disconnect(); } catch(e) {}
    process.exit(1);
  }
}

// tiny helper to check file exists
async function fileExists(p) {
  try { await fs.access(p); return true; } catch(e) { return false; }
}

seed();
