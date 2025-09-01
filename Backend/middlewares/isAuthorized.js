const catchAsync = require("./catchAsync");
const ErrorHandler = require("../utils/ErrorHandler");

exports.isAuthorized = (...roles) => 
  catchAsync((req, res, next) => {
    if (!roles.includes(req.role)) {
      return next(new ErrorHandler("Not Authorized", 403));
    }
    next();
  });
