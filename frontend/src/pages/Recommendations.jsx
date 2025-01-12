import React, { useState } from "react";
import { AppBar } from "../components/AppBar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiSearch } from "react-icons/fi";
import { SideBarRecommend } from "../components/SideBarRecommend";
import { Grids } from "../components/Grids";

export const Recommendations = () => {
  const [startDate, setStartDate] = useState(null);
  const [location, setLocation] = useState("");

  const [filters, setFilters] = useState({
      difficulty: "",
      minRating: 0,
      duration: "",
      trekType: "",
      distance: "",
      fitnessLevel: "",
      weather: "",
      activityType: "",
  });

  return (
    <div className="flex-col">
      <AppBar />
      <div className="flex flex-col items-center mt-4">
        <div className="w-full bg-white p-4 rounded-md shadow-md flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Search for location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 border border-gray-300 rounded-md p-2 outline-none"
          />
          <div className="flex flex-row items-center gap-2">
            <label>Date:</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              placeholderText="02/05/2025"
              className="border border-gray-300 rounded-md p-2 outline-none"
            />
          </div>
          <button
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            <FiSearch />
            Search
          </button>
        </div>
      </div>
      <div className="flex flex-row mt-4">
        <SideBarRecommend filters={filters} setFilters={setFilters} />
        <Grids filters={filters} />
      </div>
    </div>
  );
};
