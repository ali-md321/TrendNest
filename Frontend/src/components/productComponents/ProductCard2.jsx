import React from "react";
import { useNavigate } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useDispatch, useSelector } from "react-redux";
import { toggleWishlistAction } from "../../actions/userAction";

const ProductCard2 = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const isWished = user?.wishlist?.some(
    (item) => item._id === product._id || item === product._id
  );

  const toggleWishlist = (e) => {
    e.stopPropagation();
    dispatch(toggleWishlistAction(product._id));
  };

  return (
    <div
      className="min-w-[160px] max-w-[180px] bg-white border rounded-lg p-2 shadow-sm hover:shadow-md cursor-pointer relative"
      onClick={() => navigate(`/product/${product._id}`)}
    >
      <div className="relative">
        <img
          src={product.images?.[0]?.url}
          alt={product.title}
          className="h-40 w-full object-contain"
        />
        <button
          onClick={toggleWishlist}
          className="absolute top-2 right-2 z-10"
        >
          <FavoriteIcon className={isWished ? "text-pink-600" : "text-gray-400"} />
        </button>
      </div>

      <div className="mt-2">
        <h2
          className="text-sm font-semibold hover:text-blue-600 line-clamp-2"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/product/${product._id}`);
          }}
        >
          {product.title}
        </h2>
        <p
          className="text-xs text-green-700 font-medium mt-1"
          onClick={(e) => e.stopPropagation()}
        >
          ⭐ {product.ratings?.toFixed(1)} ({product.numOfReviews})
        </p>
        <div
          className="mt-1 text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="font-bold text-black">₹{product.discountedPrice}</span>
          <span className="line-through text-gray-500 ml-1 text-xs">₹{product.price}</span>
          <span className="text-green-600 text-xs ml-1 font-semibold">{product.discountPercent}% off</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard2;
