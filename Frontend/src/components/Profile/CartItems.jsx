import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../Layouts/Loader';
import {
  addCartAction,
  savedForLaterAction,
  updateCartQtyAction,
  removeCartItemAction,
  removeSavedItemAction,
  getCartSavedAction,
} from '../../actions/userAction';
import { toast } from 'react-toastify';

const CartItems = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.user);

  const [cart, setCart] = useState([]);
  const [saved, setSaved] = useState([]);

  useEffect(() => {
   const fetch = async() =>{
    const res = await dispatch(getCartSavedAction());
    setCart(res.cart);
    setSaved(res.saved);
   }
   fetch()
  }, [dispatch]);

  const handleQtyChange = async (productId, type) => {
    const item = cart.find((i) => i.product._id === productId);
    if (!item) return;

    const newQty = type === 'inc' ? item.quantity + 1 : Math.max(1, item.quantity - 1);
    const updatedCart = cart.map((i) =>
      i.product._id === productId ? { ...i, quantity: newQty } : i
    );

    await dispatch(updateCartQtyAction(productId, newQty));
    setCart(updatedCart);
    toast.info('Quantity updated');
  };

  const handleSaveForLater = async (productId) => {
    await dispatch(savedForLaterAction(productId));
    const movedItem = cart.find((i) => i.product._id === productId);
    if (!movedItem) return;

    setCart(cart.filter((i) => i.product._id !== productId));
    setSaved([...saved, movedItem.product]);
    toast.success('Item saved for later');
  };

  const handleMoveToCart = async (productId) => {
    await dispatch(addCartAction(productId));
    const movedItem = saved.find((i) => i._id === productId);
    if (!movedItem) return;

    setSaved(saved.filter((i) => i._id !== productId));
    setCart([...cart, { product: movedItem, quantity: 1 }]);
    toast.success('Item moved to cart');
  };

  const handleRemove = async (productId, type) => {
    if (type === 'cart') {
      await dispatch(removeCartItemAction(productId));
      setCart(cart.filter((i) => i.product._id !== productId));
    } else {
      await dispatch(removeSavedItemAction(productId));
      setSaved(saved.filter((i) => i._id !== productId));
    }
    toast.warn('Item removed');
  };

  const renderItem = (item, type = 'cart') => {
    const isCart = type === 'cart';
    const product = isCart ? item.product : item;

    return (
      <div
        key={product?._id}
        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group"
      >
        {/* Mobile Layout (< md screens) */}
        <div className="flex flex-col space-y-4 md:hidden">
          <div className="flex space-x-4">
            <div className="relative flex-shrink-0">
              <img
                src={product?.images?.[0] || '/placeholder.png'}
                alt={product?.title}
                className="w-20 h-20 object-contain rounded-lg border border-gray-100 bg-gray-50"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">
                {product?.title}
              </h3>
              {product?.seller?.name && (
                <p className="text-xs text-gray-500 mb-2">
                  by <span className="font-medium">{product?.seller.name}</span>
                </p>
              )}
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">₹{product?.price}</span>
                <span className="text-sm line-through text-gray-400">
                  ₹{product?.discountedPrice}
                </span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                  {product?.discountPercent}% OFF
                </span>
              </div>
            </div>
          </div>

          {/* Quantity Controls for Mobile */}
          {isCart && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">Quantity:</span>
              <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                <button 
                  onClick={() => handleQtyChange(product?._id, 'dec')} 
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-l-lg transition-colors"
                >
                  −
                </button>
                <span className="w-12 h-8 flex items-center justify-center text-sm font-semibold bg-white border-x border-gray-200">
                  {item.quantity}
                </span>
                <button 
                  onClick={() => handleQtyChange(product?._id, 'inc')} 
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-r-lg transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons for Mobile */}
          <div className="flex space-x-4 pt-2 border-t border-gray-100">
            {isCart ? (
              <button 
                onClick={() => handleSaveForLater(product?._id)} 
                className="flex-1 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                💾 SAVE FOR LATER
              </button>
            ) : (
              <button 
                onClick={() => handleMoveToCart(product?._id)} 
                className="flex-1 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                🛒 MOVE TO CART
              </button>
            )}
            <button 
              onClick={() => handleRemove(product?._id, type)} 
              className="flex-1 text-sm font-semibold text-red-600 hover:text-red-700 hover:underline transition-colors"
            >
              🗑️ REMOVE
            </button>
          </div>
        </div>

        {/* Desktop Layout (≥ md screens) */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          <div className="flex-shrink-0">
            <img
              src={product?.images?.[0] || '/placeholder.png'}
              alt={product?.title}
              className="w-24 h-24 object-contain rounded-lg border border-gray-100 bg-gray-50"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-1">
              {product?.title}
            </h3>
            {product?.seller?.name && (
              <p className="text-sm text-gray-500 mb-2">
                Seller: <span className="font-medium">{product?.seller.name}</span>
              </p>
            )}
            <div className="flex items-center space-x-3">
              <span className="text-xl font-bold text-gray-900">₹{product?.price}</span>
              <span className="text-sm line-through text-gray-400">
                ₹{product?.discountedPrice}
              </span>
              <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                {product?.discountPercent}% OFF
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-3">
            {/* Quantity Controls for Desktop */}
            {isCart && (
              <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                <button 
                  onClick={() => handleQtyChange(product?._id, 'dec')} 
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-l-lg transition-colors"
                >
                  −
                </button>
                <span className="w-14 h-10 flex items-center justify-center text-sm font-semibold bg-white border-x border-gray-200">
                  {item.quantity}
                </span>
                <button 
                  onClick={() => handleQtyChange(product?._id, 'inc')} 
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-r-lg transition-colors"
                >
                  +
                </button>
              </div>
            )}

            {/* Action Buttons for Desktop */}
            <div className="flex space-x-4 text-sm font-semibold">
              {isCart ? (
                <button 
                  onClick={() => handleSaveForLater(product?._id)} 
                  className="text-blue-600 hover:text-blue-700 hover:underline transition-colors flex items-center space-x-1"
                >
                  <span>💾</span>
                  <span>SAVE FOR LATER</span>
                </button>
              ) : (
                <button 
                  onClick={() => handleMoveToCart(product?._id)} 
                  className="text-blue-600 hover:text-blue-700 hover:underline transition-colors flex items-center space-x-1"
                >
                  <span>🛒</span>
                  <span>MOVE TO CART</span>
                </button>
              )}
              <button 
                onClick={() => handleRemove(product?._id, type)} 
                className="text-red-600 hover:text-red-700 hover:underline transition-colors flex items-center space-x-1"
              >
                <span>🗑️</span>
                <span>REMOVE</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <span>🛒</span>
            <span>My Cart</span>
            <span className="text-lg text-gray-500">({cart?.length})</span>
          </h1>
        </div>

        {/* Cart Items */}
        {cart?.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Start adding products to see them here.
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {cart?.map((item) => renderItem(item, 'cart'))}
          </div>
        )}

        {/* Saved Items */}
        {saved?.length > 0 && (
          <div className="mt-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-3">
                <span>💾</span>
                <span>Saved For Later</span>
                <span className="text-lg text-gray-500">({saved.length})</span>
              </h2>
            </div>
            <div className="space-y-4">
              {saved?.map((item) => renderItem(item, 'saved'))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartItems;