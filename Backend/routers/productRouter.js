const router = require('express').Router();
const { getProductsController, getProductDetailsController, getSearchProductsController, getCategoryProductsController, addProductController, showSellerProductsController } = require('../controllers/productController');
const {isAuthenticated} = require('../middlewares/isAuthenticated');
const { isAuthorized } = require('../middlewares/isAuthorized');
const upload = require('../config/multerConfig');

router.get("/products",getProductsController);
router.get("/product/:productId",getProductDetailsController);
router.get("/search/:productQuery",getSearchProductsController);
router.get("/products/:category",getCategoryProductsController);


module.exports = router;