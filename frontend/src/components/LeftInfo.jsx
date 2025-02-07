import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../config";

export const LeftInfo = ({ tourData }) => {
  const trek = tourData?.trek_data || {};
  const comments = tourData?.trek_comments || [];
  const images = trek.images?.map(img => img.url) || [];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [newReview, setNewReview] = useState({
    rating: 0,
    text: "",
    images: [],
  });

  // Carousel controls
  const nextImage = () => setCurrentImageIndex(prev => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const filePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });
    
    const base64Images = await Promise.all(filePromises);
    setNewReview(prev => ({
      ...prev,
      images: [...prev.images, ...base64Images]
    }));
  };

  const handleReviewSubmit = async () => {
    if (!newReview.rating || !newReview.text) {
      alert("Please provide a rating and review text");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/${trek.tour_id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          rating: newReview.rating,
          text: newReview.text,
          images: newReview.images
        })
      });

      if (!response.ok) throw new Error('Failed to submit review');
      
      // Refresh data
      const newComment = await response.json();
      setNewReview({ rating: 0, text: "", images: [] });
      window.location.reload(); // Simple refresh for demo
    } catch (error) {
      console.error(error);
      alert('Failed to submit review');
    }
  };

  return (
    <div>
      {/* Image Carousel */}
      {images.length > 0 && (
        <div className="relative">
          <img
            src={images[currentImageIndex]}
            alt={`Slide ${currentImageIndex + 1}`}
            className="rounded-lg shadow-md mb-4 w-full h-96 object-cover"
          />
          {images.length > 1 && (
          <>
            <button 
              onClick={prevImage} 
              className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={nextImage} 
              className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        </div>
      )}

      {/* Descriptions */}
      {trek.short_description && (
        <p className="text-gray-600 mb-4 font-semibold">{trek.short_description}</p>
      )}
      {trek.long_description && (
        <p className="text-gray-600 mb-4">{trek.long_description}</p>
      )}

{trek?.best_months?.length > 0 && (
  <div className="bg-gray-100 p-4 rounded-md shadow-sm mt-4">
    <h3 className="text-lg font-medium text-gray-800 mb-2">Best Months to Visit</h3>
    <div className="flex flex-wrap gap-2">
      {[
        'Jan', 'Feb', 'Mar', 'Apr',
        'May', 'Jun', 'Jul', 'Aug',
        'Sep', 'Oct', 'Nov', 'Dec'
      ].map(month => {
        // Convert best_months entries to consistent format
        const bestMonths = trek.best_months.map(m => 
          typeof m === 'number' 
            ? new Date(2000, m - 1).toLocaleString('default', { month: 'long' })
            : m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()
        );

        const isBestMonth = bestMonths.includes(month);

        return (
          <span
            key={month}
            className={`px-3 py-1 rounded-md text-sm ${
              isBestMonth 
                ? 'bg-green-200 text-green-800' 
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {month}
          </span>
        );
      })}
    </div>
  </div>
)}

      {/* Reviews Section */}
      <div className="mt-4 bg-gray-100 p-4 rounded-md shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800">Reviews</h2>
          <Link 
            to={`/comments/${trek.tour_id}`}
            className="text-blue-500 hover:underline"
          >
            See All ({comments.length})
          </Link>
        </div>
        {comments.slice(0, 2).map(comment => (
          <div key={comment.id} className="mb-4 p-2 border rounded-md bg-white shadow-sm">
            <p className="font-semibold text-gray-800">
              {comment.user?.firstName || comment.user?.userName || 'Anonymous'}
            </p>
            <div className="text-yellow-500">
              {"★".repeat(comment.comment.rating)}{"☆".repeat(5 - comment.comment.rating)}
            </div>
            <p className="text-gray-600 mt-1">{comment.comment.text}</p>
            {comment.comment.images?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {comment.comment.images.map((image, idx) => (
                  <img
                    key={idx}
                    src={image}
                    alt="Review attachment"
                    className="w-60 h-44 object-cover rounded-md"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Review Form */}
      <div className="mt-4 bg-gray-100 p-4 rounded-md shadow">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Write a Review</h3>
        <select
          value={newReview.rating}
          onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
          className="w-full p-2 border rounded-md"
        >
          <option value={0}>Select Rating</option>
          {[1, 2, 3, 4, 5].map(num => (
            <option key={num} value={num}>{num} Stars</option>
          ))}
        </select>
        <textarea
          value={newReview.text}
          onChange={(e) => setNewReview({...newReview, text: e.target.value})}
          placeholder="Share your experience..."
          className="w-full mt-2 p-2 border rounded-md h-32"
        />
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full mt-2"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {newReview.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-md"
            />
          ))}
        </div>
        <button
          onClick={handleReviewSubmit}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Submit Review
        </button>
      </div>
    </div>
  );
}