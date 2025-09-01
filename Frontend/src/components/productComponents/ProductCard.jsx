// ProductImage.js
import React from "react";

const ProductImage = ({ product }) => {
  const images = (product?.images || []).map(img =>
          typeof img === "string" ? { url: img } : img
        );
  return (
    <div className="relative group">
      <div className="w-full h-48 sm:h-56 bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-2xl overflow-hidden">
        
        <img
          src={images[0]?.url}
          alt={product.title}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      {/* Trending Badge */}
      {product.isTrending && (
        <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg font-medium flex items-center gap-1 animate-pulse">
          <span className="text-yellow-200">🔥</span>
          Trending
        </div>
      )}
      
      {/* Discount Badge */}
      {product.discountPercent > 0 && (
        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-md shadow-md font-bold">
          {product.discountPercent}% OFF
        </div>
      )}
    </div>
  );
};

const ProductInfo = ({ product }) => {
  return (
    <div className="p-4 space-y-3">
      {/* Product Title */}
      <h3 className="text-sm sm:text-base font-medium text-gray-800 line-clamp-2 leading-tight">
        {product.title}
      </h3>
      
      {/* Rating Section */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
          <span className="mr-1">★</span>
          {product.rating || "4.2"}
        </div>
        <span className="text-gray-500 text-xs">
          ({product.reviewCount || "1,234"})
        </span>
      </div>
      
      {/* Price Section */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xl sm:text-2xl font-bold text-gray-900">
            ₹{product.discountedPrice?.toLocaleString()}
          </span>
          {product.price !== product.discountedPrice && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.price?.toLocaleString()}
            </span>
          )}
        </div>
        
        {/* Delivery Info */}
        <div className="text-xs text-gray-600 flex items-center gap-1">
          <span className="text-green-600 font-medium">✓</span>
          Free delivery
        </div>
      </div>
      
      {/* Features/Highlights */}
      {product.highlights && product.highlights.length > 0 && (
        <div className="space-y-1">
          {product.highlights.slice(0, 2).map((highlight, index) => (
            <div key={index} className="text-xs text-gray-600 flex items-start gap-1">
              <span className="text-blue-500 mt-0.5">•</span>
              <span className="line-clamp-1">{highlight}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


const ProductCard = ({ product }) => {
  return (
    <div className="group w-full h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 overflow-hidden transform hover:-translate-y-1">
      {/* Product Image Section */}
      <ProductImage product={product} />
      
      {/* Product Info Section */}
      <ProductInfo product={product} />
      
      {/* Hover Overlay Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
    </div>
  );
};

// ProductGrid.js (Grid Container Component)
const ProductGrid = ({ products, title = "Products" }) => {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
        {products?.map((product) => (
          <div key={product._id} className="w-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      
      {/* Empty State */}
      {(!products || products.length === 0) && (
        <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
          <div className="text-6xl mb-4 opacity-50">📦</div>
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

// ProductListItem.js (List View Component)
const ProductListItem = ({ product }) => {
  return (
    <div className="flex bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-blue-200 overflow-hidden p-4 gap-4">
      {/* Image */}
      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={product.images?.[0]?.url}
          alt={product.title}
          className="w-full h-full object-contain p-2"
        />
      </div>
      
      {/* Content */}
      <div className="flex-1 space-y-2">
        <h3 className="text-sm sm:text-base font-medium text-gray-800 line-clamp-2">
          {product.title}
        </h3>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
            <span className="mr-1">★</span>
            {product.rating || "4.2"}
          </div>
          <span className="text-gray-500 text-xs">
            ({product.reviewCount || "1,234"})
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            ₹{product.discountedPrice?.toLocaleString()}
          </span>
          {product.price !== product.discountedPrice && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.price?.toLocaleString()}
            </span>
          )}
          {product.discountPercent > 0 && (
            <span className="text-xs text-green-600 font-medium">
              {product.discountPercent}% off
            </span>
          )}
        </div>
        
        <div className="text-xs text-green-600 font-medium">
          ✓ Free delivery
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
export { ProductImage, ProductInfo, ProductGrid, ProductListItem };