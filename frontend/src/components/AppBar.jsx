import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { ClipLoader } from "react-spinners";


export const AppBar = () => {
  const navigate = useNavigate();
  const popupRef = useRef(null);
  const [isNavigating, setIsNavigating] = useState(false); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);
  const [userLocation, setUserLocation] = useState("");
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  // Add these refs at the top of your component
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (isPopupOpen && popupRef.current && !popupRef.current.contains(event.target)) {
      setIsPopupOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [isPopupOpen]);

  // Add this useEffect to trigger location fetch
useEffect(() => {
  if (isDropdownOpen && isAuthenticated) {
    const cachedLocation = localStorage.getItem("userLocation");
    if (cachedLocation) {
      setUserLocation(cachedLocation);
    } else {
      fetchLocation();
    }
  }
}, [isDropdownOpen, isAuthenticated]); // Add this useEffect

// Update the fetchLocation function to handle empty responses better
const fetchLocation = async () => {
  try {
    setIsLocationLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await axios.get(`${BACKEND_URL}/reverse-geocoding`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Handle different response structures
    if (response.data.error) {
      if (response.data.error === "Location not set") {
        setUserLocation("No preference provided");
      } else {
        throw new Error(response.data.error);
      }
    } else if (response.data.location) {
      setUserLocation(response.data.location);
      localStorage.setItem("userLocation", response.data.location);
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Error fetching location:", error);
    setUserLocation("Location not available");
    localStorage.removeItem("userLocation"); // Clear invalid cache
  } finally {
    setIsLocationLoading(false);
  }
};

useEffect(() => {
  const checkAuth = () => {
    const auth = !!localStorage.getItem("token");
    setIsAuthenticated(auth);
    if (!auth) {
      setUserDetails(null);
      localStorage.removeItem("userDetails");
    }
  };
  checkAuth();
  window.addEventListener('storage', checkAuth);
  return () => window.removeEventListener('storage', checkAuth);
}, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Check localStorage first
        const cachedUser = localStorage.getItem("userDetails");
        if (cachedUser) {
          setUserDetails(cachedUser);
          return;
        }

        const response = await axios.get(`${BACKEND_URL}/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.result) {
          const userData = response.data.result;
          setUserDetails(userData);
          localStorage.setItem("userDetails", userData);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    if (isAuthenticated) {
      fetchUserDetails();
    }
  }, [isAuthenticated]);

  // In AppBar component
  const handleNavigation = async (path) => {
    if (isAuthenticated) {
      try {
        const token = localStorage.getItem("token");
        
        if (path === "/recommendations" || path === "/draw" || path === "/calendar") {
          setIsNavigating(true);
          // Fetch initial recommendations
          const response = await axios.get(`${BACKEND_URL}/find?location=`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsNavigating(false); 
          navigate(path, { 
            state: { 
              recommendations: response.data.results,
              filterData: response.data.filters,
              location: "", // Pass the location you want here
              showSearchBar: true // Ensure this is passed if needed
            } 
          });
        } else {
          navigate(path);
          setIsNavigating(false); 
        }
      } catch (error) {
        console.error("Navigation error:", error);
        setIsNavigating(false); 
        alert("Enter Location for personalized results!!");
      }
    } else {
      setIsNavigating(false); 
      alert("You need to log in to access this feature!");
      navigate("/signin");
    }
  };


  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`);
        },
        (error) => {
          alert("Unable to retrieve your location. Please try again.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && 
          !dropdownRef.current?.contains(event.target) && 
          !avatarRef.current?.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && 
          !menuRef.current?.contains(event.target) && 
          !menuButtonRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLocationSubmit = async () => {
    if (!location.trim()) {
      alert("Please enter a valid location.");
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token");

      let payload = {};
      if (location.startsWith("Lat:")) {
        const [latPart, lonPart] = location.split(", Lon:");
        const lat = parseFloat(latPart.replace("Lat:", "").trim());
        const lon = parseFloat(lonPart.trim());
        
        if (isNaN(lat) || isNaN(lon)) {
          throw new Error("Invalid coordinate format please do not change the format");
        }

        payload = {
          location: {
            lat: lat,
            lng: lon
          }
        };
      } else {
        payload = { locationName: location.trim() };
      }
      
      const response = await axios.post(
        `${BACKEND_URL}/update-location`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Location update successful:", response.data);
      setIsPopupOpen(false);
      
      // Clear cached location
      localStorage.removeItem("userLocation");
      setUserLocation(""); // Reset to trigger fresh fetch
    } catch (error) {
      console.error("Location update error:", error);
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          "Failed to update location";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("userDetails");
      localStorage.removeItem("userLocation");
      navigate("/signin");
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Error details:", error.response?.data || error.message);
      alert("Error while logging out.");
    }
  };

  const getAvatarContent = () => {
    if (!userDetails) return "?";
    if (typeof userDetails === 'string') {
      const parts = userDetails.split(' ');
      return parts.length > 1 
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : userDetails.slice(0, 2).toUpperCase();
    }
    return "?";
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

      {isNavigating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100]">
          <ClipLoader color="#ffffff" size={35} />
          <span className="ml-2 text-white">Loading ...</span>
        </div>
      )}

      <div className="hidden lg:flex items-center space-x-6 text-[#060606] font-semibold cursor-pointer">
        <span onClick={() => handleNavigation("/recommendations")}>Recommendations</span>
        <span onClick={() => handleNavigation("/draw")}>Fantasize</span>
        <span onClick={() => handleNavigation("/quiz")}>Explore</span>
        <span onClick={() => handleNavigation("/calendar")}>Calendar</span>
      </div>

      <div className="lg:hidden flex items-center">
      <button
        ref={menuButtonRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle Menu"
        className="text-[#060606] font-semibold p-2"
      >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div ref={menuRef}className="lg:hidden absolute top-16 left-0 w-full text-[#060606] font-semibold bg-[#e5ecf4] z-50 shadow-md">
          <div className="flex flex-col items-center py-4 space-y-4">
            <span onClick={() => handleNavigation("/recommendations")}>Recommendations</span>
            <span onClick={() => handleNavigation("/draw")}>Fantasize</span>
            <span onClick={() => handleNavigation("/quiz")}>Explore</span>
            <span onClick={() => handleNavigation("/calendar")}>Calendar</span>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div
          className="cursor-pointer flex items-center space-x-1"
          onClick={() => {
            if (!isAuthenticated) {
              alert("You need to log in to access this feature!");
              navigate("/signin")
            } else {
              setIsPopupOpen(true);
            }
          }}
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
          <span className="text-[#060606] hidden sm:block">Location</span>
        </div>

        <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <div className="relative">
            <button
              ref={avatarRef}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-semibold cursor-pointer hover:bg-blue-700"
            >
              {getAvatarContent()}
            </button>

            {isDropdownOpen && (
                <div 
                  ref={dropdownRef}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-black z-60"
                  style={{ zIndex: 60 }}
                >
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b">
                      {typeof userDetails === 'string' ? userDetails : "Guest"}
                    </div>
                    
                    <div className="px-4 py-2 border-b">
                      {isLocationLoading ? (
                        <div className="text-sm text-gray-500">Loading location...</div>
                      ) : (
                        <div className="text-sm text-gray-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 inline-block mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              d="M12 21.75c-4.97-4.28-8.25-7.17-8.25-11.25a8.25 8.25 0 1116.5 0c0 4.08-3.28 6.97-8.25 11.25z"
                            />
                            <circle cx="12" cy="10.5" r="2.25" />
                          </svg>
                          {userLocation || "Location not available"}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={logout}
                      className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
          </div>
        ) :  (
            <div
              className={`${
                isSmallScreen
                  ? "bg-blue-600 text-white font-semibold px-3 py-2 text-xs rounded-full cursor-pointer"
                  : "bg-blue-600 text-white font-semibold px-3 py-2 rounded-full cursor-pointer text-sm"
              }`}
              onClick={() => navigate("/signin")}
            >
              {isSmallScreen ? "Log In" : "Log In / Sign Up"}
            </div>
          )}
        </div>
      </div>

      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div ref={popupRef} className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Enter Your Location for Tailored Trek Recommendations
            </h2>
            <input
              id="location"
              type="text"
              placeholder="Enter location or click button below"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border rounded-md mb-4"
            />
            <button
              onClick={handleGetCurrentLocation}
              className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center space-x-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21.75c-4.97-4.28-8.25-7.17-8.25-11.25a8.25 8.25 0 1116.5 0c0 4.08-3.28 6.97-8.25 11.25z"
                />
                <circle cx="12" cy="10.5" r="2.25" />
              </svg>
              <span>Use Current Location</span>
            </button>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsPopupOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleLocationSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};