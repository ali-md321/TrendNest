import React from 'react';

const AddressCard = ({ address, selected, onSelect, onEdit }) => (
  <div
    key={address._id}
    className={`relative group transition-all duration-300 transform hover:scale-[1.02] ${
      selected 
        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400 shadow-lg' 
        : 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
    } rounded-xl p-4 md:p-6 mb-4`}
  >
    {selected && (
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
        </svg>
      </div>
    )}
    
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 mt-1">
        <input 
          type="radio" 
          checked={selected} 
          onChange={onSelect}
          className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 focus:ring-2"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-gray-900 text-lg">{address.name}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              address.addressType === 'Home' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-purple-100 text-purple-700'
            }`}>
              {address.addressType || 'Home'}
            </span>
          </div>
          
          <button 
            onClick={onEdit}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200 hover:bg-blue-50 px-3 py-1 rounded-lg md:opacity-0 group-hover:opacity-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            EDIT
          </button>
        </div>
        
        <div className="space-y-2 text-gray-600">
          <p className="text-sm leading-relaxed">
            <span className="inline-block w-4 h-4 mr-2">📍</span>
            {/* Fix: prefer `address` string, fallback to street+locality */}
            {address.address || [address.street, address.locality].filter(Boolean).join(', ')}, {address.city}, {address.state} - {address.pincode}
          </p>
          
          <p className="text-sm flex items-center">
            <span className="inline-block w-4 h-4 mr-2">📞</span>
            {address.phone}
          </p>
          
          {address.landmark && (
            <p className="text-xs text-gray-500 flex items-center">
              <span className="inline-block w-4 h-4 mr-2">🏛️</span>
              Near {address.landmark}
            </p>
          )}
        </div>

        {selected && (
          <div className="mt-4 animate-fadeIn">
            <button className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              DELIVER HERE
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default AddressCard;
