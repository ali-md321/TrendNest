const jwt = require("jsonwebtoken");
const catchAsync = require("./catchAsync");
const ErrorHandler = require("../utils/ErrorHandler");

module.exports.isAuthenticated =  catchAsync(async(req,res,next) => {
    const {token} = req.cookies;
    if(!token) {
        return next(new ErrorHandler("Please Login to Access", 400));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        req.role = decoded.role;
        next();
    } catch (err) {
        return next(new ErrorHandler("Invalid Token", 400));;
    }
})

module.exports.optionalAuth = catchAsync(async (req, res, next) => {
  const { token } = req.cookies;
  req.userId = null;
  if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
      req.role = decoded.role;
  }
  next();
})