import React from "react";
import A from "../assets/1.jpg";
import B from "../assets/2.jpg";
import C from "../assets/3.jpg";
import D from "../assets/4.jpg";
import { useNavigate } from "react-router-dom";

export const Grids = ({ filters }) => {
  const navigate = useNavigate();
  const tourData = [
    {
      id: 1,
      title: "Aadrai Jungle Trek - The Unexplored Jungle Trek",
      duration: "6 hours",
      rating: 4,
      difficulty: "easy",
      image: A,
    },
    {
      id: 2,
      title: "Kalsubai Trek | Highest Peak of Maharashtra",
      duration: "6 hours",
      rating: 4,
      difficulty: "hard",
      image: B,
    },
    {
      id: 3,
      title: "Rajmachi Trek | Scenic Beauty of Sahyadri",
      duration: "6 hours",
      rating: 4,
      difficulty: "medium",
      image: C,
    },
    {
      id: 4,
      title: "Visapur Fort Trek | Historic Adventure",
      duration: "6 hours",
      rating: 4,
      difficulty: "medium",
      image: D,
    },
    {
      id: 5,
      title: "Aadrai Jungle Trek - The Unexplored Jungle Trek",
      duration: "6 hours",
      rating: 4,
      difficulty: "easy",
      image: A,
    },
    {
      id: 6,
      title: "Aadrai Jungle - Jungle Trek",
      duration: "6 hours",
      rating: 4,
      difficulty: "easy",
      image: D,
    },
  ];

  const filteredTours = tourData.filter((tour) => {
    if (filters.difficulty && tour.difficulty !== filters.difficulty) {
      return false;
    }
    if (filters.minRating && tour.rating < filters.minRating) {
      return false;
    }
    return true;
  });

  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500"; 
      case "medium":
        return "bg-yellow-500";
      case "hard":
        return "bg-red-500"; 
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="w-4/5 p-3">
      <h2 className="text-lg font-semibold mb-4">
        Showing {filteredTours.length} trips
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTours.map((tour) => (
          <div onClick={() => navigate("/map")}
            key={tour.id}
            className="bg-white rounded-md shadow-md overflow-hidden relative">
                
            {/* Difficulty Tag (Slanted in opposite direction) */}
            <div className={`absolute top-2 left-2 transform px-4 py-1 text-white text-xs font-semibold rounded-full ${getDifficultyClass(tour.difficulty)}`}>
                {tour.difficulty}
            </div>

            <img
              src={tour.image}
              alt={tour.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-sm font-semibold mb-2">{tour.title}</h3>
              <p className="text-xs text-gray-600 mb-1">{tour.duration}</p>
            </div>

            <div className="absolute bottom-2 right-2 bg-black text-white text-xs font-semibold px-2 py-1 rounded">
              Rating: {tour.rating} ⭐
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
