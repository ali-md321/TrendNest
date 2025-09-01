import { CATEGORY_PRODUCTS_FAIL, CATEGORY_PRODUCTS_REQUEST, CATEGORY_PRODUCTS_SUCCESS, CLEAR_ERRORS, GET_PRODUCTS_FAIL, GET_PRODUCTS_REQUEST, GET_PRODUCTS_SUCCESS,  PRODUCT_DETAILS_FAIL, PRODUCT_DETAILS_REQUEST, PRODUCT_DETAILS_SUCCESS, SEARCH_PRODUCTS_FAIL, SEARCH_PRODUCTS_REQUEST, SEARCH_PRODUCTS_SUCCESS } from "../constants/productConstant";

export const getProductsReducer = (state = { isLoading: false, products: [], hasMore: false, error: null },{ type, payload }) => {
  switch (type) {
    case GET_PRODUCTS_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case GET_PRODUCTS_SUCCESS:
      return {
        isLoading: false,
        products: [...state.products, ...payload.products], // append
        hasMore: payload.hasMore,
        error: null,
      };
    case GET_PRODUCTS_FAIL:
      return {
        ...state,
        isLoading: false,
        error: payload,
      };
    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};


export const getProductDetailsReducer = (state = {isLoading : false,product : {},error : null},{type,payload}) => {
    switch(type){
        case PRODUCT_DETAILS_REQUEST:
            return {
                ...state,
                isLoading : true,
                product : null,
            }
        case PRODUCT_DETAILS_SUCCESS:
            return {
                isLoading : false,
                product : payload,
                error : null
            }
        case PRODUCT_DETAILS_FAIL:
            return {
                isLoading : false,
                product : null,
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

export const getSearchProductsReducer = (state = {isLoading : false,searchProducts : {},error : null},{type,payload}) => {
    switch(type){
        case SEARCH_PRODUCTS_REQUEST:
            return {
                ...state,
                isLoading : true,
                searchProducts : null,
            }
        case SEARCH_PRODUCTS_SUCCESS:
            return {
                isLoading : false,
                searchProducts : payload,
                error : null
            }
        case SEARCH_PRODUCTS_FAIL:
            return {
                isLoading : false,
                searchProducts : null,
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

export const getCategoryProductsReducer = (state = { isLoading: false, categoryProducts: [], error: null },{ type, payload }) => {
    switch (type) {
        case CATEGORY_PRODUCTS_REQUEST:
            return {
                ...state,
                isLoading: true,
                categoryProducts: [], // keep array
            };
        case CATEGORY_PRODUCTS_SUCCESS:
            return {
                isLoading: false,
                categoryProducts: payload, // should be array
                error: null
            };
        case CATEGORY_PRODUCTS_FAIL:
            return {
                isLoading: false,
                categoryProducts: [],
                error: payload
            };
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            };
        default:
            return state;
    }
};



