const Customer = require("../models/CustomerModel");
const Seller = require('../models/SellerModel');
const Product = require('../models/productModel');
const Deliverer = require('../models/DelivererModel');
const Admin = require('../models/AdminModel');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsync = require('../middlewares/catchAsync');
const { sendCookie, deleteCookie } = require('../utils/cookieManager');
const admin = require('../config/firebaseBackendConfig');
const { getLatLngFromAddress, getLatLngFromCityPincode } = require("../utils/googleGeocoding");
const { notifyUser } = require("../services/notificationService");
const jwt = require("jsonwebtoken");

module.exports.signUpController = catchAsync(async (req, res) => {
  const { idToken, name, email, phone, role, roleData } = req.body;
  const decoded = await admin.auth().verifyIdToken(idToken);
  const uid = decoded.uid;
  let Model;
  let message;
  switch (role) {
    case 'Customer':
      Model = Customer;
      message =`Hi ${name || "there"}, welcome to TrendNest — explore deals and start shopping!`
      break;
    case 'Seller':
      Model = Seller;
      message =`Hi ${name || "there"}, welcome to TrendNest as Seller —Try to Add Products and Sell them on our platform`
      break;
    case 'Deliverer':
      Model = Deliverer;
      message =`Hi ${name || "there"}, welcome to TrendNest as Deliverer — start Delivering products and Chill..`
      break;
    case 'Admin':
      Model = Admin;
      break;
    default:
      throw new ErrorHandler("Invalid Role!..",500);
  }

  let user = await Model.findOne({ phone });

  if (!user) {
    const baseData = { name, email, phone };

    if (role === 'Seller') {
      const { shopName, gstNumber, businessAddress } = roleData || {};
      Object.assign(baseData, { shopName, gstNumber, businessAddress });
    } else if (role === 'Deliverer') {
      const { vehicleType, licenseNumber } = roleData || {};
      Object.assign(baseData, { vehicleType, licenseNumber });
    } else if (role === 'Admin') {
      const { employeeId, department, accessLevel } = roleData || {};
      Object.assign(baseData, { employeeId, department, accessLevel });
    }

    user = await Model.create(baseData);
    await notifyUser(user._id, {
      type: "WELCOME",
      title: "Welcome to TrendNest 🎉",
      message,
      route : "/",
      data: {}
    });
  }

  sendCookie(user, 200, res);
});

module.exports.LoginController = catchAsync(async (req, res) => {
  const { idToken, phone, role } = req.body;

  const decoded = await admin.auth().verifyIdToken(idToken);
  const uid = decoded.uid;

  let Model;
  let message ;
  let name;
  switch (role) {
    case 'Customer':
      Model = Customer;
      message =`!.. Welcome Back to TrendNest — explore deals and start shopping!`
      break;
    case 'Seller':
      Model = Seller;
      message =`!.. Welcome Back to TrendNest —Try to Add Products and Sell them on our platform`
      break;
    case 'Deliverer':
      Model = Deliverer;
      message =`!.. Welcome Back to TrendNest — start Delivering products and Chill..`
      break;
    case 'Admin':
      Model = Admin;
      break;
    default:
      throw new ErrorHandler('Invalid role specified', 500);
  }

  let user = await Model.findOne({ phone });
  if (!user) {
    return res.json({
      message: `${role} with this phone does not exist!`,
      user: null
    });
  }
  await notifyUser(user._id, {
    type: "WELCOME",
    title: "Welcome Back!..",
    message : `Hello ${user.name || `there `}` + message,
    route: "/",
  });
  sendCookie(user, 200, res);
});

exports.logoutUserController = (req,res) => {
  deleteCookie(200,res);
}

exports.getTokenForSocket = (req, res) => {
  const token = jwt.sign(
    { id: req.userId, role: req.role, purpose: 'socket' },
    process.env.JWT_SECRET,
    { expiresIn: '10m' }
  );
  res.json({ token });
}

exports.getUserController = catchAsync(async (req,res) => {
  const id = req.userId;
  const role = req.role;
  let Model,user;
  switch (role) {
    case 'Customer':
      Model = Customer;
      user = await Customer.findById(id)
      break;
    case 'Seller':
      Model = Seller;
      user = await Seller.findById(id);
      break;
    case 'Deliverer':
      Model = Deliverer;
      user = await Deliverer.findById(id);
      break;
    case 'Admin':
      Model = Admin;
      break;
    default:
      throw new ErrorHandler('Invalid role specified', 500);
  }
  if (!user) {
    throw new ErrorHandler("User Not Found!", 404);
  }
  res.status(200)
     .json({
       user, 
      });
})

