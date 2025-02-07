import React from "react";
import Eraser from "../assets/eraser.png";
import Fill from "../assets/fills.png"
import drawing from "../assets/draw.png"

export default function SideToolBar({
  onColorChange,
  onThicknessChange,
  onToolChange,
}) {
  return (
    <div className="flex flex-col p-6 border bg-white shadow-lg rounded-lg w-full space-y-6">
      <div>
        <label className="block mb-2 text-gray-800 font-semibold text-sm">Select Tool</label>
        <div className="grid grid-cols-3 gap-5">
          <button
            onClick={() => onToolChange("pen")}
            className="p-2 rounded-lg  text-white hover:bg-[#cddafe] hover:scale-105 transition duration-200 flex justify-center items-center"
          >
            <i className="fas fa-pen text-lg"></i> <img src={drawing} alt="Pen Icon" className="w-7 h-7 mr-2"></img>
          </button>
          <button
            onClick={() => onToolChange("eraser")}
            className="p-2 rounded-lg hover:bg-[#cddafe] text-white hover:scale-105 transition duration-200 flex justify-center items-center"
          >
            <i className="fas fa-eraser text-lg"></i> <img src={Eraser} alt="Eraser Icon" className="w-7 h-7 mr-2"></img>
          </button>
          <button
            onClick={() => onToolChange("bucket")}
            className="p-2 rounded-lg hover:bg-[#cddafe] text-white hover:scale-105 transition duration-200 flex justify-center items-center"
          >
            <i className="fas fa-bucket text-lg"></i> <img src={Fill} alt="Fill Icon" className="w-8 h-8 mr-2"></img>
          </button>
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="w-1/2">
          <label className="block mb-2 text-gray-800 font-semibold text-sm">Color</label>
          <input
            type="color"
            onChange={onColorChange}
            className="appearance-none w-10 h-10 hover:opacity-80 transition duration-300"
          />
        </div>

        <div className="w-full">
          <label className="block mb-2 text-gray-800 font-semibold text-sm">Thickness</label>
          <input
            type="range"
            min="1"
            max="10"
            onChange={onThicknessChange}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}