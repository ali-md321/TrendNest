import React, { useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import { addCartAction, getWishListAction, toggleWishlistAction } from "../../actions/userAction";
import FavoriteIcon from '@mui/icons-material/Favorite';
import { toast } from "react-toastify";
import Loader from '../Layouts/Loader';

const MyWishlist = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.user);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const fetch = async() => {
      const res = await dispatch(getWishListAction());
      setWishlist(res.wishlist);
    }
    fetch();
  }, [dispatch]);

  const handleDelete = async (productId) => {
    await dispatch(toggleWishlistAction(productId));
    setWishlist((prev) => prev.filter((item) => item._id !== productId));
  };

  const handleCart = async (productId) => {
      await dispatch(addCartAction(productId));
      toast.success("Added to Cart");
    };

  if(isLoading){
    return <Loader />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-4 sm:px-6 py-6 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <FavoriteIcon className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  My Wishlist
                </h2>
                <p className="text-pink-100 text-sm">
                  {wishlist?.length} {wishlist?.length === 1 ? 'item' : 'items'} saved for later
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="space-y-4">
          {wishlist?.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.images?.[0]?.url}
                        alt={item.title}
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                      {item.title}
                    </h3>
                    
                    {/* Price Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start mb-4">
                      <span className="text-xl font-bold text-gray-900">
                        ₹{item.discountedPrice}
                      </span>
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <span className="text-sm text-gray-500 line-through">
                          ₹{item.price}
                        </span>
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                          {item.discountPercent}% OFF
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button onClick={() => handleCart(item._id)} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium">
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="flex-1 sm:flex-initial bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                        title="Remove from Wishlist?"
                      >
                        <DeleteIcon fontSize="small" />
                        <span className="sm:hidden">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {wishlist?.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FavoriteIcon className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500 text-sm mb-6">
                Save items you love to your wishlist and shop them later
              </p>
              <button className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-200 font-medium">
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default MyWishlist;
