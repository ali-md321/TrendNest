import React from 'react';

const PaymentSection = ({ selectedMethod, onChange }) => {
  const paymentMethods = [
    {
      value: 'UPI',
      label: 'UPI / QR',
      icon: '📱',
      description: 'Pay using any UPI app',
      color: 'from-orange-400 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200'
    },
    {
      value: 'Card',
      label: 'Debit/Credit Card',
      icon: '💳',
      description: 'Secure card payment',
      color: 'from-blue-400 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      value: 'COD',
      label: 'Cash on Delivery',
      icon: '💵',
      description: 'Pay when delivered',
      color: 'from-green-400 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      borderColor: 'border-green-200'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">💰</span>
          </div>
          <div>
            <h2 className="font-bold text-xl text-white">Payment Methods</h2>
            <p className="text-purple-100 text-sm">Choose your preferred payment option</p>
          </div>
        </div>
      </div>

      {/* Payment Options */}
      <div className="p-6 space-y-4">
        {paymentMethods.map((method, idx) => (
          <label key={idx} className="group cursor-pointer block">
            <div className={`relative p-5 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
              selectedMethod === method.value
                ? `bg-gradient-to-r ${method.bgColor} ${method.borderColor} ring-4 ring-opacity-30 ${method.borderColor.replace('border-', 'ring-')} shadow-lg`
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}>
              
              {/* Radio Button */}
              <div className="flex items-start gap-4">
                <div className="relative mt-1">
                  <input
                    type="radio"
                    name="payment"
                    value={method.value}
                    checked={selectedMethod === method.value}
                    onChange={(e) => onChange(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                    selectedMethod === method.value
                      ? `${method.borderColor.replace('border-', 'border-')} bg-gradient-to-r ${method.color}`
                      : 'border-gray-300 group-hover:border-gray-400'
                  }`}>
                    {selectedMethod === method.value && (
                      <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    )}
                  </div>
                </div>

                {/* Method Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedMethod === method.value 
                        ? `bg-gradient-to-r ${method.color}` 
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    } transition-all duration-200`}>
                      <span className={`text-xl ${
                        selectedMethod === method.value ? 'text-white' : 'text-gray-600'
                      }`}>
                        {method.icon}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className={`font-semibold text-lg transition-colors duration-200 ${
                        selectedMethod === method.value ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {method.label}
                      </h3>
                      <p className={`text-sm transition-colors duration-200 ${
                        selectedMethod === method.value ? 'text-gray-600' : 'text-gray-500'
                      }`}>
                        {method.description}
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {method.value === 'UPI' && (
                      <>
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">Instant</span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">No fees</span>
                      </>
                    )}
                    {method.value === 'Card' && (
                      <>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Secure</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">All cards</span>
                      </>
                    )}
                    {method.value === 'COD' && (
                      <>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">No advance</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Convenient</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Selected Indicator */}
                {selectedMethod === method.value && (
                  <div className="absolute top-3 right-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${method.color} flex items-center justify-center shadow-lg`}>
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* Footer Info */}
      <div className="bg-gray-50 p-4 border-t">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <span>🔒</span>
          <span>All payments are secure and encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSection;