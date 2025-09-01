import React, { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FaHome, FaBox, FaMoneyBillWave, FaShieldAlt, FaBullhorn, FaBars, FaTimes } from "react-icons/fa";
import { Person } from "@mui/icons-material";
import BrandName from "../../assets/BrandName.png";
import { useDispatch, useSelector } from "react-redux";
import Logout from "../AuthComponents/Logout";
import { fetchUnreadCount } from "../../actions/notificationAction";

function DelivererLayout() {
  const { unreadCount } = useSelector((state) => state.notifications || {});
  const dispatch = useDispatch();
  const {user, isAuthenticated} = useSelector(state => state.user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUnreadCount());
    }
  }, [dispatch, isAuthenticated]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 left-4 z-50 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-all duration-300"
      >
        <div className={`transition-all duration-300 ${isMobileMenuOpen ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`}>
          {isMobileMenuOpen ? (
            <FaTimes className="text-gray-600 text-xl" />
          ) : (
            <FaBars className="text-gray-600 text-xl" />
          )}
        </div>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-500"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 fixed md:relative z-40 w-80 md:w-96 bg-white shadow-2xl border-r border-gray-100 p-8 space-y-8 transition-all duration-500 ease-in-out h-screen overflow-y-auto
      `}>
        
        {/* Deliverer Center Title */}
        <div className="text-center mb-10 mt-12 md:mt-0">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Deliverer Center
          </div>
          <div className="text-sm text-gray-500 font-medium mb-3">Manage your deliveries</div>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto"></div>
        </div>

        {/* Navigation Links */}
        <NavLink
          to=""
          end
          className={({ isActive }) => navClass(isActive)}
          onClick={closeMobileMenu}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-100 to-blue-50 flex items-center justify-center mr-5">
              <FaHome className="text-blue-600 text-xl" />
            </div>
            <span className="font-semibold text-base">Dashboard</span>
          </div>
        </NavLink>

        <NavLink
          to="orders/assigned"
          className={({ isActive }) => navClass(isActive)}
          onClick={closeMobileMenu}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-100 to-green-50 flex items-center justify-center mr-5">
              <FaBox className="text-green-600 text-xl" />
            </div>
            <span className="font-semibold text-base">Assigned Orders</span>
          </div>
        </NavLink>

        <NavLink
          to="cod-summary"
          className={({ isActive }) => navClass(isActive)}
          onClick={closeMobileMenu}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-100 to-yellow-50 flex items-center justify-center mr-5">
              <FaMoneyBillWave className="text-yellow-600 text-xl" />
            </div>
            <span className="font-semibold text-base">COD Summary</span>
          </div>
        </NavLink>

        <NavLink
          to="return-pickups"
          className={({ isActive }) => navClass(isActive)}
          onClick={closeMobileMenu}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-100 to-red-50 flex items-center justify-center mr-5">
              <FaShieldAlt className="text-red-600 text-xl" />
            </div>
            <span className="font-semibold text-base">Return Pickups</span>
          </div>
        </NavLink>

        <NavLink
          to="notifications"
          className={({ isActive }) => navClass(isActive)}
          onClick={closeMobileMenu}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-100 to-purple-50 flex items-center justify-center mr-5">
              <FaBullhorn className="text-purple-600 text-xl" />
            </div>
            <span className="font-semibold text-base">Notifications</span>
            {isAuthenticated && unreadCount > 0 && (
              <div className="ml-auto w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-sm"></div>
            )}
            </div>
        </NavLink>

        {/* User Profile Section - Distinctive Design */}
        <div className="mt-8 pt-6 border-t-2 border-gray-100">
          <NavLink
            to="profile"
            className={({ isActive }) => profileNavClass(isActive)}
            onClick={closeMobileMenu}
          >
            <div className="flex items-center p-5 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-2xl border-2 border-gray-100 hover:border-indigo-200 transition-all duration-300">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center mr-5 shadow-lg">
                <Person className="text-white text-2xl" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg text-gray-800">{user?.name || "Deliverer"}</div>
                <div className="text-gray-600 text-sm font-medium">Delivery Account</div>
              </div>
            </div>
          </NavLink>
        </div>

        <Logout closeMobileMenu={closeMobileMenu} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-0 h-screen overflow-hidden flex flex-col">
        {/* Top Header with Brand and User Info */}
        <header className="bg-white shadow-lg border-b border-gray-200 px-4 md:px-8 py-4 mt-0 z-20">
            <div className="flex items-center justify-between w-full">
            
            {/* Left section with menu + brand */}
            <div className="flex items-center space-x-4">
                {/* Mobile Menu Button */}
                <button
                onClick={toggleMobileMenu}
                className="md:hidden w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-all duration-300"
                >
                {isMobileMenuOpen ? (
                    <FaTimes className="text-gray-600 text-lg" />
                ) : (
                    <FaBars className="text-gray-600 text-lg" />
                )}
                </button>

                {/* Brand Section */}
                <div className="flex items-center">
                <img src='/Logo.png' className="h-8 w-8 md:h-10 md:w-10" alt="Logo" />
                </div>
                <div className="flex items-center">
                <img src={BrandName} className="h-6 md:h-8" alt="TrendNest" />
                </div>
            </div>

            {/* User Account Info */}
            <div className="flex items-center space-x-4">
              <NavLink to="profile">
                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-semibold text-gray-800">
                      {user?.name || "Deliverer"}
                    </div>
                  </div>

                  {/* Avatar with notification dot */}
                  <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center shadow-md">
                    <Person className="text-white text-lg" />
                    {isAuthenticated && unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                </div>
              </NavLink>

              {/* Mobile User Info */}
              <NavLink to="profile">
                <div className="md:hidden flex items-center space-x-2">
                  <div className="relative w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center shadow-md">
                    <Person className="text-white text-sm" />
                    {isAuthenticated && unreadCount > 0 && (
                      <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                </div>
              </NavLink>
            </div>

            </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-white/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 min-h-full p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

const navClass = (isActive) =>
  `flex items-center px-5 py-4 rounded-2xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
    isActive 
      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xl shadow-blue-500/25' 
      : 'text-gray-700 hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-100'
  }`;

const profileNavClass = (isActive) =>
  `block w-full transition-all duration-300 transform hover:scale-105 ${
    isActive 
      ? 'ring-2 ring-indigo-500 ring-offset-2' 
      : ''
  }`;

export default DelivererLayout;