import React from "react";
import Eraser from "../assets/eraser.png";

export default function SideToolBar({
  onColorChange,
  onThicknessChange,
  onToolChange,
}) {
  return (
    <div className="flex flex-col p-6 border bg-white shadow-lg rounded-lg max-w-xs w-full space-y-6">
      <div>
        <label className="block mb-2 text-gray-800 font-semibold text-sm">Select Tool</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onToolChange("pen")}
            className="p-3 rounded-lg bg-[#5b9cf1] text-white hover:scale-105 transition duration-200 flex justify-center items-center"
          >
            <i className="fas fa-pen text-lg"></i> 🖌️
            Pen
          </button>
          <button
            onClick={() => onToolChange("eraser")}
            className="p-3 rounded-lg bg-[#ec5963] text-white hover:scale-105 transition duration-200 flex justify-center items-center"
          >
            <i className="fas fa-eraser text-lg"></i> <img src={Eraser} alt="Eraser Icon" className="w-5 h-5 mr-2"></img>
            Eraser
          </button>
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="w-1/2">
          <label className="block mb-2 text-gray-800 font-semibold text-sm">Color</label>
          <input
            type="color"
            onChange={onColorChange}
            className="w-15 h-12 border rounded-lg shadow-md hover:opacity-80 transition duration-300"
          />
        </div>

        <div className="w-full">
          <label className="block mb-2 text-gray-800 font-semibold text-sm">Thickness</label>
          <input
            type="range"
            min="1"
            max="10"
            onChange={onThicknessChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
