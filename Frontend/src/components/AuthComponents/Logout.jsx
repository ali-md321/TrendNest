import { Logout as Icon } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { logoutUserAction } from '../../actions/userAction';
import { useNavigate } from 'react-router-dom';

const Logout = ({ closeMobileMenu }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = () => {
    dispatch(logoutUserAction());
    navigate("/");
    closeMobileMenu();
  };

  return (
    <div className="mt-6">
      <button 
        onClick={handleLogout}
        className="w-full flex items-center px-5 py-4 rounded-2xl text-sm font-medium transition-all duration-300 transform hover:scale-105 text-gray-700 hover:bg-red-50 hover:shadow-lg border border-transparent hover:border-red-100 group"
      >
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-100 to-red-50 group-hover:from-red-200 group-hover:to-red-100 flex items-center justify-center mr-5 transition-all duration-300">
            <Icon className="text-red-600 text-xl transform group-hover:scale-110 transition-all duration-300" />
          </div>
          <span className="font-semibold text-base group-hover:text-red-700 transition-colors duration-300">Logout</span>
        </div>
      </button>
    </div>
  );
};

export default Logout;
