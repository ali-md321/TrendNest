import React, { useState } from 'react';
import { getCurrentLocation, reverseGeocode } from '../../utils/googleLocation';

const AddressForm = ({ initial = {}, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: initial.name || '',
    phone: initial.phone || '',
    pincode: initial.pincode || '',
    locality: initial.locality || '',
    address: initial.address || '',
    city: initial.city || '',
    state: initial.state || '',
    landmark: initial.landmark || '',
    altPhone: initial.altPhone || '',
    addressType: initial.addressType || 'Home',
    _id: initial._id || undefined,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // submit: await parent onSave so parent can update store and return the saved payload
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (typeof onSave === 'function') {
      try {
        await onSave(form); // parent should handle dispatch and return (or update store)
      } catch (err) {
        console.error('Save failed:', err);
      }
    }
  };

  // Use browser geolocation + OpenaddressMap reverse geocode to fill fields
  const handleUseLocation = async () => {
    try {
        const { lat, lng } = await getCurrentLocation();
        console.log(lat,"---",lng);
        const addr = await reverseGeocode(lat, lng);
        console.log("addr:--",addr);
        setForm((prev) => ({
          ...prev,
          ...addr,
        }));
      } catch (error) {
        console.error("Location error:", error);
        alert("Unable to fetch current location.");
      }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl shadow-xl border border-blue-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
          <span className="text-white text-lg">📍</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800">
          {initial._id ? 'Edit Address' : 'Add New Address'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
          <button
            type="button"
            onClick={handleUseLocation}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium flex items-center justify-center gap-2"
          >
            <span className="text-lg">📍</span>
            Use my current location
          </button>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-white text-sm">👤</span>
            Personal Information
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Full Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full p-3 border-2 border-gray-200 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className="w-full p-3 border-2 border-gray-200 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Alternate Phone</label>
              <input
                type="text"
                name="altPhone"
                value={form.altPhone}
                onChange={handleChange}
                placeholder="Alternative number (optional)"
                className="w-full p-3 border-2 border-gray-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Address Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm">🏠</span>
            Address Details
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Pincode *</label>
              <input
                type="text"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="Enter pincode"
                className="w-full p-3 border-2 border-gray-200 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Locality</label>
              <input
                type="text"
                name="locality"
                value={form.locality}
                onChange={handleChange}
                placeholder="Locality/Sector"
                className="w-full p-3 border-2 border-gray-200 rounded-xl"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">address Address *</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="House/Flat/Office No, Building Name, Road Name, Area"
                className="w-full p-3 border-2 border-gray-200 rounded-xl h-20 resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">City/District *</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City/District/Town"
                className="w-full p-3 border-2 border-gray-200 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">State *</label>
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="State"
                className="w-full p-3 border-2 border-gray-200 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Landmark</label>
              <input
                type="text"
                name="landmark"
                value={form.landmark}
                onChange={handleChange}
                placeholder="Nearby landmark (optional)"
                className="w-full p-3 border-2 border-gray-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Address Type & Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
          <div className="mb-4">
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="addressType"
                  value="Home"
                  checked={form.addressType === 'Home'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`w-6 h-6 rounded-full border-2 ${form.addressType === 'Home' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}></div>
                <span className="text-gray-700 font-medium">🏠 Home</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="addressType"
                  value="Work"
                  checked={form.addressType === 'Work'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`w-6 h-6 rounded-full border-2 ${form.addressType === 'Work' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}></div>
                <span className="text-gray-700 font-medium">🏢 Work</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold"
            >
              <span>💾</span> {initial._id ? 'Update Address' : 'Save Address'}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white px-8 py-4 rounded-xl font-semibold"
            >
              <span>❌</span> Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
