import { EDIT_REVIEWRATING_FAIL, EDIT_REVIEWRATING_REQUEST, EDIT_REVIEWRATING_SUCCESS, ADD_REVIEWRATING_FAIL, ADD_REVIEWRATING_REQUEST, ADD_REVIEWRATING_SUCCESS, CLEAR_ERRORS, DELETE_REVIEWRATING_FAIL, DELETE_REVIEWRATING_SUCCESS, GET_REVIEWRATING_FAIL, GET_REVIEWRATING_REQUEST, GET_REVIEWRATING_SUCCESS, ORDER_PLACE_FAIL, ORDER_PLACE_REQUEST, ORDER_PLACE_SUCCESS, STORE_ORDER_PRODUCT, GET_ORDERDETAILS_REQUEST, GET_ORDERDETAILS_SUCCESS, GET_ORDERDETAILS_FAIL, GET_ALLORDERS_REQUEST, GET_ALLORDERS_SUCCESS, GET_ALLORDERS_FAIL } from "../constants/orderConstant"


export const storeOrderProductReducer = (state = null, {type,payload}) => {
  switch (type) {
    case STORE_ORDER_PRODUCT:
      return payload;
    default:
      return state;
  }
};

export const getAllOrdersReducer = (state = {isLoading : true,orders :{}, error : null},{type,payload}) => {
    switch(type){
        case GET_ALLORDERS_REQUEST:
            return {
                ...state,
                isLoading : true,
                orders : null,
            }
        case GET_ALLORDERS_SUCCESS:
            return {
                isLoading : false,
                orders : payload,
                error : null
            }
        case GET_ALLORDERS_FAIL:
            return {
                isLoading : false,
                orders : null,
                error : payload
            }
        case CLEAR_ERRORS:
            return {
                ...state,
                error : null
            }
        default : return state
    }
}

export const placeOrderReducer = (state = {isLoading : true,orderDetails :{}, error : null},{type,payload}) => {
    switch(type){
        case ORDER_PLACE_REQUEST:
        case GET_ORDERDETAILS_REQUEST:
            return {
                ...state,
                isLoading : true,
                orderDetails : null,
            }
        case ORDER_PLACE_SUCCESS:
        case GET_ORDERDETAILS_SUCCESS:
            return {
                isLoading : false,
                orderDetails : payload,
                error : null
            }
        case ORDER_PLACE_FAIL:
        case GET_ORDERDETAILS_FAIL:
            return {
                isLoading : false,
                orderDetails : null,
                error : payload
            }
        case CLEAR_ERRORS:
            return {
                ...state,
                error : null
            }
        default : return state
    }
}


export const reviewRatingReducer = (state = {isLoading : true,reviewRating : {},error : null},{type,payload}) => {
    switch(type){
        case ADD_REVIEWRATING_REQUEST:
        case GET_REVIEWRATING_REQUEST:
            return {
                ...state,
                isLoading : true,
                reviewRating : null,
            }
        case EDIT_REVIEWRATING_REQUEST:
            return{
                ...state,
                isLoading : true,
            }        
        case ADD_REVIEWRATING_SUCCESS:
        case EDIT_REVIEWRATING_SUCCESS:
        case DELETE_REVIEWRATING_SUCCESS:
        case GET_REVIEWRATING_SUCCESS:
            return {
                isLoading : false,
                reviewRating : payload,
                error : null
            }
        case ADD_REVIEWRATING_FAIL:
        case GET_REVIEWRATING_FAIL:
            return {
                isLoading : false,
                reviewRating : null,
                error : payload
            }
        case EDIT_REVIEWRATING_FAIL:
        case DELETE_REVIEWRATING_FAIL:
            return {
                ...state,
                isLoading : false,
                error : payload
            }
        case CLEAR_ERRORS:
            return {
                ...state,
                error : null
            }
        default : return state
    }
}