import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CloseIcon from '@mui/icons-material/Close';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';

import {
  getOrderDetailsAction,
  addReviewRatingAction,
  editReviewRatingAction,
  getReviewRatingAction,
} from '../../actions/orderAction';

const AddReviewRating = () => {
  const { orderId, reviewId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const [product, setProduct] = useState(null);
  const [rating, setRating] = useState(3);
  const [hover, setHover] = useState(null);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [images, setImages] = useState([]);

  const isEditing = !!reviewId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user || !orderId) return;

        const orderRes = await dispatch(getOrderDetailsAction(orderId));
        const orderPayload = orderRes?.orderDetails;

        if (orderPayload?.productDetails?.product) {
          setProduct(orderPayload.productDetails.product);
        } else {
          toast.error("Product not found in order");
          navigate(-1);
        }

        if (isEditing) {
          const revRes = await dispatch(getReviewRatingAction(orderId, reviewId));
          const reviewPayload = revRes?.review;

          if (reviewPayload) {
            if (reviewPayload.user !== user?._id) {
              toast.error('Not authorized to edit this review');
              navigate(-1);
              return;
            }

            setRating(reviewPayload.rating);
            setTitle(reviewPayload.title || '');
            setDescription(reviewPayload.description || '');
            setImages(
              reviewPayload.images?.map((url) => ({ url, existing: true })) || []
            );
          } else {
            toast.error('Review not found');
            navigate(-1);
          }
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to fetch product or review");
      }
    };

    fetchData();
  }, [dispatch, orderId, reviewId, isEditing, user, navigate]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      existing: false,
    }));
    setImages((prev) => [...prev, ...previews]);
  };

  const handleImageRemove = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("rating", rating);
    formData.append("title", title);
    formData.append("description", description);

    images.forEach((img) => {
      if (img.existing && img.url) {
        formData.append("images", img.url); // send existing URL
      } else if (img.file) {
        formData.append("images", img.file); // send new file
      }
    });

    let res;
    if (isEditing) {
      res = await dispatch(editReviewRatingAction(orderId, reviewId, formData));
      res?.success ? toast.success('Review updated!') : toast.error(res?.message || 'Failed to update review');
    } else {
      res = await dispatch(addReviewRatingAction(orderId, formData));
      res?.success ? toast.success('Review added!') : toast.error(res?.message || 'Failed to add review');
    }

    if (res?.success) {
      navigate(-1);
    }
  };

  const getRatingLabel = () => {
    switch (rating) {
      case 5: return 'Excellent';
      case 4: return 'Very Good';
      case 3: return 'Good';
      case 2: return 'Bad';
      case 1: return 'Very Bad';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {product && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <img
                  src={product.images?.[0]}
                  alt={product.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-contain border rounded-lg shadow-sm"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 leading-tight">
                  {product.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{product.brand}</p>
                <div className="flex flex-col sm:flex-row sm:items-end gap-2 justify-center sm:justify-start">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">
                    ₹{product.discountedPrice}
                  </span>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="line-through text-gray-500 text-sm">
                      ₹{product.price}
                    </span>
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                      {product.discountPercent}% OFF
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
                {isEditing ? 'Edit your review' : 'Rate this product'}
              </h2>
            </div>

            {/* Rating Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Your Rating</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center justify-center sm:justify-start gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(null)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      {star <= (hover || rating) ? (
                        <StarIcon className="text-yellow-400 text-2xl sm:text-3xl drop-shadow-sm" />
                      ) : (
                        <StarBorderIcon className="text-yellow-400 text-2xl sm:text-3xl" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="text-center sm:text-left">
                  <span className="inline-block bg-green-100 text-green-800 font-semibold px-3 py-1 rounded-full text-sm">
                    {getRatingLabel()}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center sm:text-left">
                Your rating has been saved
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 h-32 resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Share your experience with this product..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Help others by describing your experience
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Review Title 
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Give your review a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Add Photos 
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="relative group"
                  >
                    <div className="w-20 h-20 border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      <img
                        src={img.url}
                        alt="uploaded"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 rounded-full p-1 text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleImageRemove(index)}
                    >
                      <CloseIcon style={{ fontSize: 14 }} />
                    </button>
                  </div>
                ))}

                <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors group">
                  <AddAPhotoIcon className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                  <span className="text-xs text-gray-500 mt-1 group-hover:text-orange-500">Add</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Add up to 5 photos to help others see your experience
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {isEditing ? 'UPDATE REVIEW' : 'SUBMIT REVIEW'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddReviewRating;