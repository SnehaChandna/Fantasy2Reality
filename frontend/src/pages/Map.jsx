import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppBar } from "../components/AppBar";
import { LeftInfo } from "../components/LeftInfo";
import { RightInfo } from "../components/RightInfo";
import { BACKEND_URL } from "../../config";

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="flex flex-col">
    <AppBar />
    <div className="p-4 border-b">
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
    </div>
    
    <div className="flex flex-col lg:flex-row flex-grow">
      {/* Left Section Skeleton */}
      <div className="lg:w-2/3 p-4 space-y-4">
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
        
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-md space-y-2">
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="flex flex-wrap gap-2">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded-md w-16 animate-pulse"></div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-md space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-2 bg-white rounded-md space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Section Skeleton */}
      <div className="lg:w-1/3 p-4 space-y-4">
        <div className="h-64 bg-gray-200 rounded-md animate-pulse"></div>
        
        <div className="bg-gray-100 p-4 rounded-md space-y-2">
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
          ))}
        </div>
        
        <div className="bg-gray-100 p-4 rounded-md space-y-2">
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="flex flex-wrap gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded-md w-20 animate-pulse"></div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-md space-y-2">
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="ml-4 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const Map = () => {
  const { tourId } = useParams();
  const [tourData, setTourData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTourData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/${tourId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        if (!response.ok) throw new Error("Tour not found");
        
        const data = await response.json();
        setTourData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTourData();
  }, [tourId]);

  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  const lat=tourData?.trek_data.latitude;
  const lon=tourData?.trek_data.longitude;

  return (
    <div>
      {loading ? (
        <SkeletonLoader />
      ) : (
        <div className="flex flex-col">
          <AppBar />
          {/* Title Section */}
          {tourData?.trek_data && (
            <div className="p-4 border-b">
              <h1 className="text-2xl font-semibold text-gray-800">
                {tourData.trek_data.title}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {tourData.trek_data.activity_type} · {tourData.trek_data.location}
              </p>
            </div>
          )}

          {/* Content Section */}
          <div className="flex flex-col lg:flex-row flex-grow">
            {/* Left Section */}
            <div className="lg:w-2/3 p-4 overflow-y-auto flex-grow h-screen scroll-hidden">
              <LeftInfo tourData={tourData}/>
            </div>

            {/* Right Section */}
            <div className="lg:w-1/3 p-4 flex-grow overflow-y-auto h-screen scroll-hidden">
              <RightInfo tourData={tourData} lat={lat} lon={lon}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};