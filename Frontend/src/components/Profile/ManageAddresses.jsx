import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneIcon from '@mui/icons-material/Phone';
import PlaceIcon from '@mui/icons-material/Place';
import {
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  addNewAddressAction,
  editAddressAction,
  deleteAddressAction,
} from '../../actions/userAction';
import { getCurrentLocation, reverseGeocode } from "../../utils/googleLocation"; // 👈 add at top


const initialForm = {
  name: '',
  phone: '',
  pincode: '',
  locality: '',
  address: '',
  city: '',
  state: '',
  landmark: '',
  alternatePhone: '',
  addressType: 'Home',
};

const ManageAddresses = () => {
  const dispatch = useDispatch();
  const { addresses: activityAddresses } = useSelector((state) => state.userActivity || {});
  const { user } = useSelector((state) => state.user || {});
  const addresses = activityAddresses?.length ? activityAddresses : user?.addresses || [];

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [showAddForm, setShowAddForm] = useState(false);

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuAddrId, setMenuAddrId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (addr) => {
    setEditingId(addr._id);
    setFormData({ ...addr });
    closeMenu();
  };

  const handleSave = async () => {
    if (editingId) {
      await dispatch(editAddressAction(editingId, formData));
    } else {
      await dispatch(addNewAddressAction(formData));
    }
    setEditingId(null);
    setFormData(initialForm);
    setShowAddForm(false);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
    closeMenu();
  };

  const confirmDelete = async () => {
    await dispatch(deleteAddressAction(deleteId));
    setDeleteId(null);
    setDeleteConfirmOpen(false);
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeleteId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(initialForm);
    setShowAddForm(false);
  };

  const openMenu = (e, id) => {
    setMenuAnchor(e.currentTarget);
    setMenuAddrId(id);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuAddrId(null);
  };

  const handleUseCurrentLocation = async () => {
  try {
    const { lat, lng } = await getCurrentLocation();
    console.log(lat,"---",lng);
    const addr = await reverseGeocode(lat, lng);
    console.log("addr:--",addr);
    setFormData((prev) => ({
      ...prev,
      ...addr,
    }));
  } catch (error) {
    console.error("Location error:", error);
    alert("Unable to fetch current location.");
  }
};

  const renderForm = () => (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          {editingId ? <EditIcon className="mr-2" /> : <AddIcon className="mr-2" />}
          {editingId ? 'Edit Address' : 'Add New Address'}
        </h3>
      </div>
      <div className="p-6">
        <button onClick={handleUseCurrentLocation} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-xl mb-6 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
          <LocationOnIcon className="text-sm" />
          <span className="font-medium">Use my current location</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Full Name</label>
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="Enter full name" 
              className="w-full border-2 border-gray-200 focus:border-blue-500 px-4 py-3 rounded-xl transition-colors duration-300 outline-none"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Phone Number</label>
            <input 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="Enter phone number" 
              className="w-full border-2 border-gray-200 focus:border-blue-500 px-4 py-3 rounded-xl transition-colors duration-300 outline-none"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Pincode</label>
            <input 
              name="pincode" 
              value={formData.pincode} 
              onChange={handleChange} 
              placeholder="Enter pincode" 
              className="w-full border-2 border-gray-200 focus:border-blue-500 px-4 py-3 rounded-xl transition-colors duration-300 outline-none"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Locality</label>
            <input 
              name="locality" 
              value={formData.locality} 
              onChange={handleChange} 
              placeholder="Enter locality" 
              className="w-full border-2 border-gray-200 focus:border-blue-500 px-4 py-3 rounded-xl transition-colors duration-300 outline-none"
            />
          </div>
          
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-gray-700">Full Address</label>
            <textarea 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              placeholder="Enter complete address" 
              rows="3"
              className="w-full border-2 border-gray-200 focus:border-blue-500 px-4 py-3 rounded-xl transition-colors duration-300 outline-none resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">City/District/Town</label>
            <input 
              name="city" 
              value={formData.city} 
              onChange={handleChange} 
              placeholder="Enter city" 
              className="w-full border-2 border-gray-200 focus:border-blue-500 px-4 py-3 rounded-xl transition-colors duration-300 outline-none"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">State</label>
            <select 
              name="state" 
              value={formData.state} 
              onChange={handleChange} 
              className="w-full border-2 border-gray-200 focus:border-blue-500 px-4 py-3 rounded-xl transition-colors duration-300 outline-none bg-white"
            >
              <option value="">--Select State--</option>
              <option>Andhra Pradesh</option>
              <option>Karnataka</option>
              <option>Telangana</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Landmark (Optional)</label>
            <input 
              name="landmark" 
              value={formData.landmark} 
              onChange={handleChange} 
              placeholder="Enter landmark" 
              className="w-full border-2 border-gray-200 focus:border-blue-500 px-4 py-3 rounded-xl transition-colors duration-300 outline-none"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Alternate Phone (Optional)</label>
            <input 
              name="alternatePhone" 
              value={formData.alternatePhone} 
              onChange={handleChange} 
              placeholder="Enter alternate phone" 
              className="w-full border-2 border-gray-200 focus:border-blue-500 px-4 py-3 rounded-xl transition-colors duration-300 outline-none"
            />
          </div>
        </div>

        <div className="mt-8">
          <label className="text-sm font-semibold text-gray-700 block mb-4">Address Type:</label>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center cursor-pointer">
              <input 
                type="radio" 
                name="addressType" 
                value="Home" 
                checked={formData.addressType === 'Home'} 
                onChange={handleChange}
                className="sr-only"
              />
              <div className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition-all duration-300 ${
                formData.addressType === 'Home' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <HomeIcon className="text-lg" />
                <span className="font-medium">Home</span>
              </div>
            </label>
            
            <label className="flex items-center cursor-pointer">
              <input 
                type="radio" 
                name="addressType" 
                value="Work" 
                checked={formData.addressType === 'Work'} 
                onChange={handleChange}
                className="sr-only"
              />
              <div className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition-all duration-300 ${
                formData.addressType === 'Work' 
                  ? 'border-green-500 bg-green-50 text-green-700' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <WorkIcon className="text-lg" />
                <span className="font-medium">Work</span>
              </div>
            </label>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleSave} 
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {editingId ? 'Update Address' : 'Save Address'}
          </button>
          <button 
            onClick={handleCancel} 
            className="flex-1 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8">
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Manage Your Addresses
          </h2>
          <p className="text-gray-600">Add, edit, or remove your delivery addresses</p>
        </div>

        {!showAddForm && editingId === null && (
          <button
            onClick={() => {
              setFormData(initialForm);
              setEditingId(null);
              setShowAddForm(true);
            }}
            className="w-full mb-8 group"
          >
            <div className="bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-2xl p-8 transition-all duration-300">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center mb-4 transition-colors duration-300">
                  <AddIcon className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Add New Address</h3>
                <p className="text-gray-500">Click here to add a new delivery address</p>
              </div>
            </div>
          </button>
        )}

        {showAddForm && editingId === null && (
          <div className="mb-8">
            {renderForm()}
          </div>
        )}

        <div className="space-y-6">
          {addresses.map((addr) => (
            <div key={addr._id}>
              {editingId === addr._id ? (
                renderForm()
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                          <h3 className="text-xl font-bold text-gray-900">{addr.name}</h3>
                          <div className="flex gap-2">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                              addr.addressType === 'Home' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {addr.addressType === 'Home' ? <HomeIcon className="text-sm" /> : <WorkIcon className="text-sm" />}
                              {addr.addressType}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-gray-600">
                            <PhoneIcon className="text-gray-400 text-lg" />
                            <span>{addr.phone}</span>
                          </div>
                          
                          <div className="flex items-start gap-3 text-gray-600">
                            <PlaceIcon className="text-gray-400 text-lg mt-0.5" />
                            <div className="flex-1">
                              <p className="mb-1">{addr.address}</p>
                              <p className="text-sm text-gray-500">
                                {addr.locality && `${addr.locality}, `}
                                {addr.city}, {addr.state} - {addr.pincode}
                              </p>
                              {addr.landmark && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Landmark: {addr.landmark}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 md:ml-6">
                        <button 
                          onClick={(e) => openMenu(e, addr._id)} 
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-300"
                        >
                          <MoreVertIcon />
                        </button>
                        <Menu 
                          anchorEl={menuAnchor} 
                          open={menuAddrId === addr._id} 
                          onClose={closeMenu}
                          PaperProps={{
                            style: {
                              borderRadius: '12px',
                              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                              border: '1px solid #f0f0f0'
                            }
                          }}
                        >
                          <MenuItem 
                            onClick={() => handleEdit(addr)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-blue-600"
                          >
                            <EditIcon className="text-lg" />
                            Edit Address
                          </MenuItem>
                          <MenuItem 
                            onClick={() => handleDelete(addr._id)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600"
                          >
                            <DeleteIcon className="text-lg" />
                            Delete Address
                          </MenuItem>
                        </Menu>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {addresses.length === 0 && !showAddForm && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LocationOnIcon className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No addresses found</h3>
            <p className="text-gray-500 mb-6">Add your first delivery address to get started</p>
            <button
              onClick={() => {
                setFormData(initialForm);
                setEditingId(null);
                setShowAddForm(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Add Your First Address
            </button>
          </div>
        )}

        <Dialog 
          open={deleteConfirmOpen} 
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
              Are you sure you want to delete this address? This action cannot be undone.
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

export default ManageAddresses;