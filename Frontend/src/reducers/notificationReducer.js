import {
  NOTIF_LIST_REQUEST, NOTIF_LIST_SUCCESS, NOTIF_LIST_FAIL,
  NOTIF_UNREAD_SET, NOTIF_ADD_ONE, NOTIF_MARK_READ, NOTIF_MARK_ALL
} from "../constants/notificationConstant";

const initial = { isLoading: false, items: [], unreadCount: 0, error: null };

export const notificationsReducer = (state = initial, { type, payload }) => {
  switch (type) {
    case NOTIF_LIST_REQUEST: return { ...state, isLoading: true, error: null };
    case NOTIF_LIST_SUCCESS: {
      const unread = payload.items.filter(n => !n.readAt).length;
      return { ...state, isLoading: false, items: payload.items, unreadCount: unread };
    }
    case NOTIF_LIST_FAIL: return { ...state, isLoading: false, error: payload };
    case NOTIF_UNREAD_SET: return { ...state, unreadCount: payload };
    case NOTIF_ADD_ONE:
      return { ...state, items: [payload, ...state.items], unreadCount: state.unreadCount + (!payload.readAt ? 1 : 0) };
    case NOTIF_MARK_READ: {
      const items = state.items.map(n => n._id === payload ? { ...n, readAt: n.readAt || new Date().toISOString() } : n);
      const wasUnread = state.items.find(n => n._id === payload && !n.readAt) ? 1 : 0;
      return { ...state, items, unreadCount: Math.max(0, state.unreadCount - wasUnread) };
    }
    case NOTIF_MARK_ALL: {
      const items = state.items.map(n => n.readAt ? n : ({ ...n, readAt: new Date().toISOString() }));
      return { ...state, items, unreadCount: 0 };
    }
    case "NOTIF_REMOVE_ONE":
      return {
        ...state,
        items: state.items.filter((n) => n._id !== payload),
      };

    case "NOTIF_REMOVE_MANY":
      return {
        ...state,
        items: state.items.filter((n) => !payload.includes(n._id)),
      };

    default: return state;
  }
};
