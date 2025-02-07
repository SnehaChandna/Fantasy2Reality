import { FaCaretUp } from "react-icons/fa";
import { CiClock2 } from "react-icons/ci";
import { FaCaretDown } from "react-icons/fa";
import { FaArrowsLeftRight } from "react-icons/fa6";
import { BsChevronBarUp } from "react-icons/bs";
import { Weather } from "./Weather";

export const RightInfo = ({ tourData,lat,lon}) => {
  const trek = tourData?.trek_data || {};
  const amenities = trek.amenities || {};
  const coverImage = trek.cover_image || {};

  const renderMeasurement = (value) => {
    if (!value) return null;
    if (typeof value === 'object') {
      return `${value.value} ${value.unit?.toLowerCase() === 'mtr' ? 'm' : value.unit}`.trim();
    }
    return value;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''}`.trim();
  };

  return (
    <div>
      {/* Map Image */}
      {trek.map_url && (
        <div className="rounded-md shadow-inner mb-4">
          <img
            src={trek.map_url}
            alt="Map Area"
            className="w-full h-full object-cover rounded-md"
          />
        </div>
      )}

      {/* Trail Information */}
      <div className="bg-gray-100 p-4 rounded-md shadow-sm">
        <h2 className="text-lg font-medium text-gray-800 mb-2">Trail Information</h2>
        <p className="text-gray-600 flex justify-between items-center">
          <strong>Difficulty:</strong> {trek.difficulty || 'Not specified'}
        </p>
        <p className="text-gray-600 flex justify-between items-center">
          <strong>Route Type:</strong> {trek.route_type}
        </p>
        
        {amenities.altitude_from && (
          <p className="text-gray-600 flex justify-between items-center">
            <strong>Starting Altitude:</strong> 
            <div className="flex flex-row items-center">
              {renderMeasurement(amenities.altitude_from)} <BsChevronBarUp className="ml-2 text-gray-600" />
            </div>
          </p>
        )}

        {amenities.altitude_to && (
          <p className="text-gray-600 flex justify-between items-center">
            <strong>Highest Altitude:</strong>
            <div className="flex flex-row items-center">
              {renderMeasurement(amenities.altitude_to)} <BsChevronBarUp className="ml-2 text-gray-600" />
            </div>
          </p>
        )}

        {amenities.elevation_ascent && (
          <p className="text-gray-600 flex justify-between items-center">
            <strong>Ascent:</strong> 
            <div className="flex flex-row items-center">
              {renderMeasurement(amenities.elevation_ascent)} <FaCaretUp className="ml-2 text-gray-600" />
            </div>
          </p>
        )}

        {amenities.elevation_descent && (
          <p className="text-gray-600 flex justify-between items-center">
            <strong>Descent:</strong> 
            <div className="flex flex-row items-center">
              {renderMeasurement(amenities.elevation_descent)} <FaCaretDown className="ml-2 text-gray-600" />
            </div>
          </p>
        )}

        {amenities.duration && (
          <p className="text-gray-600 flex justify-between items-center">
            <strong>Duration:</strong> 
            <div className="flex flex-row items-center">
              {formatDuration(amenities.duration.value)} <CiClock2 className="ml-2 text-gray-600" />
            </div>
          </p>
        )}
      </div>

      {/* Tags Section */}
      {trek.tags?.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-800">Tags</h3>
          <div className="flex flex-wrap mt-2 gap-2">
            {trek.tags.map(tag => (
              <span 
                key={tag}
                className="bg-blue-200 text-blue-800 text-sm font-medium px-2 py-1 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cover Image */}
      {/* Weather Section */}
      <Weather lat={lat} lon={lon}/>
    </div>
  );
}