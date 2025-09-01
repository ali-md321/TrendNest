import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { deleteSellerProductAction, getSellerProductAction } from '../../actions/sellerAction';
import Loader from '../Layouts/Loader';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

export default function ShowSellerProduct() {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { sellerProduct: product, isLoading } = useSelector(state => state.sellerProduct || {});
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (productId) {
      dispatch(getSellerProductAction(productId));
    }
  }, [dispatch, productId]);

  const openImageDialog = (img) => {
    setSelectedImage(img);
    setImageDialogOpen(true);
  };

  const closeImageDialog = () => {
    setImageDialogOpen(false);
    setSelectedImage(null);
  };

  const handleEditProduct = () => {
    navigate(`/edit-product/${productId}`);
  };

  const handleDeleteProduct = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async() => {
    await dispatch(deleteSellerProductAction(productId));
    setDeleteDialogOpen(false);
    navigate("/products");
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  const nextImage = () => {
    if (product.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  if (isLoading) return <Loader />;
  if (!product) return <p>No Product Found</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Actions */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <nav className="text-sm text-gray-500">
            <span>Home</span> &gt; <span>{product.category}</span> &gt; <span className="text-gray-800">{product.title}</span>
          </nav>
          <div className="flex gap-3">
            <button
              onClick={handleEditProduct}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Edit Product
            </button>
            <button
              onClick={handleDeleteProduct}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Delete Product
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Main Product Section */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="grid md:grid-cols-2 gap-8 p-6">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="relative">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[currentImageIndex]}
                      alt={product.title}
                      className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => openImageDialog(product.images[currentImageIndex])}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image Available
                    </div>
                  )}
                </div>

                {/* Navigation arrows for multiple images */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Image dots indicator */}
              {product.images && product.images.length > 1 && (
                <div className="flex justify-center space-x-2">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'bg-blue-600' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Thumbnail images for desktop */}
              {product.images && product.images.length > 1 && (
                <div className="hidden md:flex space-x-2 overflow-x-auto">
                  {product.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${product.title} ${index + 1}`}
                      className={`w-16 h-16 object-cover rounded cursor-pointer border-2 transition-all ${
                        index === currentImageIndex 
                          ? 'border-blue-600' 
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      onClick={() => goToImage(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-medium text-gray-800 mb-2">{product.title}</h1>
                <p className="text-sm text-gray-600 mb-4">{product.brand}</p>
              </div>

              {/* Price Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-baseline space-x-3 mb-2">
                  <span className="text-3xl font-semibold text-gray-900">
                    ₹{product.discountedPrice?.toLocaleString()}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    ₹{product.price?.toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {product.discountPercent}% off
                  </span>
                </div>
                <p className="text-sm text-gray-600">inclusive of all taxes</p>
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                <span className={`inline-block w-3 h-3 rounded-full ${
                  product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                <span className={`font-medium ${
                  product.stock > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                </span>
              </div>

              {/* Category */}
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600">Category:</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {product.category}
                </span>
              </div>

              {/* Highlights */}
              {product.highlights && product.highlights.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Highlights</h3>
                  <ul className="space-y-2">
                    {product.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-medium text-gray-800">Ratings & Reviews</h2>
          </div>
          
          <div className="p-6">
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-6">
                {product.reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{review.user?.name || "Unknown User"}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="text-sm font-medium text-gray-600">{review.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-13">
                      <h4 className="font-medium text-gray-800 mb-2">{review.title}</h4>
                      <p className="text-gray-700 mb-3">{review.description}</p>

                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto">
                          {review.images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt={`Review image ${i + 1}`}
                              className="w-20 h-20 object-cover rounded-lg cursor-pointer border border-gray-200 hover:border-gray-400 transition-colors flex-shrink-0"
                              onClick={() => openImageDialog(img)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
                <p className="mt-1 text-sm text-gray-500">Be the first to review this product.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Zoom Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={closeImageDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ 
          style: { 
            borderRadius: '12px',
            maxHeight: '60vh'
          } 
        }}
      >
        <DialogContent className="p-4">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Zoomed view"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        PaperProps={{ style: { borderRadius: '12px' } }}
      >
        <DialogTitle className="text-lg font-medium">
          Confirm Product Deletion
        </DialogTitle>
        <DialogContent>
          <p className="text-gray-600">
            Are you sure you want to delete "{product.title}"? This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={cancelDelete} className="text-gray-600">
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained" 
            color="error"
            className="bg-red-600 hover:bg-red-700"
          >
            Delete Product
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

