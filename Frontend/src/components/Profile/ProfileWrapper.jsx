import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import Loader from '../Layouts/Loader';

const ProfileWrapper = () => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) return <Loader />;

  // Prevent rendering anything if not authenticated
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, #6366f1 2px, transparent 0), radial-gradient(circle at 75px 75px, #8b5cf6 2px, transparent 0)`,
          backgroundSize: '100px 100px'
        }}></div>
      </div>

      <div className="relative flex flex-col md:flex-row min-h-screen">
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 md:p-6 p-4 pt-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden min-h-full">
            {/* Content Header Gradient */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            
            {/* Content Container */}
            <div className="p-6 md:p-8">
              <Outlet />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Safe Area */}
      <div className="md:hidden h-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30"></div>
    </div>
  );
};

export default ProfileWrapper;