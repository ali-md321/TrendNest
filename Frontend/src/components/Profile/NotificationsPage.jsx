import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, deleteNotfication, deleteSelectNotiAction } from "../../actions/notificationAction";
import { useNavigate } from "react-router-dom";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, isLoading, unreadCount } = useSelector((s) => s.notifications);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  useEffect(() => { 
    dispatch(fetchNotifications()); 
  }, [dispatch]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 30) return `${diffInDays}d ago`;
    if (diffInMonths < 12) return `${diffInMonths}mo ago`;
    return `${diffInYears}y ago`;
  };

  const handleNotificationClick = async(n) => {
    if (isSelectMode) return;
    await dispatch(markNotificationRead(n._id));
    navigate(n.route || "/");
  };


  const handleCheckboxChange = (notificationId, isChecked) => {
    if (isChecked) {
      setSelectedIds(prev => [...prev, notificationId]);
    } else {
      setSelectedIds(prev => prev.filter(id => id !== notificationId));
    }
  };

  const handleDeleteSelected = () => {
    dispatch(deleteSelectNotiAction(selectedIds));
    // 👇 immediately remove from UI
    dispatch({ type: "NOTIF_REMOVE_MANY", payload: selectedIds });
    setSelectedIds([]);
    setIsSelectMode(false);
  };


  const handleCancelSelection = () => {
    setSelectedIds([]);
    setIsSelectMode(false);
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    setDeletingId(notificationId);
    setTimeout(() => {
      dispatch(deleteNotfication(notificationId));
      // 👇 immediately remove from UI
      dispatch({ type: "NOTIF_REMOVE_ONE", payload: notificationId });
      setDeletingId(null);
    }, 200);
  };


  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-center py-12 sm:py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <span className="text-gray-600 font-medium text-sm sm:text-base">Loading your notifications...</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/50 mb-4 sm:mb-6 p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
          
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Notifications
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1 hidden sm:block">Stay updated with your latest activities</p>
              </div>
              {unreadCount > 0 && (
                <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg animate-pulse whitespace-nowrap">
                  {unreadCount} new
                </div>
              )}
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              {isSelectMode && (
                <>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.length === 0}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition-all duration-200"
                  >
                    Delete ({selectedIds.length})
                  </button>
                  <button
                    onClick={handleCancelSelection}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition-all duration-200"
                  >
                    Cancel
                  </button>
                </>
              )}
              {unreadCount > 0 && !isSelectMode && (
                <button
                  onClick={() => dispatch(markAllNotificationsRead())}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
                >
                  Mark all read
                </button>
              )}
              { items.length > 0 &&  !isSelectMode && (
                <button
                  onClick={() => setIsSelectMode(true)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition-all duration-200"
                >
                  Select
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {items.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/50 p-8 sm:p-16 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5v-5zM11 19H6a2 2 0 01-2-2V7a2 2 0 012-2h5m5 0v1a2 2 0 002 2h1M11 7H9a2 2 0 00-2 2v10a2 2 0 002 2h2m0-12a2 2 0 012-2h2a2 2 0 012 2v1"/>
              </svg>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">All caught up!</h3>
            <p className="text-gray-600 text-sm sm:text-lg">No new notifications. We'll notify you when something exciting happens.</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {items.map((n) => (
              <div
                key={n._id}
                className={`group bg-white/70 backdrop-blur-sm border rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:scale-[1.01] relative ${
                  !n.readAt 
                    ? "border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/80 to-white/70 shadow-blue-100/50" 
                    : "border-gray-200/50"
                } ${deletingId === n._id ? "animate-pulse opacity-50 scale-95" : ""} ${
                  selectedIds.includes(n._id) ? "ring-2 ring-blue-500 bg-blue-50/50" : ""
                }`}
                onClick={() => handleNotificationClick(n)}
              >
                {!n.readAt && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
                )}
                
                <div className="flex items-start p-3 sm:p-4 lg:p-5 pr-2 sm:pr-3 relative">
                  {/* Checkbox for selection */}
                  {isSelectMode && (
                    <div className="flex-shrink-0 mr-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(n._id)}
                        onChange={(e) => handleCheckboxChange(n._id, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {/* Product Image */}
                  {n.data?.productImage && (
                    <div className="flex-shrink-0 mr-3 sm:mr-4">
                      <img
                        src={n.data.productImage}
                        alt={n.data.productName}
                        className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-lg sm:rounded-xl lg:rounded-2xl object-cover border-2 border-white shadow-lg"
                      />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1 sm:mb-2">
                      <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500">
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium">
                          {formatTime(n.createdAt)}
                        </span>
                        {!n.readAt && (
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0 animate-pulse shadow-lg"></div>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2 leading-tight pr-2">
                      {n.title}
                    </h3>
                    
                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3 pr-2">
                      {n.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      {n.data?.productName && (
                        <div className="inline-flex items-center gap-1 sm:gap-2 text-xs text-blue-700 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full px-2 sm:px-3 lg:px-4 py-1 sm:py-2 border border-blue-200/50">
                          <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd"/>
                          </svg>
                          <span className="font-semibold truncate max-w-[120px] sm:max-w-none">{n.data.productName}</span>
                        </div>
                      )}
                      <div className="text-xs text-gray-400 font-medium">
                        {formatTimeAgo(n.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Delete Button */}
                  {!isSelectMode && (
                    <div className="flex-shrink-0 pl-2 sm:pl-3">
                      <button
                        onClick={(e) => handleDelete(e, n._id)}
                        className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 sm:p-2 lg:p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg sm:rounded-xl border border-transparent hover:border-red-200 hover:shadow-lg transform hover:scale-110"
                        title="Delete notification"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}