exports.editUserController = catchAsync(async (req, res) => {
  const userId = req.userId;
  const role = req.role;

  let Model;
  switch (role) {
    case "Customer":
      Model = Customer;
      break;
    case "Seller":
      Model = Seller;
      break;
    case "Deliverer":
      Model = Deliverer;
      break;
    case "Admin":
      Model = Admin;
      break;
    default:
      throw new ErrorHandler("Invalid role specified", 500);
  }

  // If deliverer is updating service areas, enrich with lat/lng
  if (role === "Deliverer" && Array.isArray(req.body.serviceAreas)) {
    const enrichedServiceAreas = [];

    for (const area of req.body.serviceAreas) {
      if (area.city && area.pincode) {
        const { lat, lng } = await getLatLngFromCityPincode(area.city, area.pincode);
        enrichedServiceAreas.push({
          city: area.city,
          pincode: area.pincode,
          lat,
          lng
        });
      }
    }

    req.body.serviceAreas = enrichedServiceAreas;
  }

  const user = await Model.findByIdAndUpdate(userId, req.body, { new: true });

  res.status(200).json({
    success: true,
    message: "User details updated successfully",
    user,
  });
});

exports.deleteUserAccountController = catchAsync(async (req, res) => {
  const userId = req.userId;
  const role = req.role;

  let Model;
  switch (role) {
    case 'Customer':
      Model = Customer;
      break;
    case 'Seller':
      Model = Seller;
      break;
    case 'Deliverer':
      Model = Deliverer;
      break;
    case 'Admin':
      Model = Admin;
      break;
    default:
      throw new ErrorHandler('Invalid role specified', 500);
  }

  const user = await Model.findByIdAndDelete(userId);
  deleteCookie(200, res); 
});

exports.getCartsSavedController = catchAsync(async(req,res) => {
  const userId = req.userId;
  const user = await Customer.findById(userId)
                      .populate("cart.product").populate("savedForLater");
  res.json({message :"Carts & Saved fetched", cart : user.cart,saved : user.savedForLater});
})

exports.addToCartController = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const userId = req.userId;
  let user = await Customer.findById(userId);
  const isInCart = user.cart.some(item => item.product.toString() === productId);

  if (!isInCart) {
    user.cart.unshift({ product: productId });
  }

  user.savedForLater = user.savedForLater.filter(id => id.toString() !== productId);
  await user.save({ validateBeforeSave: false });
  res.json({
    success: true,
    cart : user.cart,
    message: "Added to Cart! 🛒"
  });
});

exports.savedForLaterController = catchAsync(async (req,res) => {
  const {productId} = req.params;
  const userId = req.userId;

  let user = await Customer.findById(userId);
  if (!user.savedForLater.includes(productId)) {
    user.savedForLater.unshift(productId);
  }

  user.cart = user.cart.filter(item => item.product.toString() !== productId);
  await user.save({ validateBeforeSave: false });
  res.json({
    savedForLater : user.savedForLater,
    messsage : "Added to Saved For Later!.."
  })
})

exports.updateCartQtyController = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const userId = req.userId;
  const user = await Customer.findById(userId);

  let found = false;
  user.cart = user.cart.map((item) => {
    if (item.product.toString() === productId) {
      item.quantity = quantity;
      found = true;
    }
    return item;
  });

  if (!found) {
    throw new ErrorHandler("Product not found in cart", 404);
  }
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    message: "Cart quantity updated",
    cart: user.cart,
  });
});

exports.removeCartController = catchAsync(async(req,res) => {
  const { productId } = req.params;
  const userId = req.userId;
  const user = await Customer.findById(userId);

  user.cart = user.cart.filter(item =>item.product.toString() != productId);
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    message: "Cart Item Removed!..",
    cart: user.cart,
  });
})

exports.removeSavedController = catchAsync(async(req,res) => {
  const { productId } = req.params;
  const userId = req.userId;
  const user = await Customer.findById(userId);

  user.savedForLater = user.savedForLater.filter(item =>item.toString() != productId);
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    message: "saved For Later Item Removed!..",
    savedForLater: user.savedforLater,
  });
})

