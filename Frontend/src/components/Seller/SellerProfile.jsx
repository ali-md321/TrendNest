import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { editUserAction, deleteUserAccountAction } from "../../actions/userAction";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

const SellerProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user);

  const [isEditing, setIsEditing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", gender: "male",
    shopName: "", gstNumber: "", businessAddress: "",
    bankDetails: {
      accountHolderName: "", accountNumber: "", ifscCode: "", bankName: "",
    },
    socialHandles: {
      website: "", instagram: "", facebook: "", twitter: "", linkedin: "",
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "male",
        shopName: user.shopName || "",
        gstNumber: user.gstNumber || "",
        businessAddress: user.businessAddress || "",
        bankDetails: user.bankDetails || {
          accountHolderName: "", accountNumber: "", ifscCode: "", bankName: ""
        },
        socialHandles: user.socialHandles || {
          website: "", instagram: "", facebook: "", twitter: "", linkedin: ""
        }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("bankDetails.")) {
      const key = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        bankDetails: { ...prev.bankDetails, [key]: value }
      }));
    } else if (name.startsWith("socialHandles.")) {
      const key = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        socialHandles: { ...prev.socialHandles, [key]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleToggleEdit = async () => {
    if (isEditing) {
      await dispatch(editUserAction(formData));
    }
    setIsEditing(!isEditing);
  };

  const handleDeleteAccount = () => setShowPopup(true);
  const cancelDelete = () => setShowPopup(false);
  const confirmDelete = async () => {
    await dispatch(deleteUserAccountAction());
    navigate("/");
  };

  const inputStyle = (enabled = true) =>
    `border-2 px-4 py-3 rounded-lg w-full text-sm font-medium transition-all duration-200 ${
      enabled 
        ? "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white" 
        : "bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed"
    }`;

  const labelStyle = "block text-sm font-semibold text-gray-700 mb-2";
  const sectionStyle = "bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Seller Profile</h2>
              <p className="text-gray-600">Manage your business information and settings</p>
            </div>
            <button 
              onClick={handleToggleEdit} 
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                isEditing 
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl" 
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
              }`}
            >
              {isEditing ? (
                <span>Save</span>
              ) : "Edit"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className={sectionStyle}>
            <h3 className="text-lg font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelStyle}>Name</label>
                <input name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} className={inputStyle(isEditing)} />
              </div>
              <div>
                <label className={labelStyle}>Email</label>
                <input name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} className={inputStyle(isEditing)} />
              </div>
              <div>
                <label className={labelStyle}>Phone</label>
                <input name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} className={inputStyle(isEditing)} />
              </div>
            </div>
          </div>

          {/* Shop Information */}
          <div className={sectionStyle}>
            <h3 className="text-lg font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">Shop Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelStyle}>Shop Name</label>
                <input name="shopName" value={formData.shopName} onChange={handleChange} disabled={!isEditing} className={inputStyle(isEditing)} />
              </div>
              <div>
                <label className={labelStyle}>GST Number</label>
                <input name="gstNumber" value={formData.gstNumber} onChange={handleChange} disabled={!isEditing} className={inputStyle(isEditing)} />
              </div>
              <div className="md:col-span-2">
                <label className={labelStyle}>Business Address</label>
                <input name="businessAddress" value={formData.businessAddress} onChange={handleChange} disabled={!isEditing} className={inputStyle(isEditing)} />
              </div>
            </div>
          </div>

          {/* Bank Information */}
          <div className={sectionStyle}>
            <h3 className="text-lg font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">Bank Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelStyle}>Bank Name</label>
                <input name="bankDetails.bankName" value={formData.bankDetails.bankName} onChange={handleChange} disabled={!isEditing} className={inputStyle(isEditing)} />
              </div>
              <div>
                <label className={labelStyle}>Account Number</label>
                <input name="bankDetails.accountNumber" value={formData.bankDetails.accountNumber} onChange={handleChange} disabled={!isEditing} className={inputStyle(isEditing)} />
              </div>
              <div>
                <label className={labelStyle}>Account Holder Name</label>
                <input name="bankDetails.accountHolderName" value={formData.bankDetails.accountHolderName} onChange={handleChange} disabled={!isEditing} className={inputStyle(isEditing)} />
              </div>
              <div>
                <label className={labelStyle}>IFSC Code</label>
                <input name="bankDetails.ifscCode" value={formData.bankDetails.ifscCode} onChange={handleChange} disabled={!isEditing} className={inputStyle(isEditing)} />
              </div>
            </div>
          </div>

          {/* Social Handles */}
          <div className={sectionStyle}>
            <h3 className="text-lg font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">Social Handles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelStyle}>Website</label>
                <input name="socialHandles.website" value={formData.socialHandles.website} onChange={handleChange} disabled={!isEditing} className={inputStyle(isEditing)} />
              </div>
              <div>
                <label className={labelStyle}>Instagram</label>
                <input name="socialHandles.instagram" value={formData.socialHandles.instagram} onChange={handleChange} disabled={!isEditing} className={inputStyle(isEditing)} />
              </div>
              <div>
                <label className={labelStyle}>Facebook</label>
                <input name="socialHandles.facebook" value={formData.socialHandles.facebook} onChange={handleChange} disabled={!isEditing} className={inputStyle(isEditing)} />
              </div>
              <div>
                <label className={labelStyle}>Twitter</label>
                <input name="socialHandles.twitter" value={formData.socialHandles.twitter} onChange={handleChange} disabled={!isEditing} className={inputStyle(isEditing)} />
              </div>
              <div>
                <label className={labelStyle}>LinkedIn</label>
                <input name="socialHandles.linkedin" value={formData.socialHandles.linkedin} onChange={handleChange} disabled={!isEditing} className={inputStyle(isEditing)} />
              </div>
            </div>
          </div>

          {/* Delete Button */}
          <div className="bg-red-50 rounded-xl border-2 border-red-100 p-6 md:p-8">
            <h3 className="text-lg font-bold text-red-800 mb-4">Danger Zone</h3>
            <p className="text-red-600 mb-6">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* ✅ Updated MUI Delete Dialog */}
        <Dialog 
          open={showPopup} 
          onClose={cancelDelete}
          PaperProps={{
            style: {
              borderRadius: '16px',
              padding: '8px'
            }
          }}
        >
          <DialogTitle className="font-bold text-xl text-gray-900 pb-2">
            Confirm Delete
          </DialogTitle>
          <DialogContent className="pb-4">
            <p className="text-gray-600">
              Are you sure you want to delete this account? This action cannot be undone.
            </p>
          </DialogContent>
          <DialogActions className="px-6 pb-4 gap-3">
            <Button 
              onClick={cancelDelete}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDelete} 
              variant="contained"
              className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
              style={{ backgroundColor: '#ef4444' }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default SellerProfile;
