const { getNeedToDeliverController, markOrderDeliverController, getMetricesController, returnPickUpController, needToPickupReturnController} = require("../controllers/delivererController");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const { isAuthorized } = require("../middlewares/isAuthorized");

const router = require("express").Router();

router.get("/to-deliver",isAuthenticated, isAuthorized('Deliverer'), getNeedToDeliverController);
router.post("/order/:orderId/deliver",isAuthenticated, isAuthorized('Deliverer'), markOrderDeliverController);

router.get("/return-pickup/orders",isAuthenticated, isAuthorized("Deliverer"), needToPickupReturnController)
router.post("/order/:orderId/return-pickup",isAuthenticated, isAuthorized("Deliverer"), returnPickUpController)

router.get("/deliverer/metrices", isAuthenticated,isAuthorized('Deliverer'), getMetricesController)


module.exports = router;