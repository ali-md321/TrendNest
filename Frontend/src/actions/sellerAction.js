import { ADD_PRODUCT_FAIL, ADD_PRODUCT_REQUEST, ADD_PRODUCT_SUCCESS, DELETE_SELLER_PRODUCT_FAIL, DELETE_SELLER_PRODUCT_REQUEST, DELETE_SELLER_PRODUCT_SUCCESS, EDIT_SELLER_PRODUCT_FAIL, EDIT_SELLER_PRODUCT_REQUEST, EDIT_SELLER_PRODUCT_SUCCESS, GET_SELLER_PRODUCT_FAIL, GET_SELLER_PRODUCT_REQUEST, GET_SELLER_PRODUCT_SUCCESS, GET_SELLER_PRODUCTS_FAIL, GET_SELLER_PRODUCTS_REQUEST, GET_SELLER_PRODUCTS_SUCCESS } from "../constants/sellerConstant"
import { axiosInstance as axios } from "../utils/axiosInstance";

export const getSellerProductsAction = (page = 1) => async (dispatch) => {
  try {
    dispatch({ type: GET_SELLER_PRODUCTS_REQUEST, meta: { page } });
    const { data } = await axios.get(`/api/seller/products?page=${page}`);
    dispatch({
      type: GET_SELLER_PRODUCTS_SUCCESS,
      payload: {
        products: data.sellerProducts,
        hasMore: data.hasMore,
        page,
      },
    });
    return { success: true };
  } catch (error) {
    dispatch({
      type: GET_SELLER_PRODUCTS_FAIL,
      payload:
        error.response?.data?.message || error.message || "Something Went wrong",
    });
    return { success: false };
  }
};

export const addProductAction = (formData) => async(dispatch) => {
    try {
        dispatch({ type : ADD_PRODUCT_REQUEST});
        const config = {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        };
        const { data } = await axios.post(`/api/product/new`,formData,config); 
        dispatch({
            type : ADD_PRODUCT_SUCCESS,
            payload : data.product
        }) 
        return {success : true};       
    } catch (error) {
        dispatch({
            type : ADD_PRODUCT_FAIL,
            payload : error.response?.data?.message || error.message || "Something Went wrong"
        })
        return {success : false,error : error.message };       
    }
}

export const getSellerProductAction = (productId) => async(dispatch) => {
    try {
        dispatch({ type : GET_SELLER_PRODUCT_REQUEST});
        const { data } = await axios.get(`/api/seller/product/${productId}`); 
        dispatch({
            type : GET_SELLER_PRODUCT_SUCCESS,
            payload : data.sellerProduct
        }) 
        return {success : true,product : data.sellerProduct};       
    } catch (error) {
        dispatch({
            type : GET_SELLER_PRODUCT_FAIL,
            payload : error.response?.data?.message || error.message || "Something Went wrong"
        })
        return {success : false,error : error.message };       
    }
}

export const editSellerProductAction = (productId,formData) => async(dispatch) => {
    try {
        dispatch({ type : EDIT_SELLER_PRODUCT_REQUEST});
        const config = {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        };
        const { data } = await axios.patch(`/api/seller/product/${productId}`,formData,config); 
        dispatch({
            type : EDIT_SELLER_PRODUCT_SUCCESS,
            payload : data.sellerProduct
        }) 
        return {success : true,product : data.sellerProduct};       
    } catch (error) {
        dispatch({
            type : EDIT_SELLER_PRODUCT_FAIL,
            payload : error.response?.data?.message || error.message || "Something Went wrong"
        })
        return {success : false,error : error.message };       
    }
}

export const deleteSellerProductAction = (productId) => async(dispatch) => {
    try {
        dispatch({ type : DELETE_SELLER_PRODUCT_REQUEST});
        const { data } = await axios.delete(`/api/seller/product/${productId}`); 
        dispatch({
            type : DELETE_SELLER_PRODUCT_SUCCESS,
            payload : data.sellerProduct
        }) 
        return {success : true};       
    } catch (error) {
        dispatch({
            type : DELETE_SELLER_PRODUCT_FAIL,
            payload : error.response?.data?.message || error.message || "Something Went wrong"
        })
        return {success : false,error : error.message };       
    }
}

export const getShipmentAction = () => async() => {
    try {
        const { data } = await axios.get(`/api/seller/shipment`); 
        return {success : true,data : data.orders};       
    } catch (error) {
        return {success : false,error : error.message };       
    }
}

export const updateShipmentStatusAction = (orderId) => async()=>{
    try {
        const { data } = await axios.post(`/api/order/${orderId}/ship`); 
        return {success : true,data : data.orders}; 
    } catch (error) {
        return {success : false,error : error.message };       
    }
}

export const getSellerMetricesAction = () => async()=>{
    try {
        const { data } = await axios.get(`/api/seller/metrices`);
        return {success : true,data : data.seller}; 
    } catch (error) {
        return {success : false,error : error.message };       
    }
}

export const getReturnAcceptOrdersAction = () => async () => {
  try {
    const { data } = await axios.get(`/api/return-accept/orders`, { withCredentials: true });
    console.log(data);
    return { success: true, data: data.orders};
  } catch (error) {
    return { success: false,error: error.message };
  }
};

export const returnAcceptAction = (orderId) => async () => {
  try {
    const { data } = await axios.post(`/api/order/${orderId}/return-accept`, { withCredentials: true });
    return { success: true, data: data.orders};
  } catch (error) {
    return { success: false,error: error.message };
  }
};

export const getRefundOrderAction = () => async () => {
  try {

    const { data } = await axios.get(`/api/refund/orders`, { withCredentials: true });
    console.log(data);
    return { success: true, data: data.orders};
  } catch (error) {
    return { success: false,error: error.message };
  }
};

export const refundOrderAction = (orderId) => async () => {
  try {
    const { data } = await axios.post(`/api/order/${orderId}/refund`, { withCredentials: true });
    return { success: true, data: data.orders};
  } catch (error) {
    return { success: false,error: error.message };
  }
};

export const rejectOrderAction = (orderId) => async () => {
  try {
    const { data } = await axios.post(`/api/order/${orderId}/reject`, { withCredentials: true });
    return { success: true, data: data.orders};
  } catch (error) {
    return { success: false,error: error.message };
  }
};