exports.getWishListController = catchAsync(async(req,res) => {
  const userId = req.userId;
  const user = await Customer.findById(userId).populate("wishlist");
  res.json({
    message : "Wishlist Items fetched!..",
    wishlist : user.wishlist
  })
})

exports.toggleWishlistController = catchAsync(async(req,res) => {
  const { productId } = req.params;
  const userId = req.userId;
  const user = await Customer.findById(userId);
  const product = await Product.findById(productId).select("title images");

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  const wishlisted = user.wishlist.includes(productId);
  
  let message, route;
  if (!wishlisted) {
    user.wishlist.unshift(productId);
    message = `🛒 "${product.title}" was added to your Wishlist!`;
    route = `/profile/wishlist`;
  } else {
    user.wishlist = user.wishlist.filter(
      (item) => item.toString() != productId
    );

  }

  await user.save({ validateBeforeSave: false });

  if(!wishlisted){
    await notifyUser(userId, {
      type: "WISHLIST",
      title: "Wishlist Update",
      message,
      route,
      data: {
        productId,
        productName: product.title,
        productImage: product.images?.[0] || null,
      },
    });
  }

  res.json({
    wishlist : user.wishlist,
    messsage : wishlisted ? "Removed from WishList!.." : "Added to WishList!.."
  })
})

exports.addNewAddressController = catchAsync(async (req, res) => {
  const userId = req.userId;
  const role = req.role;
  const { name, phone, pincode, locality, address, city, state, landmark, alternatePhone, addressType } = req.body;

  let Model;
  switch (role) {
    case "Customer": Model = Customer; break;
    case "Seller": Model = Seller; break;
    case "Deliverer": Model = Deliverer; break;
    case "Admin": Model = Admin; break;
    default: throw new ErrorHandler("Role is Unidentified!", 500);
  }

  const user = await Model.findById(userId);

  // ✅ fetch lat/lng
  const { lat, lng } = await getLatLngFromAddress({ address, city, state, pincode });

  user.addresses.unshift({
    name, phone, pincode, locality, address, city, state, landmark, alternatePhone, addressType,
    lat, lng
  });

  await user.save({ validateBeforeSave: false });
  res.json({
    addresses: user.addresses,
    message: "Address added to User!..",
  });
});

exports.editAddressController = catchAsync(async (req, res) => {
  const userId = req.userId;
  const role = req.role;
  const { addressId } = req.params;

  let Model;
  switch (role) {
    case "Customer": Model = Customer; break;
    case "Seller": Model = Seller; break;
    case "Deliverer": Model = Deliverer; break;
    case "Admin": Model = Admin; break;
    default: throw new ErrorHandler("Role is Unidentified!", 500);
  }

  const user = await Model.findById(userId);
  const addressToUpdate = user.addresses.id(addressId);

  // ✅ update fields
  for (const key in req.body) {
    if (key !== "_id" && req.body.hasOwnProperty(key)) {
      addressToUpdate[key] = req.body[key];
    }
  }

  // ✅ recalc lat/lng if address fields changed
  if (req.body.address || req.body.city || req.body.state || req.body.pincode) {
    const { lat, lng } = await getLatLngFromAddress({
      address: addressToUpdate.address,
      city: addressToUpdate.city,
      state: addressToUpdate.state,
      pincode: addressToUpdate.pincode
    });
    addressToUpdate.lat = lat;
    addressToUpdate.lng = lng;
  }

  await user.save({ validateBeforeSave: false });
  res.json({
    addresses: user.addresses,
    message: "User Address updated!..",
  });
});

exports.deleteAddressController = catchAsync(async(req,res) => {
  const userId = req.userId;
  const role = req.role;
  const { addressId } = req.params;
  let Model ;
  switch(role){
    case 'Customer':
      Model = Customer;
      break;
    case "Seller":
      Model = Seller;
      break;
    case "Deliverer":
      Model = Deliverer;
      break;
    case "Admin":
      Model = Admin;
      break;
    default :
      throw new ErrorHandler("Role is Unidentified!",500);           
  }
  const user = await Model.findById(userId);
  user.addresses = user.addresses.filter(addr => addr._id != addressId);

  await user.save({ validateBeforeSave: false });
  res.json({
    addresses: user.addresses,
    message: "Address Deleted!..",
  });
})
