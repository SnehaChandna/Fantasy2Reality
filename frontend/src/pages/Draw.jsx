import React, { useEffect, useState, useCallback } from "react";
import usePaintCustomHooks from "../components/paintCustomHooks";
import SideToolBar from "../components/SideToolBar";
import { AppBar } from "../components/AppBar";
import image from "../assets/a.jpg";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";

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

  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [undoStack, setUndoStack] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const MAX_UNDO_STEPS = 50;
  const [isDrawing, setIsDrawing] = useState(false); // Add drawing state tracker
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveStateToStack = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const imageData = canvas.toDataURL();
    setUndoStack(prev => {
      const newStack = [...prev.slice(0, currentIndex + 1), imageData];
      return newStack.slice(-MAX_UNDO_STEPS); // Keep only last N steps
    });
    setCurrentIndex(prev => Math.min(prev + 1, MAX_UNDO_STEPS - 1));
  }, [currentIndex]);

  const handleUndo = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      restoreState(undoStack[newIndex]);
    } else if (currentIndex === 0) {
      resetToWhite();
    }
  };

  const drawPlaceholder = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (showPlaceholder) {
      ctx.fillStyle = "#999999";
      const fontSize = canvasRef.current.width < 400 ? 24 : canvasRef.current.width < 500 ? 36 : 72;
      ctx.font = `bold ${fontSize}px cursive`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Canvas", canvasRef.current.width / 2, canvasRef.current.height / 2);
    }
  }, [showPlaceholder]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const canvasContainer = document.querySelector(".flex-1");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const containerWidth = canvasContainer.offsetWidth;
      const width = containerWidth * 0.95;
      const height = width * 0.55;
      
      canvas.width = width;
      canvas.height = height;
      ctx.putImageData(imageData, 0, 0);
      
      if (showPlaceholder) drawPlaceholder();
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [drawPlaceholder]);


  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token");
  
      // Get canvas data
      const sketchData = captureCanvasImage() || null;
      console.log("sketch",sketchData)
      // Prepare payload
      const payload = {};
      if (sketchData) payload.sketch = sketchData.split(',')[1]; // Remove data URL prefix
      if (text.trim()) payload.caption = text.trim();
      console.log(payload.caption)
  
      // Call backend
      const response = await axios.post(
        `${BACKEND_URL}/sketch`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data)
      navigate('/recommendations', { 
        state: { 
          recommendations: response.data.results,
          filterData: response.data.filters,
          showSearchBar: false  // Add this flag
        } 
      });
  
    } catch (error) {
      setIsSubmitting(false);
      console.error("Submission error:", error);
      alert("Failed to submit sketch. Please try again.");
    } finally {
      setIsSubmitting(false); // End loading
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const handleTouchStart = (e) => {
      e.preventDefault(); // Prevent scrolling
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      canvas.dispatchEvent(mouseEvent);
    };
  
    const handleTouchMove = (e) => {
      e.preventDefault(); // Prevent scrolling
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      canvas.dispatchEvent(mouseEvent);
    };
  
    const handleTouchEnd = (e) => {
      e.preventDefault(); // Prevent scrolling
      const mouseEvent = new MouseEvent("mouseup");
      canvas.dispatchEvent(mouseEvent);
    };
  
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
  
    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);
  

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setImageDataFromFile(e.target.result);
          setShowPlaceholder(false);
          saveStateToStack();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  const restoreState = (state) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = state;
  };

  const resetToWhite = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setUndoStack([canvas.toDataURL()]);
    setCurrentIndex(0);
  };

  const handleCanvasMouseDown = (e) => {
    if (showPlaceholder) {
      setShowPlaceholder(false);
      resetToWhite();
    }
    setIsDrawing(true);
    startDrawing(e);
  };

  const handleMouseUp = (e) => {
    stopDrawing(e);
    if (isDrawing) {
      saveStateToStack();
      setIsDrawing(false);
    }
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
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleCanvasMouseDown);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [draw, handleMouseUp]);

  return (
    <div className="flex flex-col">
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100]">
          <ClipLoader color="#ffffff" size={35} />
          <span className="ml-2 text-white">Generating recommendations...</span>
        </div>
      )}
      <AppBar />
      <div className="flex h-full flex-col lg:flex-row">
        {/* Sidebar Section */}
        <div className="flex-shrink-0 w-full lg:w-1/5 p-4 bg-[#eff7fc] shadow-md rounded-lg lg:flex lg:flex-col lg:space-y-4">
          <div className="mb-4 w-full">
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

          {/* SideToolBar */}
          <SideToolBar
            onColorChange={handleColorChange}
            onThicknessChange={handleThicknessChange}
            onToolChange={handleToolChange}
          />

          <div className="mt-4 w-full">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="border p-4 w-full h-32 lg:h-52 resize-y rounded-lg shadow-md bg-[#f4f7fa] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6495b4] transition duration-300 ease-in-out"
              placeholder="Imagine & Write your fantasy..."
            />
          </div>

          <div className="mt-4 p-4 rounded-lg shadow-md text-center relative">
            <img
              src={image}
              alt="Creative background"
              className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-black opacity-40 rounded-lg"></div>
            <div className="relative z-10">
              <h5 className="text-xl font-semibold text-white mb-1">Bring Your Imagination to Life</h5>
              <p className="text-white text-xs">
                Express your creativity—draw, write, or upload images. Get inspired with nearby trek recommendations based on your preferences. Let's turn your imagination into reality!
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 lg:w-3/4 w-full flex flex-col items-center px-2 md:px-8 overflow-hidden">
          <canvas ref={canvasRef} />
          <div className="mt-4 flex flex-wrap justify-center space-x-4 space-y-0">
                  <button
              onClick={handleUndo}
              disabled={currentIndex <= 0}
              className={`bg-gray-500 text-white text-xs md:text-md p-2 rounded-lg shadow-lg transition duration-300 ${
                currentIndex <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'
              }`}
            >
              Undo
            </button>

            <button
              onClick={() => resetCanvas()}
              className="bg-gray-500 text-white text-xs md:text-md p-2 rounded-lg shadow-lg hover:bg-gray-600 transition duration-300"
            >
              Reset
            </button>
            <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`bg-[#6495b4] text-white text-xs md:text-md p-2 rounded-lg shadow-lg transition duration-300 ${
            isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-[#4a90b1]'
          }`}
        >
          {isSubmitting ? (
            <ClipLoader color="#ffffff" size={20} />
          ) : (
            'Next'
          )}
        </button>
          </div>
        </div>
      </div>
    </div>
  );
}