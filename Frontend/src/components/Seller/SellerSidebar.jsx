import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Dashboard, 
  AddBox, 
  Person, 
  RateReview, 
  Storefront, 
  Menu, 
  Close,
  LocalShipping, // 🚚 Shipment icon
  Notifications 
} from '@mui/icons-material';
import Brand_Name from "../../assets/BrandName.png";  
import Logout from '../AuthComponents/Logout';
import { fetchUnreadCount } from '../../actions/notificationAction';

const SellerSidebar = () => {
  const { unreadCount } = useSelector((state) => state.notifications || {});
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {user, isAuthenticated} = useSelector(state => state.user);

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
    <div className="h-screen flex bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 left-4 z-50 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-all duration-300"
      >
        <div className={`transition-all duration-300 ${isMobileMenuOpen ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`}>
          {isMobileMenuOpen ? (
            <Close className="text-gray-600 text-xl" />
          ) : (
            <Menu className="text-gray-600 text-xl" />
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
        
        {/* Seller Center Title */}
        <div className="text-center mb-10 mt-12 md:mt-0">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Seller Center
          </div>
          <div className="text-sm text-gray-500 font-medium mb-3">Manage your business</div>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
        </div>

        {/* Navigation Links */}
        <NavLink 
          to="/" 
          end 
          className={({ isActive }) => navClass(isActive)}
          onClick={closeMobileMenu}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-100 to-blue-50 flex items-center justify-center mr-5">
              <Dashboard className="text-blue-600 text-xl" />
            </div>
            <span className="font-semibold text-base">Dashboard</span>
          </div>
        </NavLink>

        <NavLink 
          to="/products" 
          className={({ isActive }) => navClass(isActive)}
          onClick={closeMobileMenu}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-100 to-green-50 flex items-center justify-center mr-5">
              <Storefront className="text-green-600 text-xl" />
            </div>
            <span className="font-semibold text-base">My Products</span>
          </div>
        </NavLink>

        <NavLink 
          to="/address" 
          className={({ isActive }) => navClass(isActive)}
          onClick={closeMobileMenu}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-100 to-purple-50 flex items-center justify-center mr-5">
              <Storefront className="text-purple-600 text-xl" />
            </div>
            <span className="font-semibold text-base">Manage Addresses</span>
          </div>
        </NavLink>
        
        <NavLink 
          to="/shipment" 
          className={({ isActive }) => navClass(isActive)}
          onClick={closeMobileMenu}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-100 to-yellow-50 flex items-center justify-center mr-5">
              <LocalShipping className="text-yellow-600 text-xl" /> {/* 🚚 Shipment Icon */}
            </div>
            <span className="font-semibold text-base">Ship Now</span>
          </div>
        </NavLink>
        
        <NavLink 
          to="/returns-refunds" 
          className={({ isActive }) => navClass(isActive)}
          onClick={closeMobileMenu}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-100 to-red-50 flex items-center justify-center mr-5">
              <RateReview className="text-red-600 text-xl" /> {/* 📦 Returns & Refunds */}
            </div>
            <span className="font-semibold text-base">Returns & Refunds</span>
          </div>
        </NavLink>

        <NavLink 
          to="/add-product" 
          className={({ isActive }) => navClass(isActive)}
          onClick={closeMobileMenu}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-100 to-orange-50 flex items-center justify-center mr-5">
              <AddBox className="text-orange-600 text-xl" />
            </div>
            <span className="font-semibold text-base">Add Product</span>
          </div>
        </NavLink>

        <NavLink 
          to="/notifications" 
          className={({ isActive }) => navClass(isActive)}
          onClick={closeMobileMenu}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-100 to-pink-50 flex items-center justify-center mr-5">
              <Notifications className="text-pink-600 text-xl" />
            </div>
            <span className="font-semibold text-base">My Notifications</span>
            {isAuthenticated && unreadCount > 0 && (
              <div className="ml-auto w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-sm"></div>
            )}
          </div>
        </NavLink>

        {/* User Profile Section */}
        <div className="mt-8 pt-6 border-t-2 border-gray-100">
          <NavLink 
            to="/profile" 
            className={({ isActive }) => profileNavClass(isActive)}
            onClick={closeMobileMenu}
          >
            <div className="flex items-center p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mr-5 shadow-lg">
                <Person className="text-white text-2xl" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg text-gray-800">{user?.name || 'Seller'}</div>
                <div className="text-gray-600 text-sm font-medium">Seller Account</div>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-xs text-green-600 font-medium">Active</span>
                </div>
              </div>
            </div>
          </NavLink>
        </div>

       <Logout closeMobileMenu={closeMobileMenu} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-0 h-screen overflow-hidden flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-lg border-b border-gray-200 px-4 md:px-8 py-4 mt-0 z-20">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-all duration-300"
              >
                <div className={`transition-all duration-300 ${isMobileMenuOpen ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`}>
                  {isMobileMenuOpen ? (
                    <Close className="text-gray-600 text-lg" />
                  ) : (
                    <Menu className="text-gray-600 text-lg" />
                  )}
                </div>
              </button>

              {/* Brand */}
              <div className="flex items-center space-x-2">
                <img src="/Logo.png" className="h-8 w-8" alt="Logo" />
                <img src={Brand_Name} className="h-6" alt="TrendNest" />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              <NavLink to="/profile">
              <div className="hidden md:flex items-center space-x-3">
                <div className="text-right">
                  <div className="font-semibold text-gray-800">{user?.name || 'Seller'}</div>
                </div>
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center shadow-md">
                  <Person className="text-white text-lg" />
                  {isAuthenticated && unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
              </div>
              </NavLink>

              {/* Mobile User Info */}
              <NavLink to="/profile" className="md:hidden">
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center shadow-md">
                  <Person className="text-white text-sm" />
                  {isAuthenticated && unreadCount > 0 && (
                    <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
                  )}
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
};

const navClass = (isActive) =>
  `flex items-center px-5 py-4 rounded-2xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
    isActive 
      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl shadow-blue-500/25' 
      : 'text-gray-700 hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-100'
  }`;

const profileNavClass = (isActive) =>
  `block w-full transition-all duration-300 transform hover:scale-105 ${
    isActive 
      ? 'ring-2 ring-blue-500 ring-offset-2' 
      : ''
  }`;

export default SellerSidebar;
