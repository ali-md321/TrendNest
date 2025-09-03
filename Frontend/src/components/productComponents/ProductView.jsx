import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { toast } from "react-toastify";
import { getProductDetailsAction, getCategoryProductsAction } from "../../actions/productAction";
import { addCartAction, toggleWishlistAction } from "../../actions/userAction";
import Loader from "../Layouts/Loader";
import ReviewBox from "./ReviewBox";
import ProductCard from "./ProductCard";

const ProductView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { isLoading, product = {} } = useSelector((state) => state.product);
  const { categoryProducts = [] } = useSelector((state) => {
    const data = state.categoryProducts;
    return {
      categoryProducts: Array.isArray(data.categoryProducts) ? data.categoryProducts : [],
    };
  });

  const { isAuthenticated, user } = useSelector((state) => state.user);

  const [activeIndex, setActiveIndex] = useState(0);
  const [liked, setLiked] = useState(false);

  const images = (product?.images || []).map(img =>
    typeof img === "string" ? { url: img } : img
  );

  const handleCart = async (productId) => {
    if(!isAuthenticated){
      navigate(`/login?redirect=/product/${product._id}`);
    }else{
      await dispatch(addCartAction(productId));
      toast.success("Added to Cart");
    }
  };

  const handleOrder = async () => {
    localStorage.setItem("orderProduct", JSON.stringify(product));

    navigate(
      isAuthenticated
        ? `/product/${product._id}/order`
        : `/login?redirect=/product/${product._id}/order`
    );
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) return toast.info("Login to manage wishlist");
    await dispatch(toggleWishlistAction(product._id));
    setLiked((prev) => !prev);
  };

  useEffect(() => {
    dispatch(getProductDetailsAction(id));
  }, [dispatch, id]);

  useEffect(() => {
    async function fetch(){
      await dispatch(getCategoryProductsAction(product.category));
    } 
    fetch();
  }, [dispatch, product?.category]);

  useEffect(() => {
    if (isAuthenticated && product?._id && user?.wishlist) {
      const wished = user.wishlist.some(
        (item) => item._id === product._id || item === product._id
      );
      setLiked(wished);
    } else {
      setLiked(false);
    }
  }, [product, user, isAuthenticated]);

  if (isLoading) return <Loader />;

  // Enhanced No Product Found UI
  if ( !isLoading && (!product || Object.keys(product).length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-128 h-128 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative text-center p-8 max-w-md mx-auto">
          {/* Animated Icon */}
          <div className="relative mb-8">
            <div className="text-9xl animate-bounce mb-4">😔</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 border-4 border-blue-200 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
            Oops! Product Not Found
          </h2>
          
          {/* Description */}
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            The product you're looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          
          {/* Enhanced Explore Button */}
          <Link to="/">
            <button className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-2xl">
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></span>
              <span className="relative flex items-center gap-3">
                <span className="text-2xl">🏠</span>
                Explore Products
                <span className="text-xl group-hover:translate-x-1 transition-transform duration-300">→</span>
              </span>
            </button>
          </Link>
          
          {/* Decorative Elements */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-40 animate-bounce"></div>
          <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-40 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-128 h-128 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute bottom-32 left-16 w-5 h-5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-25 animate-ping"></div>
      </div>

      {/* TOP SECTION */}
      <div className="relative flex flex-col md:flex-row shadow-2xl bg-white/90 backdrop-blur-sm rounded-b-3xl overflow-hidden border border-white/50">
        
        {/* LEFT IMAGE + BUTTONS */}
        <div className="md:max-h-screen w-full md:w-[42%] bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 p-6 md:sticky md:top-0 flex flex-col relative">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-blue-50/40 to-purple-50/30 pointer-events-none"></div>
          
          {/* MAIN IMAGE */}
          <div className="relative flex-1 flex items-center justify-center mb-4 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/50">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/20 rounded-3xl"></div>
            <img
              src={images[activeIndex]?.url}
              alt={`product-${activeIndex}`}
              className="relative z-10 w-full max-h-96 object-contain hover:scale-110 transition-all duration-500 filter drop-shadow-lg"
            />
          </div>

          {/* THUMBNAILS */}
          <div className="relative flex gap-3 justify-center mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((img, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={img.url}
                  onClick={() => setActiveIndex(idx)}
                  className={`relative z-10 w-16 h-16 object-cover rounded-2xl cursor-pointer border-2 transition-all duration-300 hover:scale-110 ${
                    activeIndex === idx 
                      ? "ring-4 ring-blue-400/50 border-blue-400 shadow-lg scale-110 bg-blue-50" 
                      : "border-white/50 hover:border-blue-300 bg-white/80"
                  }`}
                />
                {activeIndex === idx && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl blur animate-pulse"></div>
                )}
              </div>
            ))}
          </div>

          {/* ENHANCED BUTTONS */}
          <div className="relative flex gap-4">
            <button
              onClick={() => handleCart(product._id)}
              className="flex-1 group relative bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 text-white font-bold py-4 px-6 rounded-2xl hover:from-orange-500 hover:via-red-500 hover:to-red-600 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-300 to-red-400 opacity-0 group-hover:opacity-30 blur transition-opacity duration-300"></div>
              <span className="relative text-2xl group-hover:scale-110 transition-transform duration-300">🛒</span>
              <span className="relative">Add to Cart</span>
            </button>
            <button
              onClick={handleOrder}
              className="flex-1 group relative bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-red-600 hover:via-pink-600 hover:to-purple-700 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-purple-500 opacity-0 group-hover:opacity-30 blur transition-opacity duration-300"></div>
              <span className="relative text-2xl group-hover:scale-110 transition-transform duration-300">⚡</span>
              <span className="relative">Buy Now</span>
            </button>
          </div>
        </div>

        {/* RIGHT SCROLLABLE DETAILS */}
        <div className="relative w-full md:w-[58%] overflow-y-auto md:max-h-screen p-6 lg:p-8 text-gray-800">
          {/* TITLE + WISHLIST */}
          <div className="relative mb-6">
            <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 pr-16 leading-tight bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              {product.title}
            </h1>
            {isAuthenticated && (
              <button 
                onClick={toggleWishlist} 
                className="absolute top-0 right-0 p-3 rounded-2xl hover:bg-pink-50 transition-all duration-300 group transform hover:scale-110"
              >
                <FavoriteIcon 
                  className={`text-3xl transition-all duration-300 ${
                    liked ? "text-pink-500 scale-110" : "text-gray-400 hover:text-pink-400 group-hover:scale-110"
                  }`} 
                />
              </button>
            )}
          </div>

          {/* ENHANCED RATING */}
          <div className="flex items-center gap-4 mb-6 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 px-6 py-4 rounded-2xl border-2 border-green-100/50 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-pulse">⭐</span>
              <span className="text-green-700 font-bold text-xl">
                {product?.ratings?.toFixed(1)}
              </span>
              <span className="text-green-600 text-sm">/ 5</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/50">
              <span className="text-gray-600 text-sm font-medium">
                ({product?.numOfReviews} reviews)
              </span>
            </div>
          </div>

          {/* ENHANCED PRICE */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-blue-100/50 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5"></div>
            <div className="relative flex items-end gap-4 flex-wrap">
              <span className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                ₹{product.discountedPrice}
              </span>
              <span className="line-through text-gray-500 text-xl">
                ₹{product.price}
              </span>
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg animate-pulse">
                {product.discountPercent}% OFF
              </span>
            </div>
          </div>

          {/* ENHANCED OFFERS */}
          <div className="mb-8 p-6 bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 rounded-2xl border-2 border-yellow-200/50 shadow-xl backdrop-blur-sm">
            <h2 className="font-bold mb-4 text-xl text-gray-900 flex items-center gap-3">
              <span className="text-2xl animate-bounce">🎁</span>
              Available Offers
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700 p-3 bg-white/60 rounded-xl backdrop-blur-sm">
                <span className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse"></span>
                5% Cashback on select Cards
              </div>
              <div className="flex items-center gap-3 text-gray-700 p-3 bg-white/60 rounded-xl backdrop-blur-sm">
                <span className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></span>
                ₹10 Paytm Cashback
              </div>
              <div className="flex items-center gap-3 text-gray-700 p-3 bg-white/60 rounded-xl backdrop-blur-sm">
                <span className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full animate-pulse"></span>
                No cost EMI available
              </div>
            </div>
          </div>

          {/* ENHANCED HIGHLIGHTS */}
          {product.highlights?.length > 0 && (
            <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-indigo-200/50 shadow-xl backdrop-blur-sm">
              <h2 className="font-bold mb-4 text-xl text-gray-900 flex items-center gap-3">
                <span className="text-2xl animate-pulse">✨</span>
                Highlights
              </h2>
              <div className="space-y-3">
                {product.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-700 p-3 bg-white/60 rounded-xl backdrop-blur-sm">
                    <span className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full animate-pulse"></span>
                    {h}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ENHANCED DESCRIPTION */}
          <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 via-slate-50 to-gray-100 rounded-2xl border-2 border-gray-200/50 shadow-xl backdrop-blur-sm">
            <h2 className="font-bold mb-4 text-xl text-gray-900 flex items-center gap-3">
              <span className="text-2xl">📝</span>
              Description
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>
          </div>

          {/* ENHANCED INFO CARDS */}
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 p-6 rounded-2xl border-2 border-white/50 shadow-xl backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
              <p className="text-gray-500 text-sm mb-2 font-medium">Brand</p>
              <p className="font-bold text-gray-900 text-lg">{product.brand}</p>
            </div>
            <div className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 p-6 rounded-2xl border-2 border-white/50 shadow-xl backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
              <p className="text-gray-500 text-sm mb-2 font-medium">Seller</p>
              <p className="font-bold text-gray-900 text-lg">{product.seller?.name}</p>
            </div>
            <div className="bg-gradient-to-br from-white via-yellow-50/30 to-orange-50/20 p-6 rounded-2xl border-2 border-white/50 shadow-xl backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
              <p className="text-gray-500 text-sm mb-2 font-medium">Stock</p>
              <p className={`font-bold text-lg ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `${product.stock} left` : "Out of Stock"}
              </p>
            </div>
          </div>

          {/* ENHANCED REVIEWS */}
          {product.reviews?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                <span className="text-2xl">💬</span>
                Customer Reviews
              </h2>
              <div className="space-y-4">
                {product.reviews.map((review, i) => (
                  <div key={i} className="bg-gradient-to-br from-white via-blue-50/20 to-purple-50/10 p-6 rounded-2xl border-2 border-white/50 shadow-xl backdrop-blur-sm transform hover:scale-102 transition-all duration-300">
                    <ReviewBox review={review} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ENHANCED SIMILAR PRODUCTS */}
      <div className="relative mt-12 px-4 lg:px-8 pb-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-900 flex items-center gap-3 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
          <span className="text-3xl animate-pulse">🔍</span>
          Similar Products
        </h2>
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
          {categoryProducts?.filter((item) => item._id !== product._id)
            .map((item) => (
              <div 
                key={item._id} 
                className="flex-shrink-0 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer" 
                onClick={() => navigate(`/product/${item._id}`)}
              >
                <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 rounded-2xl border-2 border-white/50 shadow-xl backdrop-blur-sm p-2">
                  <ProductCard product={item} />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProductView;