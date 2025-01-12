import React, { useState } from "react";
import { AppBar } from "../components/AppBar";
import Weather from "../assets/weather.jpg";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const days = Array.from({ length: firstDay }).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, index) => index + 1)
  );

  const previousMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const weatherEmojis = [
    "☀️", 
    "☁️", 
    "🌧️",
    "❄️", 
  ];

  const weatherReport = () => {
    const weather = weatherEmojis[Math.floor(Math.random() * weatherEmojis.length)];
    switch (weather) {
      case "☀️":
        return "It's going to be sunny this month! Perfect time for outdoor activities.";
      case "☁️":
        return "Expect some clouds. A mix of sun and shade, ideal for relaxed days.";
      case "🌧️":
        return "Rainy days ahead. Don't forget to carry an umbrella!";
      case "❄️":
        return "Cold and snowy weather this month. Great time for cozy indoors and winter sports.";
      default:
        return "The weather seems unpredictable. Prepare for anything!";
    }
  };

  return (
    <div><AppBar/>
    <div className="relative w-full h-full">
      <img
        src={Weather}
        alt="Weather Background"
        className="absolute top-0 left-0 w-full h-full z-0 object-cover opacity-70"
      />
      <div className="relative z-10 flex flex-col items-center min-h-screen py-4 top-10">
        <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="text-center py-2 bg-blue-100 text-blue-600 font-semibold text-lg">
            <h2>Plan your month according to the weather!</h2>
            <p>{weatherReport()}</p>
          </div>

          <div className="flex items-center justify-between bg-blue-600 text-white p-2">
            <button
              onClick={previousMonth}
              className="p-1 rounded-full hover:bg-blue-500"
            >
              &lt;
            </button>
            <div className="text-sm font-semibold">
              {new Date(year, month).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </div>
            <button
              onClick={nextMonth}
              className="p-1 rounded-full hover:bg-blue-500"
            >
              &gt;
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 p-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-600">
                {day}
              </div>
            ))}

            {days.map((day, index) => (
              <div
                key={index}
                className={`text-center py-2 rounded-full cursor-pointer ${
                  day ? "bg-gray-200 hover:bg-gray-300" : "bg-transparent"
                }`}
              >
                {day || ""}

                {day && (
                  <div className="flex justify-center items-center mt-1 text-lg">
                    <span>{weatherEmojis[index % weatherEmojis.length]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Calendar;
