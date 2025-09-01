
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function SellerReviews() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    axios.get('/api/seller/reviews', { withCredentials: true })
      .then(res => setReviews(res.data.reviews))
      .catch(err => console.error('Fetch reviews error', err));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Product Reviews</h2>
      <div className="space-y-4">
        {reviews.map(({ product, review }) => (
          <div key={review._id} className="p-4 bg-white rounded shadow">
            <h3 className="text-lg font-semibold">{product.title}</h3>
            <p className="text-sm text-gray-600">Rating: {review.rating} ★</p>
            <p className="mt-2">{review.comment}</p>
            <p className="text-xs text-gray-500 mt-1">By: {review.user?.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SellerReviews;