import { axiosInstance as axios } from '../utils/axiosInstance';
import { EDIT_REVIEWRATING_FAIL, EDIT_REVIEWRATING_REQUEST, EDIT_REVIEWRATING_SUCCESS, ADD_REVIEWRATING_FAIL, ADD_REVIEWRATING_REQUEST, ADD_REVIEWRATING_SUCCESS, DELETE_REVIEWRATING_FAIL, DELETE_REVIEWRATING_SUCCESS, GET_REVIEWRATING_FAIL, GET_REVIEWRATING_REQUEST, GET_REVIEWRATING_SUCCESS, ORDER_PLACE_FAIL, ORDER_PLACE_REQUEST, ORDER_PLACE_SUCCESS, STORE_ORDER_PRODUCT, GET_ORDERDETAILS_REQUEST, GET_ORDERDETAILS_SUCCESS, GET_ORDERDETAILS_FAIL, GET_ALLORDERS_REQUEST, GET_ALLORDERS_SUCCESS, GET_ALLORDERS_FAIL } from "../constants/orderConstant"


export const storeOrderProductAction = (product, quantity = 1) => dispatch => {
  dispatch({
    type: STORE_ORDER_PRODUCT,
    payload: { product, quantity },
  });
};

export const placeOrderAction = (productId,orderData) => async (dispatch) => {
  try {
    dispatch({ type: ORDER_PLACE_REQUEST });
    const { data } = await axios.post(`/api/product/${productId}/order`, orderData, { withCredentials: true });
    dispatch({type: ORDER_PLACE_SUCCESS,payload: data.orderDetails});
    return { success: true };
  } catch (error) {
    dispatch({type: ORDER_PLACE_FAIL,payload: error.response?.data?.message || error.message || 'Something went wrong',});
    return { success: false };
  }
};

export const getAllOrdersAction = () => async (dispatch) => {
  try {
    dispatch({ type: GET_ALLORDERS_REQUEST });
    const { data } = await axios.get(`/api/orders`, { withCredentials: true });
    dispatch({type: GET_ALLORDERS_SUCCESS,payload: data.orders});
    return { success: true,orders : data.orders };
  } catch (error) {
    dispatch({type: GET_ALLORDERS_FAIL,payload: error.response?.data?.message || error.message || 'Something went wrong',});
    return { success: false };
  }
};

export const getOrderDetailsAction = (orderId) => async (dispatch) => {
  try {
    dispatch({ type: GET_ORDERDETAILS_REQUEST });
    const { data } = await axios.get(`/api/order/${orderId}`, { withCredentials: true });
    dispatch({type: GET_ORDERDETAILS_SUCCESS,payload: data.orderDetails});
    return { success: true,orderDetails : data.orderDetails };
  } catch (error) {
    dispatch({type: GET_ORDERDETAILS_FAIL,payload: error.response?.data?.message || error.message || 'Something went wrong',});
    return { success: false };
  }
};

export const getAllReviewsActon = () => async () => {
  try {
    const { data } = await axios.get(`/api/reviews`, { withCredentials: true });
    console.log("Review",data);
    return { success: true,reviews : data.reviewRatings };
  } catch (error) {
    return { success: false,error };
  }
};

export const getReviewRatingAction = (orderId,reviewId) => async(dispatch) => {
    try {
        dispatch({ type : GET_REVIEWRATING_REQUEST});
        const { data } = await axios.get(`/api/order/${orderId}/review/${reviewId}`); 
        dispatch({
            type : GET_REVIEWRATING_SUCCESS,
            payload : data.reviewRating
        }) 
        return {success : true,review : data.reviewRating};       
    } catch (error) {
        dispatch({
            type : GET_REVIEWRATING_FAIL,
            payload : error.response?.data?.message || error.message || "Something Went wrong"
        })
        return {success : false};       
    }
}

export const addReviewRatingAction = (orderId,formData) => async(dispatch) => {
    try {
        dispatch({ type : ADD_REVIEWRATING_REQUEST});
        const config = {headers: {"Content-Type": "multipart/form-data"}};
        const { data } = await axios.post(`/api/order/${orderId}/review`,formData,config); 
        dispatch({
            type : ADD_REVIEWRATING_SUCCESS,
            payload : data.orders
        }) 
        return {success : true};       
    } catch (error) {
        dispatch({
            type : ADD_REVIEWRATING_FAIL,
            payload : error.response?.data?.message || error.message || "Something Went wrong"
        })
        return {success : false};       
    }
}

export const editReviewRatingAction = (orderId,reviewId,formData) => async(dispatch) => {
    try {
        dispatch({ type : EDIT_REVIEWRATING_REQUEST});
        const { data } = await axios.patch(`/api/order/${orderId}/review/${reviewId}`,formData); 
        dispatch({
            type : EDIT_REVIEWRATING_SUCCESS,
            payload : data.reviews
        }) 
        return {success : true};       
    } catch (error) {
        dispatch({
            type : EDIT_REVIEWRATING_FAIL,
            payload : error.response?.data?.message || error.message || "Something Went wrong"
        })
        return {success : false};       
    }
}

export const deleteReviewRatingAction = (orderId, reviewId) => async(dispatch) => {
    try {
        const { data } = await axios.delete(`/api/order/${orderId}/review/${reviewId}`); 
        dispatch({
            type : DELETE_REVIEWRATING_SUCCESS,
            payload : data.reviews
        }) 
        return {success : true};       
    } catch (error) {
        dispatch({
            type : DELETE_REVIEWRATING_FAIL,
            payload : error.response?.data?.message || error.message || "Something Went wrong"
        })
        return {success : false};       
    }
}

export const rateDeliveryAction = (orderId,rating) => async () => {
  try {
    const { data } = await axios.post(`/api/order/${orderId}/ratedelivery`, {rating}, { withCredentials: true });
    return { success: true, data: data.message};
  } catch (error) {
    return { success: false,error: error.message };
  }
};

export const cancelOrderAction = (orderId) => async () => {
  try {
    const { data } = await axios.post(`/api/order/${orderId}/cancel`, { withCredentials: true });
    return { success: true, data: data.orders};
  } catch (error) {
    return { success: false,error: error.message };
  }
};

export const returnRequestAction = (orderId) => async () => {
  try {
    const { data } = await axios.post(`/api/order/${orderId}/return-request`, { withCredentials: true });
    return { success: true, data: data.orders};
  } catch (error) {
    return { success: false,error: error.message };
  }
};
