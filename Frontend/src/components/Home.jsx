import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "./productComponents/ProductCard";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { getProductsAction } from "../actions/productAction";
import { Link } from "react-router-dom";
import LoadingProducts from "./Layouts/LoadingProducts";

const categories = [
  { name: "Minutes", icon: "🛵" },
  { name: "Mobiles&Tablets", icon: "📱" },
  { name: "Fashion", icon: "👗" },
  { name: "Electronics", icon: "💻" },
  { name: "Home&Furniture", icon: "🛋️" },
  { name: "TVs&Appliances", icon: "📺" },
  { name: "Beauty,Food&More", icon: "🧴" },
  { name: "Grocery", icon: "🛒" },
  { name: "Others", icon: "🛍️" },
];

const slides = [
  "/slideshow/slide1.png",
  "/slideshow/slide2.png",
  "/slideshow/slide3.png",
  "/slideshow/slide4.png",
  "/slideshow/slide5.png",
];
const slideIds = ["68abfce7f605057d7a606a89","68abfce6f605057d7a606a81","68abfce5f605057d7a606a7d","68abfce6f605057d7a606a85","68abfcc9ad718ca36097c9b8"]
const Home = () => {
  const dispatch = useDispatch();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const { products, hasMore } = useSelector((state) => state.products || {});
  const productList = Array.isArray(products) ? products : [];

  // Paging + loading control
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchedPages = useRef(new Set());      // tracks pages already fetched
  const inFlightRef = useRef(false);           // ensures only one fetch per scroll
  const hasUserScrolled = useRef(false);       // prevents auto-fetch if grid shorter than viewport

  useEffect(() => {
    const onFirstScroll = () => {
      hasUserScrolled.current = true;
      window.removeEventListener("scroll", onFirstScroll);
    };
    window.addEventListener("scroll", onFirstScroll, { passive: true });
    return () => window.removeEventListener("scroll", onFirstScroll);
  }, []);

  // Fetch whenever page changes; guard against duplicate fetches
  useEffect(() => {
    if (fetchedPages.current.has(page)) return; // StrictMode-safe
    fetchedPages.current.add(page);

    const run = async () => {
      await dispatch(getProductsAction(page));
      // When fetch completes, allow next intersection to schedule another page
      inFlightRef.current = false;
      setLoadingMore(false);
    };
    run();
  }, [dispatch, page]);

  // IntersectionObserver at the end of the products grid (not the page bottom)
  const sentinelRef = useRef(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;
        if (!hasUserScrolled.current) return;   // don’t auto-load on mount
        if (inFlightRef.current) return;        // already queued/in-flight
        if (!hasMore) return;                   // nothing more to load

        // Queue next page with Flipkart-style 2s loading delay
        inFlightRef.current = true;
        setLoadingMore(true);
        setTimeout(() => {
          setPage((prev) => prev + 1);
        }, 2000);
      },
      {
        root: null,         // viewport
        threshold: 1.0,     // trigger exactly at end of products area
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-128 h-128 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-2xl"></div>
      </div>

      {/* Categories Section - Ultra Enhanced */}
      <div className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 shadow-2xl rounded-b-3xl mx-2 sm:mx-4 mb-8 backdrop-blur-sm border border-white/50">
        <div className="absolute inset-0 overflow-hidden rounded-b-3xl">
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute top-4 right-8 w-6 h-6 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute bottom-4 left-12 w-4 h-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-25 animate-ping"></div>
          <div className="absolute bottom-8 right-16 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 relative">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
                ✨ Shop by Categories ✨
              </span>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            </h2>
            <p className="text-gray-600 font-medium">Discover amazing products in every category</p>
          </div>

          <div className="overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style jsx>{`
              div::-webkit-scrollbar { display: none; }
            `}</style>
            <div className="flex gap-4 sm:gap-6 w-fit min-w-full justify-start sm:justify-center px-4 pb-2">
              {categories.map((cat, index) => (
                <Link to={`/products/${cat.name}`} key={cat.name}>
                  <div
                    className="group relative flex flex-col items-center justify-center min-w-[90px] sm:min-w-[110px] p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-white/80 to-blue-50/50 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 border-2 border-white/50 hover:border-white/80 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 backdrop-blur-sm"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400/0 via-purple-400/0 to-pink-400/0 group-hover:from-blue-400/20 group-hover:via-purple-400/20 group-hover:to-pink-400/20 blur-xl transition-all duration-500"></div>
                    <div className="relative text-4xl sm:text-5xl mb-3 group-hover:scale-125 transition-all duration-500 transform group-hover:rotate-12 filter group-hover:drop-shadow-lg">
                      <span className="relative z-10">{cat.icon}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <span className="relative z-10 text-xs sm:text-sm text-center font-bold text-gray-700 group-hover:text-white transition-all duration-500 leading-tight px-1">
                      {cat.name}
                    </span>
                    <div className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
                    <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-700"></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slideshow Section - Enhanced */}
      <div className="px-2 sm:px-6 mb-8">
        <div className="relative w-full h-56 sm:h-80 lg:h-96 rounded-3xl overflow-hidden shadow-2xl group cursor-pointer">
          <Link to={`/product/${slideIds[slide]}`}>
            <img
              src={slides[slide]}
              alt="slide"
              className="w-full h-full object-cover transition-all duration-700 ease-in-out transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10"></div>
          </Link>

          {/* Left button */}
          <button
            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/10 backdrop-blur-xl text-white p-4 rounded-full hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-2xl border border-white/30 group-hover:bg-white/15 z-10"
            onClick={(e) => {
              e.preventDefault();
              setSlide((slide - 1 + slides.length) % slides.length);
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right button */}
          <button
            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/10 backdrop-blur-xl text-white p-4 rounded-full hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-2xl border border-white/30 group-hover:bg-white/15 z-10"
            onClick={(e) => {
              e.preventDefault();
              setSlide((slide + 1) % slides.length);
            }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  setSlide(index);
                }}
                className={`h-3 w-3 rounded-full cursor-pointer transition-all duration-300 backdrop-blur-sm border border-white/30 ${
                  slide === index
                    ? "bg-white scale-125 shadow-lg ring-2 ring-white/50"
                    : "bg-white/40 hover:bg-white/60 hover:scale-110"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Products Section - Enhanced Grid */}
      <div className="px-2 sm:px-6 pb-8 relative">
        <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-sm border border-white/50">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                  🔥 Best Deals
                </span>
              </h2>
              <div className="hidden sm:block w-20 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Fixed Product Grid - Responsive Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productList?.map((prod) => (
              <Link
                to={`/product/${prod._id}`}
                key={prod._id}
                className="block h-full transform hover:scale-105 transition-all duration-300 hover:shadow-2xl group"
              >
                <div className="h-full rounded-2xl overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 border-2 border-white/50 group-hover:border-blue-200 group-hover:shadow-2xl group-hover:from-blue-50/50 group-hover:to-purple-50/50 transition-all duration-300 backdrop-blur-sm">
                  <ProductCard product={prod} />
                </div>
              </Link>
            ))}

            {/* Loading indicator (Flipkart-style delay before next batch) */}
            {loadingMore && (
              <LoadingProducts />
            )}

            {/* Invisible sentinel that triggers the next page when it reaches view */}
            <div ref={sentinelRef} aria-hidden="true" className="h-px w-full col-span-full" />
          </div>

          {/* Enhanced Loading State for very first load when list is empty */}
          {productList.length === 0 && (
            <div className="text-center py-16">
              <div className="text-8xl mb-6 animate-bounce">🛍️</div>
              <div className="relative">
                <p className="text-gray-600 text-xl font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Loading amazing deals...
                </p>
                <div className="mt-4 flex justify-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
