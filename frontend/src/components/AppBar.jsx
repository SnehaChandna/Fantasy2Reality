import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AppBar = () => {
  const navigate = useNavigate();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (!isPopupOpen) {
      setLocation("");
    }
  }, [isPopupOpen]);

  const handleLocationSubmit = () => {
    if (location.trim()) {
      setIsPopupOpen(false);
    } else {
      alert("Please enter a valid location.");
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`Lat: ${latitude}, Lon: ${longitude}`);
        },
        (error) => {
          alert("Unable to retrieve your location. Please try again.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="shadow h-16 flex justify-between items-center bg-[#e5ecf4] px-4">
      <div className="flex items-center">
        <span
          className="text-[#060606] font-bold text-2xl italic cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          Fantasy2Reality
        </span>
      </div>

      <div className="flex items-center space-x-6 text-[#060606] font-semibold cursor-pointer">
        <span onClick={() => navigate("/recommendations")}>Recommendations</span>
        <span onClick={() => navigate("/draw")}>Fantasize</span>
        <span onClick={() => navigate("/quiz")}>Explore</span>
        {/* <span onClick={() => navigate("/calendar")}>Calendar</span> */}
      </div>

     
      <div className="flex items-center space-x-4">
        <div
          className="cursor-pointer flex items-center space-x-1"
          onClick={() => setIsPopupOpen(true)}
          aria-label="Open Location Popup"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-6 w-6 text-[#060606]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21.75c-4.97-4.28-8.25-7.17-8.25-11.25a8.25 8.25 0 1116.5 0c0 4.08-3.28 6.97-8.25 11.25z"
            />
            <circle cx="12" cy="10.5" r="2.25" />
          </svg>
          <span className="text-[#060606]">Location</span>
        </div>

        <div
          className="bg-blue-600 text-white font-semibold px-3 py-2 rounded-full cursor-pointer text-sm"
          onClick={() => navigate("/signup")}
        >
          Log In / Sign Up
        </div>
      </div>

      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Enter Your Location
            </h2>
            <label htmlFor="location" className="sr-only">
              Location
            </label>
            <input
              id="location"
              type="text"
              placeholder="Enter location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border rounded-md mb-4"
            />
            <button onClick={handleGetCurrentLocation}
              className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center space-x-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-6 w-6 text-[#060606]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21.75c-4.97-4.28-8.25-7.17-8.25-11.25a8.25 8.25 0 1116.5 0c0 4.08-3.28 6.97-8.25 11.25z"
                />
                <circle cx="12" cy="10.5" r="2.25" />
              </svg>
              <span>Get Current Location</span>
            </button>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsPopupOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleLocationSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
