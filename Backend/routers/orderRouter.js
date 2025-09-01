const router = require('express').Router();
const {isAuthenticated} = require('../middlewares/isAuthenticated');
const { placeOrderController, getOrderDetailsController, addReviewRatingController, editReviewRatingController, deleteReviewRatingController, getAllReviewsController, getReviewRatingController, rateDelivererController, getAllOrdersController, createPaymentController, getPaymentIntentController, createRazorpayOrder, returnRequestController, cancelOrderController} = require('../controllers/orderController');
const upload = require('../config/multerConfig');
const { isAuthorized } = require('../middlewares/isAuthorized');

router.route("/product/:productId/order")
    .post(isAuthenticated, placeOrderController)

router.get("/orders", isAuthenticated, getAllOrdersController)
router.get("/order/:orderId", isAuthenticated, getOrderDetailsController);

router.get("/reviews",isAuthenticated,getAllReviewsController);
router.post("/order/:orderId/review", isAuthenticated, upload.array('images'), addReviewRatingController);
router.route("/order/:orderId/review/:reviewId")
    .get(isAuthenticated,getReviewRatingController)
    .patch(isAuthenticated, upload.array('images'), editReviewRatingController)
    .delete(isAuthenticated, deleteReviewRatingController);
router.post('/order/:orderId/ratedelivery', isAuthenticated, rateDelivererController);
router.post("/order/:orderId/return-request",isAuthenticated, isAuthorized("Customer"), returnRequestController)
router.post("/order/:orderId/cancel",isAuthenticated, isAuthorized("Customer"), cancelOrderController)

router.post('/stripe/create-payment-intent', isAuthenticated, createPaymentController);
router.get('/stripe/retrieve-payment-intent/:id', isAuthenticated, getPaymentIntentController);
router.post('/razorpay/create-order', isAuthenticated, createRazorpayOrder);

module.exports = router;