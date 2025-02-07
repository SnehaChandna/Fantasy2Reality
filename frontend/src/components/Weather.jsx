import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Weather code mapping based on WMO codes
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

export const Weather = ({  lat={lat}, lon={lon}}) => {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!location) return;

      try {
        setLoading(true);

        const response = await axios.get(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`
        );

        setWeatherData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch weather data');
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [location]);

  if (loading) {
    return (
      <div className="mt-4 bg-gray-100 p-4 rounded-md shadow-sm">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Loading weather forecast...
        </h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 bg-gray-100 p-4 rounded-md shadow-sm">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Weather Forecast
        </h3>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!weatherData) return null;

  const getDayName = (index) => {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  return (
    <div className="mt-4 bg-gray-100 p-4 rounded-md shadow-sm">
      <h3 className="text-lg font-medium text-gray-800 mb-4">
        4-Day Weather Forecast of Trek
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, index) => {
          const dailyWeatherCode = weatherData.daily.weather_code[index];
          const weather = weatherCodeMap[dailyWeatherCode] || { label: 'Unknown', icon: '❓' };
          const maxTemp = Math.round(weatherData.daily.temperature_2m_max[index]);
          const minTemp = Math.round(weatherData.daily.temperature_2m_min[index]);

          return (
            <div key={index} className="flex items-center">
              <div className="text-2xl mr-4">{weather.icon}</div>
              <div>
                <p className="font-medium text-gray-800">{getDayName(index)}</p>
                <p className="text-sm text-gray-600">{maxTemp}°C / {minTemp}°C</p>
                <p className="text-xs text-gray-500">{weather.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};