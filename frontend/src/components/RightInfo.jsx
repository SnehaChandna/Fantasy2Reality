import map from "../assets/map.png";
import { FaCaretUp } from "react-icons/fa";
import { CiClock2 } from "react-icons/ci";
import { FaCaretDown } from "react-icons/fa";
import { FaArrowsLeftRight } from "react-icons/fa6";
import { BsChevronBarUp } from "react-icons/bs";
export const RightInfo=()=>{
    return <div>
                      {/* Map Image */}
                      <div className="rounded-md shadow-inner mb-4">
                        <img
                          src={map}
                          alt="Map Area"
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      {/* Difficulty Section */}
                      <div className="bg-gray-100 p-4 rounded-md shadow-sm">
                        <h2 className="text-lg font-medium text-gray-800 mb-2">
                            Trail Information
                        </h2>
                        <p className="text-gray-600 flex justify-between items-center">
                            <strong>Difficulty:</strong> Moderate
                        </p>
                        <p className="text-gray-600 flex justify-between items-center">
                            <strong>Distance:</strong> <div className="flex flex-row items-center"> 67.3 km <FaArrowsLeftRight className="ml-2 text-gray-600" /> </div>
                        </p>
                        <p className="text-gray-600 flex justify-between items-center">
                            <strong>Duration:</strong> <div className="flex flex-row items-center"> 4:00 h <CiClock2 className="ml-2 text-gray-600" /></div>
                        </p>
                        <p className="text-gray-600 flex justify-between items-center">
                            <strong>Ascent:</strong> <div className="flex flex-row items-center"> 1,219 m <FaCaretUp className="ml-2 text-gray-600" /></div>
                        </p>
                        <p className="text-gray-600 flex justify-between items-center">
                            <strong>Descent:</strong> <div className="flex flex-row items-center">1,249 m <FaCaretDown className="ml-2 text-gray-600" /></div>
                        </p>
                        <p className="text-gray-600 flex justify-between items-center">
                            <strong>Highest point:</strong><div className="flex flex-row items-center"> 274 m <BsChevronBarUp className="ml-2 text-gray-600" /> </div> 
                        </p>
                    </div>
        
                      {/* Tags Section */}
                      <div className="mt-4">
                        <h3 className="text-lg font-medium text-gray-800">Tags</h3>
                        <div className="flex flex-wrap mt-2">
                          <span className="bg-blue-200 text-blue-800 text-sm font-medium px-2 py-1 rounded-md mr-2">
                            Family Friendly
                          </span>
                          <span className="bg-blue-200 text-blue-800 text-sm font-medium px-2 py-1 rounded-md mr-2">
                            Dog Friendly
                          </span>
                          <span className="bg-blue-200 text-blue-800 text-sm font-medium px-2 py-1 rounded-md">
                            Adventure
                          </span>
                        </div>
                      </div>
        
                      {/* Weather Section */}
                      <div className="mt-4 bg-gray-100 p-4 rounded-md shadow-sm">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">
                            4-Day Weather Forecast
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Day 1 */}
                            <div className="flex items-center">
                            <img
                                src="https://img.icons8.com/ios-filled/50/000000/sun.png" // Replace with sunny icon
                                alt="Sunny"
                                className="w-8 h-8 mr-4"
                            />
                            <div>
                                <p className="font-medium text-gray-800">Today</p>
                                <p className="text-sm text-gray-600">21°C / 16°C</p>
                                <p className="text-xs text-gray-500">Sunny</p>
                            </div>
                            </div>
        
                            {/* Day 2 */}
                            <div className="flex items-center">
                            <img
                                src="https://img.icons8.com/ios-filled/50/000000/partly-cloudy-day.png" // Replace with partly cloudy icon
                                alt="Partly Cloudy"
                                className="w-8 h-8 mr-4"
                            />
                            <div>
                                <p className="font-medium text-gray-800">Tomorrow</p>
                                <p className="text-sm text-gray-600">22°C / 16°C</p>
                                <p className="text-xs text-gray-500">Partly Cloudy</p>
                            </div>
                            </div>
        
                            {/* Day 3 */}
                            <div className="flex items-center">
                            <img
                                src="https://img.icons8.com/ios-filled/50/000000/cloud.png" // Replace with cloudy icon
                                alt="Cloudy"
                                className="w-8 h-8 mr-4"
                            />
                            <div>
                                <p className="font-medium text-gray-800">Thursday</p>
                                <p className="text-sm text-gray-600">22°C / 17°C</p>
                                <p className="text-xs text-gray-500">Cloudy</p>
                            </div>
                            </div>
        
                            {/* Day 4 */}
                            <div className="flex items-center">
                            <img
                                src="https://img.icons8.com/ios-filled/50/000000/rain.png" // Replace with rainy icon
                                alt="Rainy"
                                className="w-8 h-8 mr-4"
                            />
                            <div>
                                <p className="font-medium text-gray-800">Friday</p>
                                <p className="text-sm text-gray-600">22°C / 18°C</p>
                                <p className="text-xs text-gray-500">Rainy</p>
                            </div>
                            </div>
                        </div>
                        </div>
        </div>
}