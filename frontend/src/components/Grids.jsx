import React, { useState, useEffect } from "react";
import { BACKEND_URL } from "../../config";
import { useNavigate } from "react-router-dom";

export const Grids = ({ filters, tours = [] }) => {
  const navigate = useNavigate();
  
  // Initialize currentPage from localStorage or default to 1
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("gridCurrentPage");
    return savedPage ? Math.max(1, parseInt(savedPage, 10)) : 1;
  });
  
  const [itemsPerPage] = useState(12);

  // Save current page to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("gridCurrentPage", currentPage.toString());
  }, [currentPage]);

  const filteredTours = React.useMemo(() => tours.filter((tour) => {
    // Filtering logic remains the same
    if (filters.routeTypes?.length && !filters.routeTypes.includes(tour.route_type)) return false;
    if (filters.difficulties?.length && !filters.difficulties.includes(tour.difficulty)) return false;

    const filtersToCheck = [
      { field: 'durationValue', max: filters.maxDuration * 60 },
      { field: 'distance', max: filters.maxDistance * 1000 },
      { field: 'TimeToReach', max: filters.maxTimeToReach * 3600 }
    ];

    return filtersToCheck.every(({ field, max }) => {
      if (!max) return true;
      const value = tour[field];
      return typeof value === 'number' && value <= max;
    });
  }), [tours, filters]);

  // Validate current page when filtered tours change
  useEffect(() => {
    const totalPages = Math.ceil(filteredTours.length / itemsPerPage);
    setCurrentPage(prev => {
      if (totalPages === 0) return 1;
      return Math.min(Math.max(prev, 1), totalPages);
    });
  }, [filteredTours, itemsPerPage]);

  // Only pagination clicks can change the page number
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Rest of the component remains the same
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTours.slice(indexOfFirstItem, indexOfLastItem);

  const getDifficultyClass = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "easy": return "bg-green-500";
      case "moderate": return "bg-yellow-500";
      case "difficult": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="w-full md:w-4/5 p-3">
      <h2 className="text-lg font-semibold mb-4">
        Showing {filteredTours.length} trips
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentItems.map((tour) => (
          <div
            key={tour.id}
            onClick={() => navigate(`/${tour.id}`)}
            className="bg-white rounded-md shadow-md overflow-hidden relative cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div
              className={`absolute top-2 left-2 transform px-4 py-1 text-white text-xs font-semibold rounded-full ${getDifficultyClass(
                tour.difficulty
              )}`}
            >
              {tour.difficulty}
            </div>

            <img
              src={tour.image}
              alt={tour.title}
              className="w-full h-48 object-cover"
              onError={(e) => { 
                e.target.onerror = null;
              }}
            />
            
            <div className="p-4">
              <h3 className="text-sm font-semibold mb-2">{tour.title}</h3>
              <p className="text-xs text-gray-600 mb-1">
                {tour.duration || "Duration not specified"}
              </p>
            </div>

            <div className="absolute bottom-2 right-2 bg-black text-white text-xs font-semibold px-2 py-1 rounded">
              Similarity: {tour.rating?.toFixed(2) || "N/A"}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-5">
        {Array.from({ length: Math.ceil(filteredTours.length / itemsPerPage) }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => paginate(i + 1)}
            className={`mx-1 px-3 py-1 rounded ${
              currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};