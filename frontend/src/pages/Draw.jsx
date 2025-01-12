import React, { useEffect, useState, useCallback } from "react";
import usePaintCustomHooks from "../components/paintCustomHooks";
import SideToolBar from "../components/SideToolBar";
import { AppBar } from "../components/AppBar";
import image from "../assets/a.jpg";

export default function Draw() {
  const {
    canvasRef,
    startDrawing,
    stopDrawing,
    draw,
    handleColorChange,
    handleThicknessChange,
    handleToolChange,
    resetCanvas,
    setImageDataFromFile,
    captureCanvasImage,
  } = usePaintCustomHooks();

  const [text, setText] = useState("");
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  const drawPlaceholder = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");

    if (showPlaceholder) {
      ctx.fillStyle = "#999999";
      ctx.font = "bold 72px cursive";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Canvas", canvasRef.current.width / 2, canvasRef.current.height / 2);
    } else {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [showPlaceholder]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageDataFromFile(e.target.result);
        setShowPlaceholder(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCanvasMouseDown = (e) => {
    if (showPlaceholder) {
      setShowPlaceholder(false);
    }
    startDrawing(e);
  };

  const handleReset = () => {
    resetCanvas();
    setShowPlaceholder(true);
  };

  useEffect(() => {
    drawPlaceholder();
  }, [showPlaceholder, drawPlaceholder]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("mousedown", handleCanvasMouseDown);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);

    return () => {
      canvas.removeEventListener("mousedown", handleCanvasMouseDown);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseleave", stopDrawing);
    };
  }, [draw, stopDrawing]);

  return (
    <div className="flex-col">
      <AppBar />
      <div className="flex">
        <div className="w-1/5 p-4 bg-[#eff7fc] shadow-md rounded-lg flex flex-col">
          <div className="mb-4 mt-2 rounded-lg">
            {/* Custom File Upload */}
            <label
              htmlFor="file-upload"
              className="block cursor-pointer bg-gradient-to-r from-[#6495b4] to-[#afdafb] text-white text-center py-2 px-4 rounded-md w-full hover:opacity-90 transition"
            >
              Choose Image 
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <SideToolBar
            onColorChange={handleColorChange}
            onThicknessChange={handleThicknessChange}
            onToolChange={handleToolChange}
          />

          {/* Text Box */}
          <div className="mt-4 w-full flex flex-col flex-grow">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="border p-4 w-full h-32 resize-y rounded-lg shadow-md bg-[#f4f7fa] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6495b4] transition duration-300 ease-in-out"
              placeholder="Imagine & Write your fantasy..."
            />
          </div>

          <div className="mt-4 p-4 rounded-lg shadow-md text-center relative">
            {/* Background Image */}
            <img
              src={image} // Your imported image path here
              alt="Creative background"
              className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
            />
            {/* Overlay for better text visibility */}
            <div className="absolute top-0 left-0 w-full h-full bg-black opacity-40 rounded-lg"></div>

            {/* Text Content */}
            <div className="relative z-10">
              <h5 className="text-xl font-semibold text-white mb-3">Bring Your Imagination to Life</h5>
              <p className="text-white text-xs">
                Express your creativity—draw, write, or upload images. Get inspired with nearby trek recommendations based on your preferences. Let's turn your imagination into reality!
              </p>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="w-3/4 p-4 flex flex-col items-center justify-center">
          <canvas
            ref={canvasRef}
            className="mb-4"
            width="1000"
            height="550"
          />
          <div className="flex space-x-4 mt-3">
            <button
              onClick={handleReset}
              className="bg-gray-500 text-white p-2 rounded"
            >
              Reset
            </button>

            <button
              onClick={() => captureCanvasImage()}
              className="bg-[#6495b4] text-white p-2 rounded"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
