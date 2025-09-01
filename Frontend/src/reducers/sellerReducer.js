import { ADD_PRODUCT_FAIL, ADD_PRODUCT_REQUEST, ADD_PRODUCT_SUCCESS, CLEAR_ERRORS, DELETE_SELLER_PRODUCT_FAIL, DELETE_SELLER_PRODUCT_REQUEST, DELETE_SELLER_PRODUCT_SUCCESS, EDIT_SELLER_PRODUCT_FAIL, EDIT_SELLER_PRODUCT_REQUEST, EDIT_SELLER_PRODUCT_SUCCESS, GET_SELLER_PRODUCT_FAIL, GET_SELLER_PRODUCT_REQUEST, GET_SELLER_PRODUCT_SUCCESS, GET_SELLER_PRODUCTS_FAIL, GET_SELLER_PRODUCTS_REQUEST, GET_SELLER_PRODUCTS_SUCCESS } from "../constants/sellerConstant"


export const sellerProductsReducer = (state = { isLoading: false, sellerProducts: [], hasMore: false, error: null }, { type, payload }) => {
  switch (type) {
    case GET_SELLER_PRODUCTS_REQUEST:
      return { ...state, isLoading: true };

    case GET_SELLER_PRODUCTS_SUCCESS: {
      const merged = [...state.sellerProducts];
      for (const p of payload.products || []) {
        if (!merged.some((x) => x._id === p._id)) merged.push(p);
      }
      return {
        ...state,
        isLoading: false,
        sellerProducts: merged,
        hasMore: !!payload.hasMore,
        error: null,
      };
    }

    case GET_SELLER_PRODUCTS_FAIL:
      return { ...state, isLoading: false, error: payload };

    case CLEAR_ERRORS:
      return { ...state, error: null };

    default:
      return state;
  }
};


export const sellerProductReducer = (state = {isLoading : false,sellerProduct : {},error : null},{type,payload}) => {
    switch(type){
        case ADD_PRODUCT_REQUEST:
        case GET_SELLER_PRODUCT_REQUEST:
        case EDIT_SELLER_PRODUCT_REQUEST:
        case DELETE_SELLER_PRODUCT_REQUEST:
            return {
                ...state,
                isLoading : true,
            }
        case ADD_PRODUCT_SUCCESS :
        case GET_SELLER_PRODUCT_SUCCESS:
        case EDIT_SELLER_PRODUCT_SUCCESS:
            return {
                ...state,
                isLoading : false,
                sellerProduct : payload
            }
        case DELETE_SELLER_PRODUCT_SUCCESS:
            return {
                ...state,
                isLoading : false,
                sellerProduct : null,
            } 
        case ADD_PRODUCT_FAIL:
            return {
                isLoading : false,
                sellerProduct : null,
                error : payload
            }
        case GET_SELLER_PRODUCT_FAIL:
        case EDIT_SELLER_PRODUCT_FAIL:
        case DELETE_SELLER_PRODUCT_FAIL:
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