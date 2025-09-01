import React from 'react';

function OrderSummary({ product, quantity, setQuantity }) {
  const increment = () => setQuantity(prev => Math.min(prev + 1, 10)); // max 10
  const decrement = () => setQuantity(prev => Math.max(prev - 1, 1));  // min 1

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border border-blue-100 overflow-hidden">

      {/* Content */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Product Image */}
          <div className="relative group">
            <div className="w-32 h-32 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-lg ring-4 ring-white">
              <img
                src={Array.isArray(product?.images) ? (product.images[0]?.url || product.images[0]) : "undefined"}
                alt={product?.title || "Product"}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 space-y-4">
            {/* Product Title */}
            <div>
              <h3 className="font-bold text-lg text-gray-900 leading-tight">
                {product.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">Selected for purchase</p>
            </div>

            {/* Quantity Section */}
            <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Quantity</p>
                  <p className="text-xs text-gray-500">Max 10 items allowed</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={decrement}
                    disabled={quantity <= 1}
                    className="w-10 h-10 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-full font-bold transition-all duration-200 transform hover:scale-110 disabled:scale-100 disabled:cursor-not-allowed shadow-lg flex items-center justify-center"
                  >
                    −
                  </button>
                  
                  <div className="w-16 h-10 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-lg text-blue-700">{quantity}</span>
                  </div>
                  
                  <button
                    onClick={increment}
                    disabled={quantity >= 10}
                    className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-full font-bold transition-all duration-200 transform hover:scale-110 disabled:scale-100 disabled:cursor-not-allowed shadow-lg flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Total Amount</p>
                  <p className="text-xs text-green-600">Inclusive of all taxes</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    ₹{(product.discountedPrice * quantity).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">for {quantity} item{quantity > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSummary;
