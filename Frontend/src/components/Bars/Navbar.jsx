// Logo.js
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import brandLogo from '../../assets/BrandName.png';

const Logo = () => {
  return (
    <div className="flex items-center">
      <Link to="/" className="group flex items-center">
        <div className="relative p-2 rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105">
          {brandLogo ? (
            <div className='flex flex-row'>
            <img src="/Logo.png" className="h-10 w-auto object-contain hover:brightness-110 transition-all duration-300 mr-3" />
            <img 
              src={brandLogo} 
              alt="TrendNest" 
              className="h-10 w-auto object-contain hover:brightness-110 transition-all duration-300" 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            </div>
          ) : (
            <img 
              src="/Logo.png" 
              alt="TrendNest"
              className="h-10 w-auto object-contain hover:brightness-110 transition-all duration-300"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          )}
          
          {/* Fallback Text Logo */}
          <div 
            className="h-10 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg items-center justify-center text-white font-bold text-lg shadow-md hidden"
          >
            TN
          </div>
        </div>
      </Link>
    </div>
  );
};

import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ 
  searchTerm, 
  onChangeQuery, 
  searchProducts, 
  setSearchTerm, 
  isMobile = false 
}) => {
  return (
    <div className={`relative ${isMobile ? 'w-full' : 'w-full max-w-2xl'}`}>
      <div className="relative group">
        <div className="relative bg-white border-2 border-gray-200 group-hover:border-blue-300 focus-within:border-blue-400 flex items-center px-4 py-3 rounded-xl shadow-sm hover:shadow-md focus-within:shadow-lg transition-all duration-300">
          <SearchIcon className="text-gray-400 group-hover:text-blue-500 focus-within:text-blue-500 transition-colors duration-300" />
          <input
            type="text"
            placeholder={isMobile ? "Search products..." : "Search for Products, Brands and More"}
            className="bg-transparent outline-none px-3 text-sm w-full placeholder-gray-400 text-gray-700"
            value={searchTerm}
            onChange={onChangeQuery}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="text-gray-400 hover:text-gray-600 text-sm ml-2 hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center transition-colors duration-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {searchTerm && (
        <div className="absolute top-full left-0 mt-2 bg-white shadow-xl border border-gray-200 rounded-xl w-full max-h-80 overflow-y-auto z-50">
          <div className="p-2">
            {searchProducts?.length > 0 ? (
              searchProducts.map(product => (
                <Link
                  to={`/product/${product._id}`}
                  key={product._id}
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-all duration-200 border-l-4 border-transparent hover:border-blue-400"
                  onClick={() => setSearchTerm('')}
                >
                  <div className="flex items-center gap-3">
                    <SearchIcon className="text-gray-400 text-sm" />
                    <span className="truncate">{product.title}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-500">
                <SearchIcon className="text-gray-300 text-3xl mb-2" />
                <p className="text-sm">No results found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ReviewsIcon from '@mui/icons-material/RateReviewOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import LogoutIcon from '@mui/icons-material/Logout';

const UserDropdown = ({ isAuthenticated, user, handleLogout }) => {
  const navigate = useNavigate();
  const { unreadCount } = useSelector((state) => state.notifications || {});
  const dispatch = useDispatch();
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUnreadCount());
    }
  }, [dispatch, isAuthenticated]);
  return (
    <div className="relative group">
      <div  
        className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl hover:bg-blue-50 transition-all duration-300 group-hover:shadow-md"
        onClick={() => navigate(isAuthenticated ? "/profile" : "/login")}
      >
        <div className="relative">
          <AccountCircleOutlinedIcon className="text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
          
          {/* ✅ Unread notifications dot */}
          {isAuthenticated && unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
          )}
        </div>

        <span className="hidden md:inline text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300">
          {isAuthenticated ? user?.name : 'Login'}
        </span>
      </div>

      {/* Dropdown Menu */}
      <div className="absolute right-0 mt-2 w-64 bg-white backdrop-blur-md border border-gray-200 rounded-xl shadow-xl invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
        <div className="p-2">
          {!isAuthenticated && (
            <div className="px-4 py-3 border-b border-gray-100 mb-2">
              <p className="text-xs text-gray-500 mb-2">New customer?</p>
              <Link 
                to="/signup" 
                className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg hover:shadow-md transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>
          )}
          
          <ul className="space-y-1">
            <li>
              <Link 
                to="/profile" 
                className="flex items-center px-4 py-3 hover:bg-blue-50 rounded-lg transition-all duration-200 group/item"
              >
                <AccountCircleOutlinedIcon className="text-gray-500 group-hover/item:text-blue-600 transition-colors mr-3" />
                <span className="text-sm font-medium text-gray-700 group-hover/item:text-blue-600 transition-colors">My Profile</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/profile/orders" 
                className="flex items-center px-4 py-3 hover:bg-blue-50 rounded-lg transition-all duration-200 group/item"
              >
                <ShoppingBagOutlinedIcon className="text-gray-500 group-hover/item:text-blue-600 transition-colors mr-3" />
                <span className="text-sm font-medium text-gray-700 group-hover/item:text-blue-600 transition-colors">Orders</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/profile/wishlist" 
                className="flex items-center px-4 py-3 hover:bg-pink-50 rounded-lg transition-all duration-200 group/item"
              >
                <FavoriteBorderIcon className="text-gray-500 group-hover/item:text-pink-500 transition-colors mr-3" />
                <span className="text-sm font-medium text-gray-700 group-hover/item:text-pink-500 transition-colors">Wishlist</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/profile/reviews" 
                className="flex items-center px-4 py-3 hover:bg-blue-50 rounded-lg transition-all duration-200 group/item"
              >
                <ReviewsIcon className="text-gray-500 group-hover/item:text-blue-600 transition-colors mr-3" />
                <span className="text-sm font-medium text-gray-700 group-hover/item:text-blue-600 transition-colors">My Reviews</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/profile/notifications" 
                className="flex items-center px-4 py-3 hover:bg-blue-50 rounded-lg transition-all duration-200 group/item"
              >
                <NotificationsNoneIcon className="text-gray-500 group-hover/item:text-blue-600 transition-colors mr-3" />
                <span className="text-sm font-medium text-gray-700 group-hover/item:text-blue-600 transition-colors">Notifications</span>
              </Link>
            </li>
            {isAuthenticated && (
              <li className="border-t border-gray-100 pt-2 mt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 hover:bg-red-50 rounded-lg transition-all duration-200 group/item"
                >
                  <LogoutIcon className="text-gray-500 group-hover/item:text-red-500 transition-colors mr-3" />
                  <span className="text-sm font-medium text-gray-700 group-hover/item:text-red-500 transition-colors">Logout</span>
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

const CartIcon = () => {
  return (
    <Link 
      to="/profile/cart" 
      className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-blue-50 transition-all duration-300 group hover:shadow-md"
    >
      <div className="relative">
        <ShoppingCartOutlinedIcon className="text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
        {/* Optional: Add cart count badge */}
        {/* <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          3
        </div> */}
      </div>
      <span className="hidden md:inline text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300">
        Cart
      </span>
    </Link>
  );
};

// Navbar.js (Main Component)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getSearchProductsAction } from '../../actions/productAction';
import { logoutUserAction } from '../../actions/userAction';
import { fetchUnreadCount } from '../../actions/notificationAction';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { searchProducts = [] } = useSelector((state) => state.searchProducts);

  const [searchTerm, setSearchTerm] = useState('');
  const [debounceTimer, setDebounceTimer] = useState(null);

  const onChangeQuery = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (debounceTimer) clearTimeout(debounceTimer);

    const newTimer = setTimeout(() => {
      if (value.trim() !== '') {
        dispatch(getSearchProductsAction(value));
      }
    }, 400);

    setDebounceTimer(newTimer);
  };

  const handleLogout = () => {
    dispatch(logoutUserAction());
    navigate("/");
  };

  return (
    <div className="w-full bg-white backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      {/* Main Navbar */}
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Logo/>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 justify-center max-w-3xl mx-8">
            <SearchBar 
              searchTerm={searchTerm}
              onChangeQuery={onChangeQuery}
              searchProducts={searchProducts}
              setSearchTerm={setSearchTerm}
            />
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            
            {/* ✅ Chat Link */}
            <Link 
              to="/chat" 
              className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-blue-50 transition-all duration-300 group hover:shadow-md"
            >
              <img src="/chat_with_us.webp" alt='Chat_Icon' className="w-9 h-9"/>
              <span className="hidden md:inline text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                Help
              </span>
            </Link>
            
            <UserDropdown 
              isAuthenticated={isAuthenticated}
              user={user}
              handleLogout={handleLogout}
            />
            <CartIcon />
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="px-4 pb-3 md:hidden">
        <SearchBar 
          searchTerm={searchTerm}
          onChangeQuery={onChangeQuery}
          searchProducts={searchProducts}
          setSearchTerm={setSearchTerm}
          isMobile={true}
        />
      </div>
    </div>
  );
}

export default Navbar;