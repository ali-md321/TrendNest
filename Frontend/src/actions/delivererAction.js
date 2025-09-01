import { axiosInstance as axios } from "../utils/axiosInstance"

export const getDeliverOrdersAction = () => async() => {
    try{
        const {data} = await axios.get("/api/to-deliver");
        return {success : true, data : data.orders};
    }
    catch(error){
        return {success : false,error : error.message}
    }
}

export const markOrderDeliveredAction = (orderId) => async() => {
    try{
        const {data} = await axios.post(`/api/order/${orderId}/deliver`, {status : "Delivered"});
        return {success : true, data : data.orders};
    }
    catch(error){
        return {success : false,error : error.message}
    }
}

export const getDelivererMetricesAction = () => async() => {
    try{
        const {data} = await axios.get(`/api/deliverer/metrices`);
        console.log("data:",data.deliverer);
        return {success : true, data : data.deliverer};
    }
    catch(error){
        return {success : false,error : error.message}
    }
}

export const getreturnPickupOrdersAction = () => async () => {
  try {
    const { data } = await axios.get(`/api/return-pickup/orders`, { withCredentials: true });
    console.log("pickup",data);
    return { success: true, data: data.orders};
  } catch (error) {
    return { success: false,error: error.message };
  }
};

export const returnPickupAction = (orderId) => async () => {
  try {
    const { data } = await axios.post(`/api/order/${orderId}/return-pickup`, { withCredentials: true });
    return { success: true, data: data.orders};
  } catch (error) {
    return { success: false,error: error.message };
  }
};
