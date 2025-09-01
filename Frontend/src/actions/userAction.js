import { axiosInstance as axios } from '../utils/axiosInstance';
import { ADD_CART_FAIL, ADD_CART_REQUEST, ADD_CART_SUCCESS, ADD_NEW_ADDRESS_FAIL, ADD_NEW_ADDRESS_REQUEST, ADD_NEW_ADDRESS_SUCCESS, DELETE_ADDRESS_FAIL, DELETE_ADDRESS_SUCCESS,DELETE_USER_ACCOUNT_FAIL, DELETE_USER_ACCOUNT_SUCCESS,  EDIT_ADDRESS_FAIL, EDIT_ADDRESS_REQUEST, EDIT_ADDRESS_SUCCESS, REMOVE_CART_ITEM_FAIL, REMOVE_CART_ITEM_SUCCESS, REMOVE_SAVED_ITEM_FAIL, REMOVE_SAVED_ITEM_SUCCESS, SAVED_FOR_LATER_FAIL, SAVED_FOR_LATER_REQUEST, SAVED_FOR_LATER_SUCCESS, TOGGLE_WISHLIST_FAIL, TOGGLE_WISHLIST_REQUEST, TOGGLE_WISHLIST_SUCCESS, UPDATE_CART_QTY_FAIL, UPDATE_CART_QTY_REQUEST, UPDATE_CART_QTY_SUCCESS, USER_EDIT_FAIL, USER_EDIT_REQUEST, USER_EDIT_SUCCESS, USER_LOAD_FAIL, USER_LOAD_REQUEST, USER_LOAD_SUCCESS, USER_LOGIN_FAIL, USER_LOGIN_REQUEST, USER_LOGIN_SUCCESS, USER_LOGOUT_FAIL, USER_LOGOUT_SUCCESS, USER_SIGNUP_FAIL, USER_SIGNUP_REQUEST, USER_SIGNUP_SUCCESS } from "../constants/userconstant";

export const registerUserAction = ({ name, email, phone, idToken, role, roleData }) => async(dispatch) => {
    try {
        dispatch({ type : USER_SIGNUP_REQUEST});
        console.log("Data",roleData);
        const { data } = await axios.post('/api/user/signup',{ name, email, phone, idToken, role, roleData },{ withCredentials: true }); 
        dispatch({
            type : USER_SIGNUP_SUCCESS,
            payload : data.user
        }) 
        return {success : true};       
    } catch (error) {
        dispatch({
            type : USER_SIGNUP_FAIL,
            payload : error.response?.data?.message || error.message || "Something Went wrong"
        })
        return {success : false};       
    }
}

export const LoginUserAction = ({phone,idToken,role}) => async(dispatch) => {
    try {
        dispatch({ type : USER_LOGIN_REQUEST});

        const { data } = await axios.post('/api/user/login',{phone, idToken,role},{ withCredentials: true }); 
        dispatch({
            type : USER_LOGIN_SUCCESS,
            payload : data.user
        }) 
        return {success : true};       
    } catch (error) {
        dispatch({
            type : USER_LOGIN_FAIL,
            payload : error.response?.data?.message || error.message || "Something Went wrong"
        })
        return {success : false};       
    }
} 

export const logoutUserAction = () => async(dispatch) => {
    try {
        await axios.get('/api/user/logout',{ withCredentials: true }); 
        dispatch({
            type : USER_LOGOUT_SUCCESS,
            payload : "User logged Out!!.."
        }) 
        return {success : true};       
    } catch (error) {
        dispatch({
            type : USER_LOGOUT_FAIL,
            payload : error.response?.data?.message || error.message || "Something Went wrong"
        })
        return {success : false};       
    }
}

export const loadUserAction = () => async(dispatch) => {
    try {
        dispatch({ type : USER_LOAD_REQUEST});

        const { data } = await axios.get('/api/user/me',{ withCredentials: true }); 
        dispatch({
            type : USER_LOAD_SUCCESS,
            payload : data.user
        }) 
        return {success : true};       
    } catch (error) {
        dispatch({
            type : USER_LOAD_FAIL,
            payload : error.response?.data?.message || error.message || "Something Went wrong"
        })
        return {success : false};       
    }
}

export const editUserAction = (formData) => async(dispatch) => {
    try {
        dispatch({ type : USER_EDIT_REQUEST});
        console.log(formData);
        const { data } = await axios.patch(`/api/user/me`, formData); 
        dispatch({type : USER_EDIT_SUCCESS, payload : data.user}) 
        return {success : true};       
    } catch (error) {
        dispatch({type : USER_EDIT_FAIL,payload : error.response?.data?.message || error.message || "Something Went wrong"})
        return {success : false,message : error.message};
    }
}

export const deleteUserAccountAction = () => async(dispatch) => {
    try {
        const { data } = await axios.delete(`/api/user/me`); 
        dispatch({type : DELETE_USER_ACCOUNT_SUCCESS, payload : data.user}) 
        return {success : true};       
    } catch (error) {
        dispatch({type : DELETE_USER_ACCOUNT_FAIL,payload : error.response?.data?.message || error.message || "Something Went wrong"})
    }
}

