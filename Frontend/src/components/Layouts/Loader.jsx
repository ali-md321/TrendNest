import React from 'react';

//Option 1: TrendNest Brand Loader 
const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="relative mb-8">
        <div className="w-20 h-20 border-4 border-transparent border-t-blue-500 border-r-indigo-500 rounded-full animate-spin"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse shadow-lg"></div>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-6 h-6 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L3.09 8.26L4 21H20L20.91 8.26L12 2ZM12 4.44L18.18 9H5.82L12 4.44ZM18 19H6L5.27 10H18.73L18 19Z"/>
          </svg>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          TrendNest
        </h2>
        <div className="flex items-center justify-center space-x-1">
          <span className="text-sm text-gray-600">Loading</span>
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};


// Alternative Loader Designs (uncomment to use):

/*
// Option 2: Shopping Bag Loader
const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100">
      <div className="relative">
        <div className="w-16 h-20 border-4 border-purple-200 rounded-b-lg animate-pulse">
          <div className="absolute -top-2 left-2 w-3 h-4 border-4 border-purple-500 border-b-transparent rounded-t-full"></div>
          <div className="absolute -top-2 right-2 w-3 h-4 border-4 border-purple-500 border-b-transparent rounded-t-full"></div>
          <div className="mt-4 space-y-2 px-2">
            <div className="h-2 bg-purple-300 rounded animate-pulse"></div>
            <div className="h-2 bg-purple-200 rounded animate-pulse" style={{animationDelay: '0.1s'}}></div>
            <div className="h-2 bg-purple-100 rounded animate-pulse" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <h2 className="text-xl font-bold text-purple-600 mb-2">TrendNest</h2>
        <p className="text-sm text-gray-600">Curating your style...</p>
      </div>
    </div>
  );
};
*/

/*
// Option 3: Nest/Home Loader
const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin">
          <div className="absolute inset-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-8 h-8 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        </div>
      </div>
      
      <div className="text-center">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-2">
          TrendNest
        </h2>
        <div className="flex items-center justify-center">
          <div className="w-6 h-1 bg-orange-300 rounded-full mr-2 animate-pulse"></div>
          <span className="text-sm text-gray-600">Building your perfect nest</span>
          <div className="w-6 h-1 bg-orange-300 rounded-full ml-2 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>
      </div>
    </div>
  );
};
*/

/*
// Option 4: Modern Minimal Loader
const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="relative">
        <div className="w-12 h-12 border-2 border-gray-200 rounded-full"></div>
        <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-indigo-500 border-r-indigo-400 rounded-full animate-spin"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
        </div>
      </div>
      
      <div className="mt-8">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );
};
*/


// Option 5: Trendy Wave Loader
// const Loader = () => {
//   return (
//     <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100">
//       <div className="relative mb-8">
//         <div className="flex space-x-2">
//           {[...Array(5)].map((_, i) => (
//             <div
//               key={i}
//               className="w-3 h-12 bg-gradient-to-t from-cyan-400 to-blue-500 rounded-full animate-pulse"
//               style={{
//                 animationDelay: `${i * 0.1}s`,
//                 animationDuration: '1s'
//               }}
//             ></div>
//           ))}
//         </div>
//       </div>
      
//       <div className="text-center">
//         <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
//           TrendNest
//         </h2>
//       </div>
//     </div>
//   );
// };


export default Loader;