import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SettingsIcon from '@mui/icons-material/Settings';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ReviewsIcon from '@mui/icons-material/RateReview';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { logoutUserAction } from '../../actions/userAction';

const Sidebar = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const gender = user?.gender || 'male';
  const avatar = gender === 'female' ? '/female_avatar.png' : '/male_avatar.png';

  const handleLogout = () => {
    dispatch(logoutUserAction());
    navigate("/");
  };

  const NavItem = ({ to, icon: Icon, label, exact = false, showLabel = true, red = false, onClick }) => {
    const baseClasses = `group relative flex flex-1 md:justify-start justify-center items-center gap-3 py-3 px-4 text-sm rounded-lg transition-all duration-200 w-full transform hover:scale-[1.02]`;

    const activeClass = ({ isActive }) =>
      `${baseClasses} ${
        isActive
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200'
          : red
          ? 'text-red-600 hover:bg-red-50 hover:text-red-700 hover:shadow-md'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md'
      }`;

    if (onClick) {
      return (
        <button
          onClick={onClick}
          className={`${baseClasses} ${red ? 'text-red-600 hover:bg-red-50 hover:text-red-700 hover:shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md'}`}
        >
          <Icon fontSize="small" />
          {showLabel && <span className="font-medium">{label}</span>}
          {!showLabel && (
            <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-50 before:content-[''] before:absolute before:top-full before:left-1/2 before:transform before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-gray-800">
              {label}
            </span>
          )}
        </button>
      );
    }

    return (
      <NavLink to={to} end={exact} className={activeClass}>
        <Icon fontSize="small" />
        {showLabel && <span className="font-medium">{label}</span>}
        {!showLabel && (
          <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-50 before:content-[''] before:absolute before:top-full before:left-1/2 before:transform before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-gray-800">
            {label}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block w-80 p-6">
        {/* User Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 relative overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
          
          <div className="relative flex items-center gap-4">
            <div className="relative">
              <img 
                src={avatar} 
                alt="user avatar" 
                className="w-16 h-16 rounded-full border-4 border-white shadow-lg" 
              />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Welcome back,</p>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {user?.name || 'User'}
              </h2>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-6">
          {/* My Orders Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
              <h3 className="text-gray-800 font-bold text-sm uppercase tracking-wider">My Orders</h3>
            </div>
            <div className="space-y-2">
              <NavItem to="orders" icon={ShoppingBagIcon} label="Order History" />
            </div>
          </div>

          {/* Account Settings Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
              <h3 className="text-gray-800 font-bold text-sm uppercase tracking-wider">Account Settings</h3>
            </div>
            <div className="space-y-2">
              <NavItem to="" icon={PersonIcon} label="Profile Information" exact />
              <NavItem to="addresses" icon={SettingsIcon} label="Manage Addresses" />
            </div>
          </div>

          {/* My Stuff Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
              <h3 className="text-gray-800 font-bold text-sm uppercase tracking-wider">My Stuff</h3>
            </div>
            <div className="space-y-2">
              <NavItem to="wishlist" icon={FavoriteIcon} label="My Wishlist" />
              <NavItem to="reviews" icon={ReviewsIcon} label="Reviews & Ratings" />
              <NavItem to="cart" icon={ShoppingCartIcon} label="Shopping Cart" />
              <NavItem to="notifications" icon={NotificationsIcon} label="Notifications" />
            </div>
          </div>

          {/* Logout Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
            <NavItem icon={LogoutIcon} label="Sign Out" red onClick={handleLogout} />
          </div>
        </div>
      </div>

      {/* Mobile Sticky Navigation Bar */}
      <div className="sticky top-[97px] left-0 right-0 md:hidden bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg z-40">
        <div className="flex justify-around items-center py-2 px-1">
          <NavItem to="" icon={PersonIcon} label="Profile" exact showLabel={false} />
          <NavItem to="orders" icon={ShoppingBagIcon} label="Orders" showLabel={false} />
          <NavItem to="addresses" icon={SettingsIcon} label="Addresses" showLabel={false} />
          <NavItem to="wishlist" icon={FavoriteIcon} label="Wishlist" showLabel={false} />
          <NavItem to="cart" icon={ShoppingCartIcon} label="Cart" showLabel={false} />
          <NavItem to="notifications" icon={NotificationsIcon} label="Notifications" showLabel={false} />
          <NavItem icon={LogoutIcon} label="Logout" red showLabel={false} onClick={handleLogout} />
        </div>
        
        {/* Mobile Profile Summary */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <img 
              src={avatar} 
              alt="user avatar" 
              className="w-10 h-10 rounded-full border-2 border-white shadow-md" 
            />
            <div>
              <p className="text-xs text-gray-500">Signed in as</p>
              <h3 className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</h3>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;