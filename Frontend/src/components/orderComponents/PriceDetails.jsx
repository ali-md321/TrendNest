import React from 'react';

const PriceDetails = ({ product, quantity = 1 }) => {
  const price = product.price * quantity;
  const discount = product.discountedPrice * quantity;
  const delivery = discount > 500 ? 0 : 40;
  const savings = price - discount;
  const total = discount + delivery;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden sticky top-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">🧾</span>
          </div>
          <div>
            <h2 className="font-bold text-xl text-white">Price Details</h2>
            <p className="text-gray-300 text-sm">Breakdown of your order</p>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="p-6 space-y-5">
        
        {/* Original Price */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">💰</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Price ({quantity} item{quantity > 1 ? 's' : ''})</span>
              <p className="text-xs text-gray-500">Original price</p>
            </div>
          </div>
          <span className="font-bold text-lg text-gray-800">₹{price.toLocaleString()}</span>
        </div>

        {/* Discount */}
        {savings > 0 && (
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">🎉</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Discount</span>
                <p className="text-xs text-green-600">You save ₹{savings.toLocaleString()}</p>
              </div>
            </div>
            <span className="font-bold text-lg text-green-600">- ₹{savings.toLocaleString()}</span>
          </div>
        )}

        {/* Delivery Charges */}
        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-sm">🚚</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Delivery Charges</span>
              <p className="text-xs text-gray-500">
                {delivery === 0 ? 'Free delivery on orders above ₹500' : 'Standard delivery'}
              </p>
            </div>
          </div>
          <span className={`font-bold text-lg ${delivery === 0 ? 'text-green-600' : 'text-orange-600'}`}>
            {delivery === 0 ? 'FREE' : `₹${delivery}`}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-dashed border-gray-200 my-4"></div>

        {/* Total Amount */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-xl">💸</span>
              </div>
              <div>
                <span className="font-bold text-lg">Total Amount</span>
                <p className="text-indigo-100 text-sm">Final amount to pay</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-2xl">₹{total.toLocaleString()}</span>
              <p className="text-indigo-200 text-sm">All inclusive</p>
            </div>
          </div>
        </div>

        {/* Savings Summary */}
        {savings > 0 && (
          <div className="bg-green-100 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">%</span>
              </div>
              <div>
                <p className="text-green-800 font-semibold">
                  You saved ₹{savings.toLocaleString()} on this order!
                </p>
                <p className="text-green-600 text-sm">
                  That's {Math.round((savings / price) * 100)}% off the original price
                </p>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default PriceDetails;