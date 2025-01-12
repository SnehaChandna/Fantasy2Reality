import A from "../assets/1.jpg";
import C from "../assets/3.jpg";
import D from "../assets/4.jpg";
import React, { useState } from "react";
import { Link } from "react-router-dom";

export const LeftInfo = () => {
  const images = [A, C, D];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviews, setReviews] = useState([
    {
      name: "Alice",
      rating: 4,
      text: "Amazing spot! Highly recommend it.",
      images: [], 
    },
    {
      name: "Bob",
      rating: 5,
      text: "Breathtaking views and very serene.",
      images: [C], 
    },
  ]);
  const [newReview, setNewReview] = useState({
    rating: 0,
    text: "",
    images: [],
  });

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileURLs = files.map((file) => URL.createObjectURL(file)); 
    setNewReview((prev) => ({
      ...prev,
      images: [...prev.images, ...fileURLs],
    }));
  };

  const handleReviewSubmit = () => {
    if (newReview.rating > 0 && newReview.text) {
      const newReviewData = {
        rating: newReview.rating,
        text: newReview.text,
        images: newReview.images, 
      };
      setReviews([...reviews, newReviewData]);
      setNewReview({ rating: 0, text: "", images: []});
    } else {
      alert("Please fill out all fields and provide a valid rating.");
    }
  };

  return (
    <div>
      {/* Carousel Section */}
      <div className="relative">
        <img
          src={images[currentImageIndex]}
          alt={`Slide ${currentImageIndex + 1}`}
          className="rounded-lg shadow-md mb-4 w-full h-96 object-cover"
        />
        {/* Next Button */}
        <button
          onClick={nextImage}
          className="absolute top-1/2 right-2 transform -translate-y-1/2 text-white rounded-full p-2 shadow-lg hover:scale-105 hover:shadow-xl transition duration-300 ease-in-out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10.293 14.707a1 1 0 010-1.414L13.586 10 10.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Previous Button */}
        <button
          onClick={prevImage}
          className="absolute top-1/2 left-2 transform -translate-y-1/2 text-white rounded-full p-2 shadow-lg hover:scale-105 hover:shadow-xl transition duration-300 ease-in-out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 111.414 1.414L6.414 10l3.293 3.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <p className="text-gray-600 mb-4">
        This serene pool in Wadi Arbeieen is a hidden gem, surrounded by rugged cliffs and lush greenery. The crystal-clear turquoise water is perfect for swimming and offers a refreshing escape from the desert heat. Its tranquil ambiance makes it an ideal spot for relaxation and connecting with nature. The area is a haven for photography enthusiasts, with breathtaking views of the surrounding landscape. Whether you’re an adventurer or a nature lover, this pool offers a unique experience that’s truly unforgettable.
      </p>

      <div className="bg-gray-100 p-4 rounded-md shadow-sm">
        <h2 className="text-lg font-medium text-gray-800">Recommendations & Essentials</h2>
        <p className="text-gray-600 mt-2">
          Make sure to carry enough water, sunscreen, and sturdy off-road shoes. A first-aid kit and snacks are highly recommended. Don't forget a waterproof bag for your electronics!
        </p>
      </div>

      <div className="bg-gray-100 p-4 rounded-md shadow-sm mt-2">
        <p className="text-gray-600 mt-2 font-semibold">Best months to visit:</p>
        <div className="mt-2">
          <span className="text-green-800 text-sm font-medium px-3 py-1 rounded-md mr-2">Jan</span>
          <span className="text-green-800 text-sm font-medium px-3 py-1 rounded-md mr-2">Feb</span>
          <span className="text-green-800 text-sm font-medium px-3 py-1 rounded-md mr-2">March</span>
          <span className="bg-green-200 text-green-800 text-sm font-medium px-3 py-1 rounded-md mr-2">April</span>
          <span className="bg-green-200 text-green-800 text-sm font-medium px-3 py-1 rounded-md mr-2">May</span>
          <span className="bg-green-200 text-green-800 text-sm font-medium px-3 py-1 rounded-md mr-2">June</span>
          <span className="bg-green-200 text-green-800 text-sm font-medium px-3 py-1 rounded-md mr-2">July</span>
          <span className="text-green-800 text-sm font-medium px-3 py-1 rounded-md mr-2">Aug</span>
          <span className="bg-green-200 text-green-800 text-sm font-medium px-3 py-1 rounded-md mr-2">Sept</span>
          <span className="bg-green-200 text-green-800 text-sm font-medium px-3 py-1 rounded-md mr-2">Oct</span>
          <span className="bg-green-200 text-green-800 text-sm font-medium px-3 py-1 rounded-md mr-2">Nov</span>
          <span className="bg-green-200 text-green-800 text-sm font-medium px-3 py-1 rounded-md mr-2">Dec</span>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-gray-100 p-4 rounded-md shadow-sm mt-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800">Ratings & Reviews</h2>
          <Link 
            to="/comments" 
            state={{ reviews }}  // Passing reviews to the Comments page
            className="text-blue-500 hover:underline"
          >
            See All
          </Link>
        </div>
        {reviews.map((review, index) => (
          <div key={index} className="mb-4 p-2 border rounded-md bg-white shadow-sm">
            <p className="font-semibold text-gray-800">{review.name}</p>
            <p className="text-yellow-500">
              {"★".repeat(review.rating)}{" "}
              {"☆".repeat(5 - review.rating)}
            </p>
            <p className="text-gray-600">{review.text}</p>
            {review.images.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {review.images.map((image, idx) => (
                  <img
                    key={idx}
                    src={image}
                    alt="Review Attachment"
                    className="w-60 h-44 max-w-xs rounded-md"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Review */}
      <div className="mt-4 bg-gray-100 p-4 rounded-md shadow">
        <h3 className="text-md font-medium text-gray-800">Write a Review</h3>
        <select
          value={newReview.rating}
          onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
          className="w-full mt-2 p-2 border rounded-md"
        >
          <option value="0">Select Rating</option>
          <option value="1">1 - Poor</option>
          <option value="2">2 - Fair</option>
          <option value="3">3 - Good</option>
          <option value="4">4 - Very Good</option>
          <option value="5">5 - Excellent</option>
        </select>
        <textarea
          placeholder="Write your review"
          value={newReview.text}
          onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
          className="w-full mt-2 p-2 border rounded-md"
        />
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="w-full mt-2 p-2 border rounded-md"
        />
        <button
          onClick={handleReviewSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2 hover:bg-blue-600">
          Submit Review
        </button>
      </div>
    </div>
  );
};
