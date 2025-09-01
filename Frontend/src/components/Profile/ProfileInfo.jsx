import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { editUserAction, deleteUserAccountAction } from "../../actions/userAction";
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

// ProfileInfo Component
const ProfileInfo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({name: "",email: "",mobile: "",gender: "male",});
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mobile: user.phone || "",
        gender: user.gender || "male",
      });
    }
  }, [user]);

  const handleEditToggle = () => {
    if (isEditing) {
      dispatch(editUserAction(formData));
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (e) => {
    setFormData((prev) => ({ ...prev, gender: e.target.value }));
  };

  const handleDeleteAccount = () => {
    setShowPopup(true);
  };

  const confirmDelete = () => {
    dispatch(deleteUserAccountAction());
    setShowPopup(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <PersonIcon className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">Personal Information</h1>
                  <p className="text-blue-100 text-sm">Manage your account details</p>
                </div>
              </div>
              <button
                onClick={handleEditToggle}
                className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-200 flex items-center gap-2 self-start sm:self-auto"
              >
                {isEditing ? (
                  <>
                    <SaveIcon fontSize="small" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <EditIcon fontSize="small" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Name Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <PersonIcon fontSize="small" className="text-gray-500" />
                Full Name
              </label>
              <input
                name="name"
                value={formData.name}
                disabled={!isEditing}
                onChange={handleChange}
                className={`w-full border-2 rounded-lg px-4 py-3 transition-all duration-200 ${
                  isEditing 
                    ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white" 
                    : "border-gray-200 bg-gray-50 cursor-not-allowed"
                }`}
                placeholder="Enter your full name"
              />
            </div>

            {/* Gender Selection */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-4">Gender</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 ${
                  formData.gender === "male" 
                    ? "border-blue-500 bg-blue-50 text-blue-700" 
                    : "border-gray-200 hover:border-gray-300"
                } ${isEditing ? "cursor-pointer" : "cursor-not-allowed opacity-75"}`}>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === "male"}
                    onChange={handleGenderChange}
                    disabled={!isEditing}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="font-medium">Male</span>
                </label>
                <label className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 ${
                  formData.gender === "female" 
                    ? "border-blue-500 bg-blue-50 text-blue-700" 
                    : "border-gray-200 hover:border-gray-300"
                } ${isEditing ? "cursor-pointer" : "cursor-not-allowed opacity-75"}`}>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === "female"}
                    onChange={handleGenderChange}
                    disabled={!isEditing}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="font-medium">Female</span>
                </label>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <EmailIcon fontSize="small" className="text-gray-500" />
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                disabled={!isEditing}
                onChange={handleChange}
                className={`w-full border-2 rounded-lg px-4 py-3 transition-all duration-200 ${
                  isEditing 
                    ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white" 
                    : "border-gray-200 bg-gray-50 cursor-not-allowed"
                }`}
                placeholder="Enter your email address"
              />
            </div>

            {/* Mobile Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <PhoneIcon fontSize="small" className="text-gray-500" />
                Mobile Number
              </label>
              <input
                name="mobile"
                type="tel"
                value={formData.mobile}
                disabled={!isEditing}
                onChange={handleChange}
                className={`w-full border-2 rounded-lg px-4 py-3 transition-all duration-200 ${
                  isEditing 
                    ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white" 
                    : "border-gray-200 bg-gray-50 cursor-not-allowed"
                }`}
                placeholder="Enter your mobile number"
              />
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border-t border-gray-100 bg-red-50 px-4 sm:px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-red-800 mb-1">Danger Zone</h3>
                <p className="text-xs text-red-600">This action cannot be undone</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 self-start sm:self-auto"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DeleteIcon className="text-red-600 text-xl" />
              </div>
              <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
                Delete Account?
              </h2>
              <p className="text-sm text-gray-600 text-center mb-6">
                This action cannot be undone. All your data will be permanently removed.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowPopup(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default ProfileInfo;