import { axiosInstance as axios} from "../utils/axiosInstance";
import {
  NOTIF_LIST_REQUEST, NOTIF_LIST_SUCCESS, NOTIF_LIST_FAIL,
  NOTIF_UNREAD_SET, NOTIF_ADD_ONE, NOTIF_MARK_READ, NOTIF_MARK_ALL,NOTIF_DELETE
} from "../constants/notificationConstant";

export const fetchNotifications = () => async (dispatch) => {
  try {
    dispatch({ type: NOTIF_LIST_REQUEST });
    const { data } = await axios.get("/api/notifications", { withCredentials: true });
    dispatch({ type: NOTIF_LIST_SUCCESS, payload: data });
  } catch (err) {
    dispatch({ type: NOTIF_LIST_FAIL, payload: err?.response?.data?.message || err.message });
  }
};

export const fetchUnreadCount = () => async (dispatch) => {
    const { data } = await axios.get("/api/notifications/unread-count", { withCredentials: true });
    dispatch({ type: NOTIF_UNREAD_SET, payload: data.count });
};

export const markNotificationRead = (id) => async (dispatch) => {
  await axios.post(`/api/notifications/${id}/read`, {}, { withCredentials: true });
  dispatch({ type: NOTIF_MARK_READ, payload: id });
};

export const markAllNotificationsRead = () => async (dispatch) => {
  await axios.post(`/api/notifications/read-all`, {}, { withCredentials: true });
  dispatch({ type: NOTIF_MARK_ALL });
};

// Socket entry point
export const notificationReceived = (notif) => ({ type: NOTIF_ADD_ONE, payload: notif });

export const deleteNotfication = (notiId) => async(dispatch) => {
  console.log(notiId);
  const {data} = await axios.delete(`/api/notifications/${notiId}`, { withCredentials: true });
  dispatch({ type: NOTIF_DELETE, payload:data });
}


export const deleteSelectNotiAction = (delNotifications) => async (dispatch) => {
  try {
    dispatch({ type: NOTIF_LIST_REQUEST });
    console.log("ids:",delNotifications);
    const { data } = await axios.delete("/api/notifications",{
      data: { delNotifications },
      withCredentials: true
    });
    dispatch({ type: NOTIF_LIST_SUCCESS, payload: data });
  } catch (err) {
    dispatch({ type: NOTIF_LIST_FAIL, payload: err?.response?.data?.message || err.message });
  }
};
