import { configureStore } from '@reduxjs/toolkit';
import { userActivityReducer, userReducer } from './reducers/userReducer';
import { getCategoryProductsReducer, getProductDetailsReducer, getProductsReducer, getSearchProductsReducer } from './reducers/productReducer';
import { getAllOrdersReducer, placeOrderReducer, reviewRatingReducer, storeOrderProductReducer } from './reducers/orderReducer';
import { sellerProductReducer, sellerProductsReducer } from './reducers/sellerReducer';
import { notificationsReducer } from './reducers/notificationReducer';

const store = configureStore({
    reducer : {
        user : userReducer,
        products : getProductsReducer,
        product : getProductDetailsReducer,
        orders : getAllOrdersReducer,
        searchProducts : getSearchProductsReducer,
        categoryProducts : getCategoryProductsReducer,
        userActivity : userActivityReducer,
        orderProduct : storeOrderProductReducer,
        orderDetails : placeOrderReducer,
        reviewRating : reviewRatingReducer,
        sellerProducts : sellerProductsReducer,
        sellerProduct : sellerProductReducer,
        notifications: notificationsReducer ,
    }
})

export default store;