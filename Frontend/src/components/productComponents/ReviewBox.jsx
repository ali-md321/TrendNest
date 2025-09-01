import React, { useState } from "react";
import { useSelector } from "react-redux";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { format, differenceInDays } from "date-fns";

const ReviewBox = ({ review, onEdit = null, onDelete = null }) => {
  const { user } = useSelector((state) => state.user);
  const isCurrentUser = review?.user?.email === user?.email;

  const [expandedImg, setExpandedImg] = useState(null);

  const getReviewDate = (createdAt) => {
    const daysAgo = differenceInDays(new Date(), new Date(createdAt));
    if (daysAgo <= 30) return `${daysAgo} days ago`;
    return format(new Date(createdAt), "dd/MM/yyyy");
  };

  return (
    <>
      {/* Review Card */}
      <div className="bg-white shadow-md p-4 rounded-md w-full max-w-[500px] mb-4 relative z-0">
        {/* Header */}
        <div className="flex items-start gap-2 mb-1">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 mt-1">
              <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                {review.rating}
                <StarIcon style={{ fontSize: 14 }} />
              </span>
              <span className="font-semibold text-sm text-[#212121]">{review.title}</span>
            </div>
            
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 mt-2">{review.description}</p>

        {/* Review Images */}
        {review.images?.length > 0 && (
          <div className="flex gap-2 mt-3">
            {review.images.map((img, idx) => (
              <div key={idx} className="text-center">
                <img
                  src={img}
                  alt={`review-img-${idx}`}
                  className="w-12 h-12 rounded-md object-cover cursor-pointer"
                  onClick={() => setExpandedImg(img)}
                />
              </div>
            ))}
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
          <div className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                <h2 className="text-md font-semibold text-black">{review.user?.name}</h2>
                <CheckCircleIcon fontSize="small" className="text-gray-400" />
                Certified Buyer • {getReviewDate(review.createdAt)}
            </div>
          {isCurrentUser && (
            <div className="flex gap-3 text-blue-600 items-center">
              <button onClick={() => onEdit(review)} className="flex items-center gap-1 hover:underline">
                <EditIcon fontSize="small" /> Edit
              </button>
              <button onClick={() => onDelete(review)} className="flex items-center gap-1 text-red-600 hover:underline">
                <DeleteIcon fontSize="small" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      {expandedImg && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={expandedImg}
              alt="Expanded"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-md"
            />
            <button
              className="absolute top-2 right-2 text-white text-2xl hover:text-red-400"
              onClick={() => setExpandedImg(null)}
            >
              <CloseIcon fontSize="large" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewBox;
