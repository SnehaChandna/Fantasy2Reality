import React, { useState, useEffect } from "react";
import { AppBar } from "../components/AppBar";
import WeatherImage from "../assets/weather.jpg";
import axios from 'axios';
import { BACKEND_URL } from "../../config";

const weatherCodeMap = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mainly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Foggy', icon: '🌫️' },
  48: { label: 'Depositing rime fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌧️' },
  53: { label: 'Moderate drizzle', icon: '🌧️' },
  55: { label: 'Dense drizzle', icon: '🌧️' },
  61: { label: 'Slight rain', icon: '🌧️' },
  63: { label: 'Moderate rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  71: { label: 'Slight snow', icon: '🌨️' },
  73: { label: 'Moderate snow', icon: '🌨️' },
  75: { label: 'Heavy snow', icon: '🌨️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
};

const Calendar = () => {
  const [location, setLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user location
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/user/location`, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setLocation(response.data);
      } catch (err) {
        setError('Failed to fetch location');
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  // Fetch weather when location changes
  useEffect(() => {
    const fetchWeather = async () => {
      if (!location?.lat || !location?.lon) return;

      try {
        const response = await axios.get(
          `https://api.open-meteo.com/v1/forecast`,
          {
            params: {
              latitude: location.lat,
              longitude: location.lon,
              daily: 'weather_code,temperature_2m_max,temperature_2m_min',
              timezone: 'auto',
              forecast_days: 16
            }
          }
        );

        setWeatherData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch weather forecast');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  // Date generation remains the same
  const startDate = new Date();
  const generateDays = () => {
    return Array.from({ length: 16 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return date;
    });
  };

  // Helper to get day weather
  const getDailyWeather = (index) => {
    if (!weatherData || !weatherData.daily) return null;
    
    const code = weatherData.daily.weather_code[index];
    const maxTemp = Math.round(weatherData.daily.temperature_2m_max[index]);
    const minTemp = Math.round(weatherData.daily.temperature_2m_min[index]);
    
    return {
      ...(weatherCodeMap[code] || { label: 'Unknown', icon: '❓' }),
      maxTemp,
      minTemp
    };
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        Loading weather data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div>
      <AppBar />
      <div className="relative w-full min-h-screen">
        <img
          src={WeatherImage}
          alt="Weather Background"
          className="absolute top-0 left-0 w-full h-full object-cover opacity-40"
        />
        
        <div className="relative z-10 pt-12 px-4 pb-8">
          <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4">
            {/* Calendar Header - remains same */}
            <div className="mb-4 px-3 py-2 bg-[#232323] text-white rounded-lg text-center">
              <h2 className="text-lg font-semibold">
                {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                {new Date(startDate.getTime() + 15 * 86400000).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </h2>
              <p className="text-xs mt-1">16-day trek planning calendar</p>
            </div>

            {/* Updated Calendar Grid with real data */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {generateDays().map((date, index) => {
                const weather = getDailyWeather(index);
                
                return (
                  <div 
                    key={index}
                    className="p-3 bg-white border rounded-md hover:shadow-md transition-shadow text-center"
                  >
                    <div className="text-xs text-gray-600 font-medium mb-1">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-sm font-medium mb-2">
                      {date.toLocaleDateString('en-US', { day: 'numeric' })}
                      <span className="text-xs ml-1 text-gray-500">
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>
                    {weather && (
                      <>
                        <div className="text-3xl mb-1" title={weather.label}>
                          {weather.icon}
                        </div>
                        <div className="text-xs text-gray-500">
                          {weather.label}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {weather.maxTemp}°/{weather.minTemp}°
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
