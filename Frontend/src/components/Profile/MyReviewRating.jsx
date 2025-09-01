import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Edit, Delete, Close } from '@mui/icons-material';
import StarIcon from '@mui/icons-material/Star';
import { deleteReviewRatingAction, getAllOrdersAction, getAllReviewsActon } from '../../actions/orderAction';
import { useNavigate } from 'react-router-dom';
import Loader from '../Layouts/Loader';

const MyReviewRating = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const { isLoading } = useSelector((state) => state.user.user);
  const [fullImage, setFullImage] = useState(null);
  const [reviewRatings, setReviewRatings] = useState([]);
  useEffect(() => {
    const fetch = async () => {
      const res = await dispatch(getAllOrdersAction());
      setOrders(res.orders || []);
      const {reviews} =await dispatch(getAllReviewsActon());
      setReviewRatings(reviews); 
    };
    fetch();
  }, [dispatch]);

  const handleEdit = (orderId, reviewId) => {
    navigate(`/order/${orderId}/review/${reviewId}`);
  };

  const handleDelete = async (orderId, reviewId) => {
    setReviewRatings(prev => {
      return prev.filter(r => r._id != reviewId);
    })
    await dispatch(deleteReviewRatingAction(orderId, reviewId));
  };

  const handleImageClick = (url) => {
    setFullImage(url);
  };

  const handleCloseImage = () => {
    setFullImage(null);
  };

  const reviewedProductIds = reviewRatings.map((r) => r.product?._id);
  const pendingOrders = orders?.filter(
    (order) => {
      const productId = order?.productDetails?.product?._id;
      return productId && !reviewedProductIds.includes(productId) && ["Delivered","ReturnRequest", "ReturnAccepted", "ReturnPickedUp", "Refunded"].includes(order.orderStatus);
    }
  );

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              My Reviews & Ratings
            </h2>
            <div className="flex items-center space-x-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                {reviewRatings.length} Reviews
              </span>
              {pendingOrders?.length > 0 && (
                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                  {pendingOrders.length} Pending
                </span>
              )}
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <StarIcon className="text-white text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      {fullImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="relative max-w-4xl w-full">
            <img 
              src={fullImage} 
              alt="full" 
              className="max-h-[85vh] max-w-full rounded-lg shadow-2xl mx-auto object-contain" 
            />
            <button
              onClick={handleCloseImage}
              className="absolute -top-4 -right-4 bg-white hover:bg-gray-100 rounded-full p-2 shadow-lg transition-colors duration-200"
            >
              <Close className="text-gray-700" />
            </button>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      {reviewRatings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <StarIcon className="text-gray-400 text-3xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No reviews yet!</h3>
          <p className="text-gray-600">Rate and share your experience with your orders</p>
          <div className="mt-6">
            <button 
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-medium"
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            >
              View Pending Reviews
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {reviewRatings.map((review, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-6">
                {/* Product Image */}
                <div className="w-full sm:w-24 h-32 sm:h-24 flex-shrink-0">
                  <img
                    src={review.product?.images?.[0] || '/placeholder.png'}
                    alt="product"
                    className="w-full h-full object-contain rounded-lg bg-gray-50"
                  />
                </div>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  <div className="mb-3">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 line-clamp-2">
                      {review.product?.title || 'Untitled Product'}
                    </h3>
                    
                    {/* Rating and Title */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                        {review.rating} 
                        <StarIcon style={{ fontSize: '16px' }} />
                      </div>
                      <span className="text-sm font-medium text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">
                        {review.title}
                      </span>
                    </div>
                  </div>

                  {/* Review Description */}
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                    {review.description}
                  </p>

                  {/* Review Images */}
                  {review.images?.length > 0 && (
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {review.images.map((img, i) => (
                        <div key={i} className="relative">
                          <img
                            src={img}
                            alt={`review-${i}`}
                            className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg cursor-pointer border-2 border-gray-200 hover:border-blue-300 transition-colors duration-200"
                            onClick={() => handleImageClick(img)}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Review Meta */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-xs text-gray-500 flex items-center space-x-2">
                      <span className="font-medium">{review.reviewerName}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{new Date(review.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                        onClick={() => handleEdit(review.order, review._id)}
                      >
                        <Edit fontSize="small" /> Edit
                      </button>
                      <button
                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors duration-200"
                        onClick={() => handleDelete(review.order, review._id)}
                      >
                        <Delete fontSize="small" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending Reviews Section */}
      {pendingOrders?.length > 0 && (
        <div className="mt-8 sm:mt-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                Pending Reviews ({pendingOrders.length})
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingOrders.map((order, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
                      <img
                        src={order?.productDetails?.product?.images?.[0] || '/placeholder.png'}
                        alt={order?.productDetails?.product?.title || 'Product'}
                        className="w-full h-full object-contain border border-gray-200 rounded-lg bg-white"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-800 mb-1 line-clamp-2">
                        {order?.productDetails?.product?.title || 'Untitled Product'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Ordered on {new Date(order.orderedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                    onClick={() => navigate(`/order/${order._id}/review`)}
                  >
                    Add Review & Rating
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReviewRating;