import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Dialog, IconButton } from '@mui/material';
import { CloudUpload, Close, Add, Visibility, Delete } from '@mui/icons-material';
import { addProductAction, editSellerProductAction, getSellerProductAction } from '../../actions/sellerAction';

function AddProduct() {
  const { productId } = useParams();
  const isEdit = Boolean(productId);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { sellerProduct: product } = useSelector(state => state.sellerProduct || {});
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    highlights: '',
    brand: '',
    category: 'Mobiles&Tablets',
    price: '',
    discountedPrice: '',
    stock: 1,
    images: [] // File[] only
  });

  const [imagePreview, setImagePreview] = useState([]); // includes both file and URL previews
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [isUploading] = useState(false);

  useEffect(() => {
    if (isEdit) dispatch(getSellerProductAction(productId));
  }, [productId, dispatch, isEdit]);

  useEffect(() => {
    if (isEdit && product) {
      setForm({
        title: product.title || '',
        description: product.description || '',
        highlights: product.highlights?.join(', ') || '',
        brand: product.brand || '',
        category: product.category || 'Mobiles&Tablets',
        price: product.price || '',
        discountedPrice: product.discountedPrice || '',
        stock: product.stock || 1,
        images: product.images || [] 
      });
      setImagePreview(product.images || []);
    }
  }, [product, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...previews]);
    setForm(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index) => {
    const updatedImages = [...form.images];
    updatedImages.splice(index, 1);

    const updatedPreview = [...imagePreview];
    updatedPreview.splice(index, 1);

    setForm(prev => ({ ...prev, images: updatedImages }));
    setImagePreview(updatedPreview);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("brand", form.brand);
    formData.append("category", form.category);
    formData.append("price", form.price);
    formData.append("discountedPrice", form.discountedPrice);
    formData.append("stock", form.stock);
    formData.append("highlights", JSON.stringify(form.highlights.split(',').map(h => h.trim())));

    form.images.forEach((img) => formData.append("images", img));
    try {
      const res = isEdit
        ? await dispatch(editSellerProductAction(productId, formData))
        : await dispatch(addProductAction(formData));

      if (res.success) {
        toast.success(isEdit ? "Product Updated!" : "Product Added!");
        navigate("/products");
      } else {
        toast.error(res.error || "Something went wrong");
      }
    } catch (err) {
      console.error("Error submitting product", err);
      toast.error("Failed to submit product.");
    }
  };


  const categories = [
    'Mobiles&Tablets', 'Fashion', 'Electronics', 'Home&Furniture', 
    'TVs&Appliances', 'Beauty,Food&More', 'Grocery', 'Others'
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 md:px-8 py-4 md:py-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">{isEdit ? "Edit Product" : "Add New Product"}</h1>
        <p className="text-blue-100 mt-2 text-sm md:text-base">{isEdit ? "Modify your existing product details" : "Create a new product listing for your store"}</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-6 md:space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-4 md:space-y-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Product Title *</label>
              <input 
                name="title" 
                value={form.title}
                onChange={handleChange} 
                placeholder="Enter product title" 
                className="w-full border border-gray-300 rounded-xl px-3 md:px-4 py-2 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
                required 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Brand</label>
              <input 
                name="brand" 
                value={form.brand}
                onChange={handleChange} 
                placeholder="Enter brand name" 
                className="w-full border border-gray-300 rounded-xl px-3 md:px-4 py-2 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea 
              name="description" 
              value={form.description}
              onChange={handleChange} 
              placeholder="Describe your product in detail" 
              rows="4"
              className="w-full border border-gray-300 rounded-xl px-3 md:px-4 py-2 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm md:text-base"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Highlights</label>
            <input 
              name="highlights" 
              value={form.highlights}
              onChange={handleChange} 
              placeholder="Key features (comma separated)" 
              className="w-full border border-gray-300 rounded-xl px-3 md:px-4 py-2 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
            />
            <p className="text-xs text-gray-500">Separate multiple highlights with commas</p>
          </div>
        </div>

        {/* Category and Pricing Section */}
        <div className="space-y-4 md:space-y-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
            Category & Pricing
          </h2>
          
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select 
                name="category" 
                value={form.category}
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-xl px-3 md:px-4 py-2 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Price *</label>
              <input 
                name="price" 
                type="number" 
                value={form.price}
                onChange={handleChange} 
                placeholder="0.00" 
                className="w-full border border-gray-300 rounded-xl px-3 md:px-4 py-2 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
                required 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Discounted Price</label>
              <input 
                name="discountedPrice" 
                type="number" 
                value={form.discountedPrice}
                onChange={handleChange} 
                placeholder="0.00" 
                className="w-full border border-gray-300 rounded-xl px-3 md:px-4 py-2 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Stock Quantity</label>
              <input 
                name="stock" 
                type="number" 
                value={form.stock}
                onChange={handleChange} 
                placeholder="1" 
                className="w-full border border-gray-300 rounded-xl px-3 md:px-4 py-2 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
              />
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="space-y-4 md:space-y-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
            Product Images
          </h2>
          
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 md:p-8 text-center hover:border-blue-400 transition-colors">
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="hidden" 
              id="image-upload" 
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="w-12 md:w-16 h-12 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <CloudUpload className="text-blue-600 text-xl md:text-2xl" />
              </div>
              <p className="text-base md:text-lg font-medium text-gray-700 mb-2">Upload Product Images</p>
              <p className="text-sm text-gray-500">
                Drag and drop images here, or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports: JPG, PNG, GIF (max 5MB each)
              </p>
            </label>
          </div>

          {/* Image Previews */}
          {imagePreview.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {imagePreview.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                    <img 
                      src={image} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Image Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setFullScreenImage(image)}
                        className="p-1.5 md:p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                      >
                        <Visibility className="text-gray-700 text-base md:text-lg" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-1.5 md:p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                      >
                        <Delete className="text-red-500 text-base md:text-lg" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <Close className="text-xs" />
                  </button>
                </div>
              ))}
              
              {/* Add More Images */}
              <label htmlFor="image-upload" className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                <div className="text-center">
                  <Add className="text-gray-400 text-2xl md:text-3xl mb-1 md:mb-2" />
                  <p className="text-xs md:text-sm text-gray-500">Add More</p>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button 
            type="submit" 
            disabled={isUploading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : (isEdit ? 'Update Product' : 'Add Product')}
          </button>
        </div>
      </form>

      {/* Full Screen Image Modal */}
      <Dialog
        open={Boolean(fullScreenImage)}
        onClose={() => setFullScreenImage(null)}
        maxWidth="md"
        PaperProps={{
          style: {
            maxWidth: '700px',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#1a1a1a',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
          }
        }}
        BackdropProps={{
          style: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
          }
        }}
      >
        <div className="relative bg-black p-4 flex items-center justify-center">
          <img
            src={fullScreenImage}
            alt="Preview"
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
          <IconButton
            onClick={() => setFullScreenImage(null)}
            style={{
              position: 'absolute',
              top: 15,
              right: 15,
              backgroundColor: 'rgba(0,0,0, 0.75)',
              color: 'white',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              zIndex : 10,
            }}
          >
            ✕
          </IconButton>
        </div>
      </Dialog>


    </div>
  );
}

export default AddProduct;