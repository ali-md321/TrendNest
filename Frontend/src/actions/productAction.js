import { CATEGORY_PRODUCTS_FAIL, CATEGORY_PRODUCTS_REQUEST, CATEGORY_PRODUCTS_SUCCESS, GET_PRODUCTS_FAIL, GET_PRODUCTS_REQUEST, GET_PRODUCTS_SUCCESS,  PRODUCT_DETAILS_FAIL, PRODUCT_DETAILS_REQUEST, PRODUCT_DETAILS_SUCCESS, SEARCH_PRODUCTS_FAIL, SEARCH_PRODUCTS_REQUEST, SEARCH_PRODUCTS_SUCCESS } from "../constants/productConstant";
import { axiosInstance as axios } from "../utils/axiosInstance";

export const getProductsAction = (page = 1) => async(dispatch) => {
    try {
        dispatch({ type : GET_PRODUCTS_REQUEST});
        const { data } = await axios.get(`/api/products?page=${page}`,{withCredentials: true,}); 
        dispatch({
            type : GET_PRODUCTS_SUCCESS,
            payload :{
                products : data.products,
                hasMore : data.hasMore,
            }
        }) 
        return {success : true};       
    } catch (error) {
        dispatch({
            type : GET_PRODUCTS_FAIL,
            payload : error.response?.data?.message || error.message || "Something Went wrong"
        })
        return {success : false};       
    }
}

export const getProductDetailsAction = (productId) => async(dispatch) => {
    try {
        dispatch({ type : PRODUCT_DETAILS_REQUEST});
        const { data } = await axios.get(`/api/product/${productId}`); 
        dispatch({
            type : PRODUCT_DETAILS_SUCCESS,
            payload : data.product
        }) 
        return {success : true,product : data.product};       
    } catch (error) {
        dispatch({
            type : PRODUCT_DETAILS_FAIL,
            payload : error.response?.data?.message || error.message || "Something Went wrong"
        })
        return {success : false};       
    }
}

export const getSearchProductsAction = (productQuery) => async(dispatch) => {
    try {
        dispatch({ type : SEARCH_PRODUCTS_REQUEST});
        const { data } = await axios.get(`/api/search/${productQuery}`); 
        dispatch({
            type : SEARCH_PRODUCTS_SUCCESS,
            payload : data.products
        }) 
        return {success : true};       
    } catch (error) {
        dispatch({
            type : SEARCH_PRODUCTS_FAIL,
            payload : error.response?.data?.message || error.message || "Something Went wrong"
        })
        return {success : false};       
    }
}

export const getCategoryProductsAction = (category) => async(dispatch) => {
    try {
        dispatch({ type : CATEGORY_PRODUCTS_REQUEST});
        const { data } = await axios.get(`/api/products/${category}`); 
        dispatch({
            type : CATEGORY_PRODUCTS_SUCCESS,
            payload : data.products || []
        }) 
        return {success : true,data : data.products};       
    } catch (error) {
        dispatch({
            type : CATEGORY_PRODUCTS_FAIL,
            payload : error.response?.data?.message || error.message || "Something Went wrong"
        })
        return {success : false};       
    }
}


