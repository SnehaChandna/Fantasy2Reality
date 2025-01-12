import React from "react";
import "react-datepicker/dist/react-datepicker.css";

export const SideBarRecommend = ({ filters, setFilters }) => {
  const handleClearFilters = () => {
    setFilters({
      difficulty: "",
      minRating: 0,
      duration: "",
      trekType: "",
      distance: "",
      fitnessLevel: "",
      weather: "",
      activityType: "",
    });
  };

  return (
    <div className="w-1/5 bg-gray-100 p-4 shadow-md">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Filters</h2>
            <button
                onClick={handleClearFilters}
                className="text-[#3d7cb3] text-sm underline">
                Clear All
            </button>
        </div>

      {/* Trek Difficulty */}
      <div className="mb-6">
        <h3 className="font-medium text-lg mb-2">Trek Difficulty</h3>
        {["Easy", "Medium", "Hard"].map((level) => (
          <div key={level} className="flex items-center mb-2">
            <input
              type="checkbox"
              value={level.toLowerCase()}
              onChange={(e) => {
                setFilters({ ...filters, difficulty: e.target.value });
              }}
              checked={filters.difficulty === level.toLowerCase()}
            />
            <label className="ml-2 text-gray-700">{level}</label>
          </div>
        ))}
      </div>

      {/* Minimum Rating */}
      <div className="mb-6">
        <h3 className="font-medium text-lg mb-2">Minimum Rating</h3>
        <div className="flex items-center">
          <span className="mr-3 text-gray-600 text-sm">{filters.minRating}★</span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={filters.minRating}
            onChange={(e) =>
              setFilters({ ...filters, minRating: Number(e.target.value) })
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Duration */}
      <div className="mb-6">
        <h3 className="font-medium text-lg mb-2">Duration</h3>
        {["1-3 hours", "4-6 hours", "Full day"].map((duration) => (
          <div key={duration} className="flex items-center mb-2">
            <input
              type="checkbox"
              value={duration.toLowerCase()}
              onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
              checked={filters.duration === duration.toLowerCase()}
            />
            <label className="ml-2 text-gray-700">{duration}</label>
          </div>
        ))}
      </div>

      {/* Type of Trek */}
      <div className="mb-6">
        <h3 className="font-medium text-lg mb-2">Type of Trek</h3>
        {["Nature", "Fort", "Mountain", "Waterfall", "Wildlife"].map((trekType) => (
          <div key={trekType} className="flex items-center mb-2">
            <input
              type="checkbox"
              value={trekType.toLowerCase()}
              onChange={(e) => setFilters({ ...filters, trekType: e.target.value })}
              checked={filters.trekType === trekType.toLowerCase()}
            />
            <label className="ml-2 text-gray-700">{trekType}</label>
          </div>
        ))}
      </div>

      {/* Distance */}
      <div className="mb-6">
        <h3 className="font-medium text-lg mb-2">Distance</h3>
        {["5-10 km", "10-20 km", "20+ km"].map((distance) => (
          <div key={distance} className="flex items-center mb-2">
            <input
              type="checkbox"
              value={distance.toLowerCase()}
              onChange={(e) => setFilters({ ...filters, distance: e.target.value })}
              checked={filters.distance === distance.toLowerCase()}
            />
            <label className="ml-2 text-gray-700">{distance}</label>
          </div>
        ))}
      </div>

      {/* Fitness Level */}
      <div className="mb-6">
        <h3 className="font-medium text-lg mb-2">Fitness Level</h3>
        {["Beginner", "Intermediate", "Advanced"].map((level) => (
          <div key={level} className="flex items-center mb-2">
            <input
              type="checkbox"
              value={level.toLowerCase()}
              onChange={(e) =>
                setFilters({ ...filters, fitnessLevel: e.target.value })
              }
              checked={filters.fitnessLevel === level.toLowerCase()}
            />
            <label className="ml-2 text-gray-700">{level}</label>
          </div>
        ))}
      </div>

      {/* Preferred Weather */}
      <div className="mb-6">
        <h3 className="font-medium text-lg mb-2">Preferred Weather</h3>
        {["Cool", "Hot", "Humid", "Cold"].map((weather) => (
          <div key={weather} className="flex items-center mb-2">
            <input
              type="checkbox"
              value={weather.toLowerCase()}
              onChange={(e) => setFilters({ ...filters, weather: e.target.value })}
              checked={filters.weather === weather.toLowerCase()}
            />
            <label className="ml-2 text-gray-700">{weather}</label>
          </div>
        ))}
      </div>

      {/* Activity Type */}
      <div className="mb-6">
        <h3 className="font-medium text-lg mb-2">Activity Type</h3>
        {["Trekking", "Hiking", "Camping", "Rock Climbing", "Water Sports"].map(
          (activity) => (
            <div key={activity} className="flex items-center mb-2">
              <input
                type="checkbox"
                value={activity.toLowerCase()}
                onChange={(e) => setFilters({ ...filters, activityType: e.target.value })}
                checked={filters.activityType === activity.toLowerCase()}
              />
              <label className="ml-2 text-gray-700">{activity}</label>
            </div>
          )
        )}
      </div>
    </div>
  );
};
