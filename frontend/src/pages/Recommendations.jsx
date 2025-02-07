import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AppBar } from "../components/AppBar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiSearch } from "react-icons/fi";
import { SideBarRecommend } from "../components/SideBarRecommend";
import { Grids } from "../components/Grids";
import { useLocation, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../config";
import { ClipLoader } from "react-spinners";
import axios from "axios";

const SkeletonLoader = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full animate-pulse p-2">
    {[...Array(6)].map((_, i) => (
      <div 
        key={i} 
        className="bg-gray-100 rounded-lg overflow-hidden shadow-sm h-[280px]"
      >
        <div className="bg-gray-300 h-40 w-full"></div>
        <div className="p-3 space-y-2">
          <div className="bg-gray-300 h-4 rounded w-3/4"></div>
          <div className="bg-gray-300 h-4 rounded w-1/2"></div>
          <div className="bg-gray-300 h-4 rounded w-1/3"></div>
        </div>
      </div>
    ))}
  </div>
);

export const Recommendations = () => {
  const [startDate, setStartDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationInput, setLocationInput] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const locations = useLocation();
  const navigate = useNavigate();
  const showSearchBar = locations.state?.showSearchBar ?? true;

  // Initialize state directly from location if available
  const initialData = locations.state || {};
  const [recommendations, setRecommendations] = useState(initialData.recommendations || []);
  const [filterData, setFilterData] = useState({
    difficulties: initialData.filterData?.difficulties || [],
    routeTypes: initialData.filterData?.routeTypes || [],
    maxDuration: initialData.filterData?.maxDuration || 0,
    maxDistance: initialData.filterData?.maxDistance || 0,
    maxTimeToReach: initialData.filterData?.maxTimeToReach || 0,
  });

  // Initialize filters directly from filterData
  const [filters, setFilters] = useState(filterData);

  const fetchRecommendations = useCallback(async (location = "") => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BACKEND_URL}/find`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { location }
      });

      setRecommendations(response.data.results);
      setFilterData(prev => ({
        ...prev,
        difficulties: response.data.filters.difficulties || [],
        routeTypes: response.data.filters.routeTypes || [],
        maxDuration: response.data.filters.maxDuration || 0,
        maxDistance: response.data.filters.maxDistance || 0,
        maxTimeToReach: response.data.filters.maxTimeToReach || 0,
      }));
    } catch (error) {
      console.error("Failed to load recommendations:", error);
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Initial fetch only if no initial data
  useEffect(() => {
    if (!initialData.recommendations || !initialData.filterData) {
      const initialLocation = locations.state?.location || "";
      fetchRecommendations(initialLocation);
    } else {
      setIsLoading(false);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleSearch = useCallback(async () => {
    try {
      setLocalLoading(true);
      await fetchRecommendations(locationInput);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLocalLoading(false);
    }
  }, [fetchRecommendations, locationInput]);

  // Memoize filter options
  const memoizedFilterOptions = useMemo(() => filterData, [filterData]);

  // Memoize main content to prevent unnecessary re-renders
  const mainContent = useMemo(() => (
    isLoading ? <SkeletonLoader /> : <Grids filters={filters} tours={recommendations} />
  ), [isLoading, filters, recommendations]);

  return (
    <div className="flex flex-col min-h-screen">
      <AppBar />
      {showSearchBar && (
        <div className="flex flex-col items-center mt-4 px-4">
          <div className="w-full bg-white p-4 rounded-md shadow-md flex flex-col md:flex-row gap-4 items-center md:items-start">
            <input
              type="text"
              placeholder="Search for location..."
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md p-2 outline-none"
            />
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <label className="text-gray-700">Date:</label>
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                placeholderText="02/05/2025"
                className="border border-gray-300 rounded-md p-2 outline-none"
              />
            </div>
            <button
              className={`flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 ${
                localLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
              onClick={handleSearch}
              disabled={localLoading}
            >
              {localLoading ? (
                <ClipLoader color="#ffffff" size={20} />
              ) : (
                <>
                  <FiSearch />
                  Search
                </>
              )}
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row mt-4 w-full px-4">
        <SideBarRecommend
          key="sidebar"
          filters={filters}
          setFilters={setFilters}
          filterOptions={memoizedFilterOptions}
        />
        {mainContent}
      </div>
    </div>
  );
};