export const getCartSavedAction = () => async() => {
    try {
        const { data } = await axios.get(`/api/carts-saved`); 
        return {success : true,cart : data.cart,saved : data.saved};       
    } catch (error) {
        return {success : false,error};
    }
}

export const addCartAction = (productId) => async(dispatch) => {
    try {
        dispatch({ type : ADD_CART_REQUEST});
        const { data } = await axios.post(`/api/cart/${productId}`); 
        console.log(data);
        dispatch({
            type : ADD_CART_SUCCESS,
            payload :{ cart : data.cart}
        }) 
        return {success : true};       
    } catch (error) {
        dispatch({
            type : ADD_CART_FAIL,
            payload : error.response?.data?.message || error.message || "Something Went wrong"
        })
        return {success : false};       
    }
}

export const savedForLaterAction = (productId) => async(dispatch) => {
    try {
        dispatch({ type : SAVED_FOR_LATER_REQUEST});
        const { data } = await axios.post(`/api/saved/${productId}`); 
        console.log(data);
        dispatch({
            type : SAVED_FOR_LATER_SUCCESS,
            payload :{ savedForlater : data.savedForlater}
        }) 
        return {success : true};       
    } catch (error) {
        dispatch({
            type : SAVED_FOR_LATER_FAIL,
            payload : error.response?.data?.message || error.message || "Something Went wrong"
        })
    }
}

export const updateCartQtyAction = (productId, quantity) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_CART_QTY_REQUEST });
    const { data } = await axios.patch(`/api/cart/${productId}`, { quantity });
    dispatch({ type: UPDATE_CART_QTY_SUCCESS, payload :{ cart : data.cart} });
  } catch (error) {
    dispatch({ type: UPDATE_CART_QTY_FAIL, payload: error.response?.data?.message || error.message || "Something Went wrong" });
  }
};

export const removeCartItemAction = (productId) => async (dispatch) => {
  try {
    const {data} = await axios.delete(`/api/cart/${productId}`);
    dispatch({ type: REMOVE_CART_ITEM_SUCCESS, payload :{ cart : data.cart} });
  } catch (error) {
    dispatch({ type: REMOVE_CART_ITEM_FAIL, payload: error.response?.data?.message || error.message || "Something Went wrong" });
  }
};

export const removeSavedItemAction = (productId) => async (dispatch) => {
  try {
    const {data} = await axios.delete(`/api/saved/${productId}`);
    dispatch({ type: REMOVE_SAVED_ITEM_SUCCESS, payload :{ savedForlater : data.savedForlater}});
  } catch (error) {
    dispatch({ type: REMOVE_SAVED_ITEM_FAIL, payload: error.response?.data?.message || error.message || "Something Went wrong" });
  }
};

export const getWishListAction = () => async() => {
    try {
        const { data } = await axios.get(`/api/wishlist`); 
        return {success : true,wishlist : data.wishlist};       
    } catch (error) {
        return {success : false,error};
    }
}

export const toggleWishlistAction = (productId) => async(dispatch) => {
    try {
        dispatch({ type : TOGGLE_WISHLIST_REQUEST});
        const { data } = await axios.post(`/api/wishlist/${productId}`); 
        dispatch({type : TOGGLE_WISHLIST_SUCCESS, payload :{ wishlist : data.wishlist}}) 
        return {success : true};       
    } catch (error) {
        dispatch({type : TOGGLE_WISHLIST_FAIL,payload : error.response?.data?.message || error.message || "Something Went wrong"})
    }
}

export const addNewAddressAction = (formData) => async(dispatch) => {
    try {
        dispatch({ type :ADD_NEW_ADDRESS_REQUEST});
        const { data } = await axios.post(`/api/addresses`,formData); 
        dispatch({type :ADD_NEW_ADDRESS_SUCCESS, payload :{ addresses : data.addresses}}) 
        return {success : true,addresses :data.addresses };       
    } catch (error) {
        dispatch({type :ADD_NEW_ADDRESS_FAIL,payload : error.response?.data?.message || error.message || "Something Went wrong"})
    }
}

export const editAddressAction = (addressId,formData) => async(dispatch) => {
    try {
        dispatch({ type : EDIT_ADDRESS_REQUEST});
        const { data } = await axios.patch(`/api/addresses/${addressId}`,formData); 
        dispatch({type : EDIT_ADDRESS_SUCCESS, payload :{ addresses : data.addresses}}) 
        return {success : true,addresses :data.addresses };       
    } catch (error) {
        dispatch({type : EDIT_ADDRESS_FAIL,payload : error.response?.data?.message || error.message || "Something Went wrong"})
    }
}

export const deleteAddressAction = (addressId) => async(dispatch) => {
    try {
        const { data } = await axios.delete(`/api/addresses/${addressId}`); 
        dispatch({type : DELETE_ADDRESS_SUCCESS, payload :{ addresses : data.addresses}}) 
        return {success : true};       
    } catch (error) {
        dispatch({type : DELETE_ADDRESS_FAIL,payload : error.response?.data?.message || error.message || "Something Went wrong"})
    }
}
