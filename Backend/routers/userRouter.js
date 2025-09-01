const router = require('express').Router();
const { signUpController, LoginController, getUserController, logoutUserController, editUserController, deleteUserAccountController, getCartsSavedController, addToCartController, savedForLaterController, updateCartQtyController, removeCartController, removeSavedController, getWishListController, toggleWishlistController, addNewAddressController,editAddressController, deleteAddressController } = require('../controllers/userController');
const {isAuthenticated} = require('../middlewares/isAuthenticated');

router.post("/user/signup",signUpController);
router.post("/user/login",LoginController);
router.route("/user/me")
    .get(isAuthenticated, getUserController)
    .patch(isAuthenticated, editUserController)
    .delete(isAuthenticated, deleteUserAccountController)

router.get("/user/logout",isAuthenticated,logoutUserController)

router.get("/carts-saved",isAuthenticated, getCartsSavedController);
router.route("/cart/:productId")
    .post(isAuthenticated, addToCartController)
    .patch(isAuthenticated, updateCartQtyController)
    .delete(isAuthenticated, removeCartController);

router.route("/saved/:productId")
    .post(isAuthenticated, savedForLaterController)
    .delete(isAuthenticated, removeSavedController);

router.get("/wishlist",isAuthenticated,getWishListController);
router.route("/wishlist/:productId")
    .post(isAuthenticated, toggleWishlistController)

router.route("/addresses")
    .post(isAuthenticated,addNewAddressController)

router.route("/addresses/:addressId")
    .patch(isAuthenticated,editAddressController)
    .delete(isAuthenticated,deleteAddressController);

module.exports = router;