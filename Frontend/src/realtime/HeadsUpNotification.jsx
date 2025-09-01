import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { markNotificationRead } from "../actions/notificationAction";

export default function HeadsUpNotification() {
  const [notif, setNotif] = useState(null);
  const dispatch = useDispatch();
  useEffect(() => {
    const handler = (e) => setNotif(e.detail);
    window.addEventListener("trendnest:heads-up", handler);
    return () => window.removeEventListener("trendnest:heads-up", handler);
  }, []);

  const handleNotificationClick = async() => {
    setNotif(null);
    await dispatch(markNotificationRead(notif._id))
    if (notif.route && window.location) {
      window.location.href = notif.route;
    }
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setNotif(null);
  };

  if (!notif) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] px-3 sm:px-4 pt-3">
      <div className="max-w-md mx-auto">
        <div 
          className="bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl animate-[slideDown_0.4s_ease-out]"
          onClick={handleNotificationClick}
        >
          <div className="p-4 relative">
            {/* Dismiss Button */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full p-1.5 transition-all duration-200"
              onClick={handleDismiss}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <div className="flex items-start gap-3 pr-8">
              {notif.data?.productImage && (
                <div className="flex-shrink-0">
                  <img
                    src={notif.data.productImage}
                    alt={notif.data.productName}
                    className="h-12 w-12 rounded-xl object-cover border-2 border-gray-200 shadow-lg"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-800 text-sm leading-tight mb-1">
                  {notif.title || "Notification"}
                </div>
                <div className="text-gray-600 text-xs leading-relaxed">
                  {notif.message}
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom accent strip */}
          <div className="h-1 bg-blue-400"></div>
          
          {/* Subtle highlight effect */}
          <div className="absolute inset-0 bg-white/5 pointer-events-none rounded-2xl"></div>
        </div>
      </div>
      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}