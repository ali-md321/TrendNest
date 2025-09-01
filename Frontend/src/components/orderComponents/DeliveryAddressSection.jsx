import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AddressForm from './AddressForm';
import { editAddressAction, addNewAddressAction, loadUserAction } from '../../actions/userAction';

/**
 * DeliveryAddressSection
 * - Renders from local `addresses` (synced with Redux user.addresses)
 * - Optimistically merges add/edit results so UI updates immediately
 * - Keeps selection working and bubbles up via onSelect
 */
const DeliveryAddressSection = ({ selected, onSelect }) => {
  const { user } = useSelector((state) => state.user || {});
  const dispatch = useDispatch();

  // Local copy to ensure UI re-renders even if Redux doesn't refresh immediately
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [editingId, setEditingId] = useState(null);
  const [addNew, setAddNew] = useState(false);

  // Keep local state in sync when Redux user.addresses changes
  useEffect(() => {
    if (Array.isArray(user?.addresses)) {
      setAddresses(user.addresses);
    }
  }, [user?.addresses]);

  const byId = useMemo(() => {
    const map = new Map();
    (addresses || []).forEach(a => a?._id && map.set(a._id, a));
    return map;
  }, [addresses]);

  const handleEdit = (addressId) => {
    setEditingId(addressId);
    setAddNew(false);
  };

  const handleSaveEdit = async (updatedData) => {
    try {
      await dispatch(editAddressAction(updatedData));
      await dispatch(loadUserAction()); // refresh user
      setEditingId(null);
    } catch (e) {
      console.error('Edit address failed', e);
    }
  };

  const handleAddNew = async (newData) => {
    try {
      await dispatch(addNewAddressAction(newData));
      const refreshed = await dispatch(loadUserAction()); // fetch full user
      const addresses = refreshed?.user?.addresses || [];
      setAddresses(addresses);
      const newAddr = addresses[addresses.length - 1]; // pick last as newest
      if (newAddr?._id && typeof onSelect === 'function') {
        onSelect(newAddr._id);
      }
    } catch (e) {
      console.error('Add address failed:', e);
    } finally {
      setAddNew(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-xl">🚚</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Delivery Address</h2>
          <p className="text-gray-600">Choose where you want your order delivered</p>
        </div>
      </div>

      {/* Address List */}
      <div className="space-y-4">
        {(addresses || []).map((addr) => (
          <div key={addr._id} className="group relative">
            {/* Address Card */}
            <div className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
              selected === addr._id
                ? 'border-green-400 bg-green-50 ring-4 ring-green-100'
                : 'border-gray-200 hover:border-green-300'
            }`}>
              
              {/* Selection Radio & Content */}
              <label className="flex items-start gap-4 p-6 cursor-pointer">
                <div className="relative mt-1">
                  <input
                    type="radio"
                    name="address"
                    value={addr._id}
                    checked={selected === addr._id}
                    onChange={() => onSelect && onSelect(addr._id)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                    selected === addr._id
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300 group-hover:border-green-400'
                  }`}>
                    {selected === addr._id && (
                      <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* Address Type Badge */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      addr.addressType === 'Home'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {addr.addressType === 'Home' ? '🏠' : '🏢'} {addr.addressType || 'Home'}
                    </span>
                    {selected === addr._id && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        ✓ Selected
                      </span>
                    )}
                  </div>
                  
                  {/* Name & Phone */}
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{addr.name}</h3>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-700 font-medium">{addr.phone}</span>
                  </div>
                  
                  {/* Address */}
                  <div className="space-y-1">
                    <p className="text-gray-700 leading-relaxed">
                      <span className="font-medium">{addr.street}</span>
                    </p>
                    <p className="text-gray-600">
                      {addr.locality && `${addr.locality}, `}
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    {addr.landmark && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <span>📍</span> Near {addr.landmark}
                      </p>
                    )}
                  </div>
                </div>
              </label>

              {/* Edit Button */}
              <button
                onClick={() => handleEdit(addr._id)}
                className="absolute top-4 right-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:border-blue-300 hover:shadow-md"
              >
                ✏️ Edit
              </button>

              {/* Edit Form */}
              {editingId === addr._id && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <AddressForm
                    initial={byId.get(addr._id) || addr}
                    onSave={handleSaveEdit}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add New Address Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => {
              setAddNew(true);
              setEditingId(null);
            }}
            className="group flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-lg">+</span>
            </div>
            Add New Address
          </button>
        </div>

        {/* Add New Form */}
        {addNew && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6">
              <AddressForm
                onSave={handleAddNew}
                onCancel={() => setAddNew(false)}
              />
            </div>
          </div>
        )}
      </div>

      {/* No Addresses State */}
      {(!addresses || addresses.length === 0) && !addNew && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📍</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No addresses found</h3>
          <p className="text-gray-600 mb-6">Add your first delivery address to continue</p>
          <button
            onClick={() => setAddNew(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Add First Address
          </button>
        </div>
      )}
    </div>
  );
};

export default DeliveryAddressSection;
