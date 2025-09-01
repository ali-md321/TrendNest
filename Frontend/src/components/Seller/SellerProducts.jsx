// components/Seller/SellerProducts.jsx
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSellerProductsAction } from "../../actions/sellerAction";
import Loader from "../Layouts/Loader";
import { Link } from "react-router-dom";
import LoadingProducts from "../Layouts/LoadingProducts";

function SellerProducts() {
  const dispatch = useDispatch();
  const { isLoading, error, sellerProducts, hasMore } = useSelector((s) => s.sellerProducts);
  const products = Array.isArray(sellerProducts) ? sellerProducts : [];

  // paging + guards
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const fetchedPages = useRef(new Set());
  const inFlightRef = useRef(false);
  const hasUserScrolled = useRef(false);

  // first load (page 1)
  useEffect(() => {
    if (fetchedPages.current.has(1)) return;
    fetchedPages.current.add(1);
    dispatch(getSellerProductsAction(1));
  }, [dispatch]);

  // mark when user actually scrolls (prevents auto-load on mount if content is short)
  useEffect(() => {
    const onFirstScroll = () => {
      hasUserScrolled.current = true;
      window.removeEventListener("scroll", onFirstScroll);
    };
    window.addEventListener("scroll", onFirstScroll, { passive: true });
    return () => window.removeEventListener("scroll", onFirstScroll);
  }, []);

  // fetch when page increments (beyond 1)
  useEffect(() => {
    if (page === 1) return;
    if (fetchedPages.current.has(page)) return;
    fetchedPages.current.add(page);

    const run = async () => {
      await dispatch(getSellerProductsAction(page));
      inFlightRef.current = false;
      setLoadingMore(false);
    };
    run();
  }, [dispatch, page]);

  // sentinel observer at end of grid with fallback
  const sentinelRef = useRef(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    // handler used by both observer & fallback
    const tryQueueNext = () => {
      if (inFlightRef.current) return;   // already queued/in-flight
      if (!hasMore) return;              // nothing more to load
      inFlightRef.current = true;
      setLoadingMore(true);
      setPage((p) => p + 1);
    };

    // IntersectionObserver config: lower threshold + generous rootMargin so it triggers reliably
    let io;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry && entry.isIntersecting) {
            tryQueueNext();
          }
        },
        {
          root: null,
          rootMargin: "0px 0px 200px 0px", // trigger earlier
          threshold: 0, // any intersection is enough
        }
      );
      io.observe(node);
    }

    // fallback: in some layouts intersection may not fire as expected — do a bounding rect check on scroll
    const onScrollFallback = () => {
      if (!node) return;
      const rect = node.getBoundingClientRect();
      // if the sentinel is within viewport plus a small bottom margin, trigger
      if (rect.top <= window.innerHeight + 200 && rect.bottom >= 0) {
        tryQueueNext();
      }
    };
    window.addEventListener("scroll", onScrollFallback, { passive: true });
    // also run once to catch the case where sentinel is already visible after render
    onScrollFallback();

    return () => {
      window.removeEventListener("scroll", onScrollFallback);
      if (io) io.disconnect();
    };
    // re-run observer when number of products changes or when hasMore toggles
  }, [hasMore, products.length]);

  const isInitialLoading = isLoading && products.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Your Products</h1>
              <p className="text-gray-600 mt-1">Manage and view all your listed products</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-blue-700 font-semibold text-sm">
                  {products?.length || 0} Products
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {isInitialLoading ? (
          <Loader />
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Products</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Yet</h3>
              <p className="text-gray-600 mb-6">You haven't listed any products yet. Start by adding your first product!</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Add Your First Product
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {products?.map((prod) => (
                <div key={prod._id} className="group">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300 group-hover:scale-105">
                    <div className="relative overflow-hidden">
                      <img
                        src={prod.images?.[0]}
                        alt={prod.title}
                        className="h-48 md:h-56 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      {prod.discountPercent > 0 && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                          {prod.discountPercent}% OFF
                        </div>
                      )}
                      <div
                        className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-semibold ${
                          prod.stock > 10
                            ? "bg-green-500 text-white"
                            : prod.stock > 0
                            ? "bg-yellow-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {prod.stock > 0 ? `${prod.stock} in stock` : "Out of stock"}
                      </div>
                    </div>

                    <div className="p-4 md:p-5">
                      <h2 className="text-sm md:text-base font-semibold text-gray-800 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
                        {prod.title}
                      </h2>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg md:text-xl font-bold text-gray-900">
                          ₹{prod.discountedPrice?.toLocaleString()}
                        </span>
                        {prod.price !== prod.discountedPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{prod.price?.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-600 pt-3 border-t border-gray-100">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                          </svg>
                          Stock: {prod.stock}
                        </span>
                        <Link to={`/product/${prod._id}`}>
                          <span className="text-blue-600 font-medium">View Details →</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* bottom loader (no extra space) */}
              {loadingMore && hasMore && (
                <LoadingProducts />
              )}

              {/* tiny sentinel (no visible gap) */}
              <div ref={sentinelRef} aria-hidden="true" className="col-span-full h-px w-full" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SellerProducts;
