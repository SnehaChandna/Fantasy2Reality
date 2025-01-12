
import { useState, useRef } from 'react';

export default function usePaintCustomHooks() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [thickness, setThickness] = useState(5);
  const [tool, setTool] = useState("pen");
  
  const startDrawing = (e) => {
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvasRef.current.offsetLeft, e.clientY - canvasRef.current.offsetTop);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineWidth = thickness;
    if (tool === "pen") {
      ctx.strokeStyle = color;
      ctx.lineTo(e.clientX - canvasRef.current.offsetLeft, e.clientY - canvasRef.current.offsetTop);
      ctx.stroke();
    } else if (tool === "eraser") {
      ctx.globalCompositeOperation = 'destination-out'; 
      ctx.lineTo(e.clientX - canvasRef.current.offsetLeft, e.clientY - canvasRef.current.offsetTop);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  const handleColorChange = (e) => setColor(e.target.value);
  const handleThicknessChange = (e) => setThickness(e.target.value);

  const handleToolChange = (tool) => {
    setTool(tool);
  };

  const resetCanvas = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const setImageDataFromFile = (imageData) => {
    const img = new Image();
    img.onload = () => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.drawImage(img, 0, 0);
    };
    img.src = imageData;
  };

  const captureCanvasImage = () => {
    const canvas = canvasRef.current;
    return canvas.toDataURL("image/png");
  };

  return {
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
  };
}