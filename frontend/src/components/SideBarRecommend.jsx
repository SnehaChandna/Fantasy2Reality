import React from "react";
import { FiMoreHorizontal } from "react-icons/fi";

export const SideBarRecommend = ({ filters, setFilters, filterOptions }) => {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  // console.log("sideBarRecommed",filters)
  const handleClearFilters = () => {
    console.log("Clearing filters");
    setFilters({
      difficulties: [],
      routeTypes: [],
      minRating: 0,
      maxDuration: filterOptions?.maxDuration || 0,
      maxDistance: filterOptions?.maxDistance || 0,
      maxTimeToReach: filterOptions?.maxTimeToReach || 0,
    });
  };

  const renderFilters = () => (
    <>
      {/* Route Type Filter */}
      {filterOptions?.routeTypes?.length > 0 && (
        <div className="mb-4">
          <h3 className="font-medium text-lg mt-2 mb-2">Route Type</h3>
          {filterOptions.routeTypes.map(type => (
            <div key={type} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={filters.routeTypes.includes(type)}
                onChange={(e) => {
                  const newRouteTypes = e.target.checked
                    ? [...filters.routeTypes, type]
                    : filters.routeTypes.filter(t => t !== type);
                  setFilters(prev => ({...prev, routeTypes: newRouteTypes}));
                }}
              />
              <label className="ml-2 text-gray-700 capitalize">{type.replace(/-/g, ' ')}</label>
            </div>
          ))}
        </div>
      )}

      {/* Difficulty Filter */}
      {filterOptions?.difficulties?.length > 0 && (
        <div className="mb-4">
          <h3 className="font-medium text-lg mt-2 mb-2">Difficulty</h3>
          {filterOptions.difficulties.map(level => (
            <div key={level} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={filters.difficulties.includes(level)}
                onChange={(e) => {
                  const newDifficulties = e.target.checked
                    ? [...filters.difficulties, level]
                    : filters.difficulties.filter(d => d !== level);
                  setFilters(prev => ({...prev, difficulties: newDifficulties}));
                }}
              />
              <label className="ml-2 text-gray-700 capitalize">{level}</label>
            </div>
          ))}
        </div>
      )}

      {/* Numerical Filters */}
      {['Duration', 'Distance', 'TimeToReach'].map(filter => {
        const filterKey = `max${filter}`;
        const maxValue = filterOptions?.[filterKey] || 0;
        const currentValue = filters[filterKey];
        const unit = filter === 'Distance' ? 'km' : 'hours';

        return (
          <div key={filter} className="mb-4">
            <h3 className="font-medium text-lg mb-2">
              Max {filter.replace(/([A-Z])/g, " $1")} ({unit})
            </h3>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max={maxValue}
                value={currentValue}
                onChange={(e) => 
                  setFilters(prev => ({
                    ...prev,
                    [filterKey]: Number(e.target.value)
                  }))
                }
                className="w-full h-2 bg-gray-200 rounded-lg"
              />
              <span className="ml-3 text-gray-600 text-sm">
                {currentValue}
                {unit}
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
  return (
    <div className="w-full md:w-1/5 bg-gray-100 p-4 shadow-md">
      <div className="md:block">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Filters</h2>
          <button
            onClick={handleClearFilters}
            className="text-blue-600 text-sm underline"
          >
            Clear All
          </button>
        </div>
        <div className="hidden md:block">{renderFilters()}</div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center justify-between w-full py-2 px-4 bg-blue-500 text-white rounded-md"
        >
          <span>Filters</span>
          <FiMoreHorizontal />
        </button>
        {isFilterOpen && <div className="mt-2">{renderFilters()}</div>}
      </div>
    </div>
  );
};