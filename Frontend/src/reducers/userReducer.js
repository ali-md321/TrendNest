import { ADD_CART_FAIL, ADD_CART_REQUEST, ADD_CART_SUCCESS, ADD_NEW_ADDRESS_FAIL, ADD_NEW_ADDRESS_REQUEST, ADD_NEW_ADDRESS_SUCCESS, CLEAR_ERRORS, DELETE_ADDRESS_FAIL, DELETE_ADDRESS_SUCCESS, DELETE_USER_ACCOUNT_FAIL, DELETE_USER_ACCOUNT_SUCCESS, EDIT_ADDRESS_FAIL, EDIT_ADDRESS_REQUEST, EDIT_ADDRESS_SUCCESS, REMOVE_CART_ITEM_FAIL, REMOVE_CART_ITEM_SUCCESS, REMOVE_SAVED_ITEM_FAIL, REMOVE_SAVED_ITEM_SUCCESS, SAVED_FOR_LATER_FAIL, SAVED_FOR_LATER_REQUEST, SAVED_FOR_LATER_SUCCESS, TOGGLE_WISHLIST_FAIL, TOGGLE_WISHLIST_REQUEST, TOGGLE_WISHLIST_SUCCESS, UPDATE_CART_QTY_FAIL, UPDATE_CART_QTY_REQUEST, UPDATE_CART_QTY_SUCCESS, USER_EDIT_FAIL, USER_EDIT_REQUEST, USER_EDIT_SUCCESS, USER_LOAD_FAIL, USER_LOAD_REQUEST, USER_LOAD_SUCCESS, USER_LOGIN_FAIL, USER_LOGIN_REQUEST, USER_LOGIN_SUCCESS, USER_LOGOUT_FAIL, USER_LOGOUT_SUCCESS, USER_SIGNUP_FAIL, USER_SIGNUP_REQUEST, USER_SIGNUP_SUCCESS } from "../constants/userconstant";

export const userReducer = (state = {user : null, isAuthenticated: false, isLoading: true, error: null},{type,payload}) => {
    switch(type){
        case USER_SIGNUP_REQUEST :
        case USER_LOGIN_REQUEST:
        case USER_LOAD_REQUEST:
            return {
                isLoading : true,
                isAuthenticated : false,
            }
        case USER_EDIT_REQUEST:
            return{
                ...state,
                isLoading : true,
            }
        case USER_SIGNUP_SUCCESS :
        case USER_LOGIN_SUCCESS:
        case USER_LOAD_SUCCESS:
        case USER_EDIT_SUCCESS:
            return {
                isLoading : false,
                isAuthenticated : true,
                user : payload,
                error : null
            }
        case USER_LOGOUT_SUCCESS:
        case DELETE_USER_ACCOUNT_SUCCESS:
            return{
                ...state,
                user : null,
                isLoading : false,
                isAuthenticated : false
            }
        case USER_LOAD_FAIL:
        case USER_LOGOUT_FAIL:
        case USER_EDIT_FAIL:
        case DELETE_USER_ACCOUNT_FAIL:
            return {
                ...state,
                isLoading : false,
                error : payload
            }
        case USER_SIGNUP_FAIL:
        case USER_LOGIN_FAIL:
            return {
                ...state,
                isLoading : false,
                error : payload,
                isAuthenticated : false,
                user : null
            }
        case CLEAR_ERRORS :
            return {
                ...state,
                error : null
            }
        default : return state;
    }
}

export const userActivityReducer = (state = {isLoading: true, error: null},{type,payload}) => {
    switch(type){
        case ADD_CART_REQUEST:
        case SAVED_FOR_LATER_REQUEST:
        case UPDATE_CART_QTY_REQUEST:
        case TOGGLE_WISHLIST_REQUEST:
        case ADD_NEW_ADDRESS_REQUEST:
        case EDIT_ADDRESS_REQUEST:
            return{
                ...state,
                isLoading : true,
            }
        case ADD_CART_SUCCESS:
        case UPDATE_CART_QTY_SUCCESS:
        case REMOVE_CART_ITEM_SUCCESS:
            return{
                isLoading : false,
                error : null,
                cart : payload?.cart
            }
        case SAVED_FOR_LATER_SUCCESS:
        case REMOVE_SAVED_ITEM_SUCCESS:
            return{
                isLoading : false,
                error : null,
                savedForLater : payload?.savedForLater
            }
        case TOGGLE_WISHLIST_SUCCESS:
            return{
                isLoading : false,
                error : null,
                wishlist : payload?.wishlist
            }
        case ADD_NEW_ADDRESS_SUCCESS:
        case EDIT_ADDRESS_SUCCESS:
        case DELETE_ADDRESS_SUCCESS:
            return {
                isLoading : false,
                error : null,
                addresses :payload.addresses
            }
        case ADD_CART_FAIL:
        case SAVED_FOR_LATER_FAIL:
        case UPDATE_CART_QTY_FAIL:
        case REMOVE_CART_ITEM_FAIL:
        case REMOVE_SAVED_ITEM_FAIL:
        case TOGGLE_WISHLIST_FAIL:
        case ADD_NEW_ADDRESS_FAIL:
        case EDIT_ADDRESS_FAIL:
        case DELETE_ADDRESS_FAIL:
            return {
                ...state,
                isLoading : false,
                error : payload
            }
        case CLEAR_ERRORS :
            return {
                ...state,
                error : null
            }
        default : return state;
    }
}
