const router = require('express').Router();
const upload = require('../config/multerConfig');
const { addProductController, showSellerProductsController, getSellerProductController, editSellerProductController, deleteSellerProductController, getNeedToShipController, updateShipmentController, getMetricesController, returnAcceptController, refundOrderController, needToAcceptReturnController, needToRefundController, rejectOrderController} = require('../controllers/sellerController');
const {isAuthenticated} = require('../middlewares/isAuthenticated');
const { isAuthorized } = require('../middlewares/isAuthorized');


router.post("/product/new", isAuthenticated, isAuthorized('Seller'), upload.array('images'), addProductController);
router.get("/seller/products",isAuthenticated,showSellerProductsController)
router.route("/seller/product/:productId")
    .get(isAuthenticated, isAuthorized("Seller"), getSellerProductController)
    .patch(isAuthenticated, isAuthorized("Seller"), upload.array('images'), editSellerProductController)
    .delete(isAuthenticated, isAuthorized("Seller"), deleteSellerProductController)

router.route("/seller/shipment")
    .get(isAuthenticated, isAuthorized('Seller'), getNeedToShipController)
router.post("/order/:orderId/ship",isAuthenticated,isAuthorized('Seller'), updateShipmentController);

router.post("/order/:orderId/reject",isAuthenticated,isAuthorized('Seller'), rejectOrderController);

router.get("/return-accept/orders",isAuthenticated, isAuthorized("Seller"), needToAcceptReturnController)
router.post("/order/:orderId/return-accept",isAuthenticated, isAuthorized("Seller"), returnAcceptController)

router.get("/refund/orders",isAuthenticated, isAuthorized("Seller"), needToRefundController)
router.post("/order/:orderId/refund",isAuthenticated, isAuthorized("Seller"), refundOrderController)

router.get("/seller/metrices", isAuthenticated,isAuthorized('Seller'), getMetricesController)

module.exports = router;