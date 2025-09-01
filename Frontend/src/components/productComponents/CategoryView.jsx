import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { getCategoryProductsAction } from '../../actions/productAction';
import Loader from '../Layouts/Loader';
import { toggleWishlistAction } from '../../actions/userAction';
import { toast } from 'react-toastify';

function CategoryView() {
  const { category } = useParams();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.user);

  const { isLoading, categoryProducts = [] } = useSelector((state) => {
    const data = state.categoryProducts;
    return {
      isLoading: data.isLoading,
      categoryProducts: Array.isArray(data.categoryProducts) ? data.categoryProducts : [],
    };
  });

  const [likedMap, setLikedMap] = useState({});

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      return toast.info("Login to add/remove Wishlist item");
    }
    await dispatch(toggleWishlistAction(productId));
    setLikedMap(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  useEffect(() => {
    dispatch(getCategoryProductsAction(category));
  }, [dispatch, category]);

  useEffect(() => {
    const initial = {};
    categoryProducts.forEach(p => {
      initial[p._id] = user?.wishlist?.some(item => item._id === p._id || item === p._id);
    });
    setLikedMap(initial);
  }, [categoryProducts, user]);

  if (isLoading) return <Loader />;

  return (
    <div className="px-3 sm:px-4 py-4 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 capitalize text-center sm:text-left">
            Showing results for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {category}
            </span>
          </h2>
          <div className="mt-2 text-center sm:text-left">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              {categoryProducts.length} Products Found
            </span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-3 sm:space-y-4">
        {categoryProducts.map(product => (
          <Link
            to={`/product/${product._id}`}
            key={product._id}
            className="block bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden relative group"
          >
            {/* Wishlist Button */}
            {isAuthenticated && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleWishlist(product._id);
                }}
                className="absolute top-3 right-3 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
              >
                <FavoriteIcon
                  className={`text-lg ${
                    likedMap[product._id] 
                      ? "text-pink-500" 
                      : "text-gray-400 group-hover:text-pink-300"
                  }`}
                />
              </button>
            )}

            {/* Mobile Layout (< md) */}
            <div className="md:hidden">
              {/* Mobile Image */}
              <div className="relative bg-gray-50 aspect-square overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                />
                {/* Mobile Discount Badge */}
                {product.discountPercent && (
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                    {product.discountPercent}% OFF
                  </div>
                )}
              </div>

              {/* Mobile Content */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 leading-tight">
                  {product.title}
                </h3>

                {/* Mobile Highlights - Compact */}
                <div className="text-xs text-gray-600 space-y-1 mb-3">
                  {product.highlights.slice(0, 2).map((line, idx) => (
                    <div key={idx} className="flex items-center">
                      <span className="w-1 h-1 bg-blue-400 rounded-full mr-2 flex-shrink-0"></span>
                      <span className="truncate">{line}</span>
                    </div>
                  ))}
                </div>

                {/* Mobile Rating & Price Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-md text-xs font-bold flex items-center">
                      {product.ratings?.toFixed(1) || "4.0"} ★
                    </span>
                    <span className="text-xs text-gray-500">
                      ({product.numOfReviews || 0})
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-600">
                      ₹{product.discountedPrice?.toLocaleString()}
                    </div>
                    {product.discountPercent && (
                      <div className="text-xs text-gray-500 line-through">
                        ₹{product.price?.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout (>= md) - Original Enhanced */}
            <div className="hidden md:flex p-4 sm:p-6">
              <div className="relative flex-shrink-0">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-32 h-32 lg:w-40 lg:h-40 object-contain rounded-lg bg-gray-50 p-2 group-hover:scale-105 transition-transform duration-300"
                />
                {product.discountPercent && (
                  <div className="absolute -top-2 -left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                    {product.discountPercent}% OFF
                  </div>
                )}
              </div>

              <div className="ml-4 lg:ml-6 flex-1 min-w-0">
                <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                  {product.title}
                </h3>

                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  {product.highlights.slice(0, 4).map((line, idx) => (
                    <div key={idx} className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      <span className="truncate">{line}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center shadow-md">
                      {product.ratings?.toFixed(1) || "4.0"} ★
                    </span>
                    <span className="text-sm text-gray-500">
                      {product.numOfReviews || 0} Ratings
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-xl lg:text-2xl font-bold text-emerald-600">
                      ₹{product.discountedPrice?.toLocaleString()}
                    </div>
                    {product.discountPercent && (
                      <div className="text-sm text-gray-500 line-through">
                        ₹{product.price?.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {categoryProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-600">Try searching for a different category.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryView;