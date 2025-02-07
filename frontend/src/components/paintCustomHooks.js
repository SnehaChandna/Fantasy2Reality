import { useState, useRef, useEffect } from 'react';

export default function usePaintCustomHooks() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [thickness, setThickness] = useState(5);
  const [tool, setTool] = useState("pen");
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const undoStackRef = useRef([]);
  const currentIndexRef = useRef(-1);
  const MAX_UNDO_STEPS = 20;

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL();
    const newStack = [...undoStackRef.current.slice(0, currentIndexRef.current + 1), imageData];
    undoStackRef.current = newStack.slice(-MAX_UNDO_STEPS);
    currentIndexRef.current = Math.min(currentIndexRef.current + 1, MAX_UNDO_STEPS - 1);
  };

  const restoreState = (state) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = state;
  };

  const getCanvasCoordinates = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if (e.clientX !== undefined) {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    } else if (e.touches && e.touches[0]) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return { x: 0, y: 0 };
  };

  const getPixel = (imageData, x, y) => {
    const roundedX = Math.round(x);
    const roundedY = Math.round(y);
    
    if (roundedX < 0 || roundedX >= imageData.width || 
        roundedY < 0 || roundedY >= imageData.height) {
      return null;
    }
    
    const index = (roundedY * imageData.width + roundedX) * 4;
    return [
      imageData.data[index],
      imageData.data[index + 1],
      imageData.data[index + 2],
      imageData.data[index + 3]
    ];
  };
  
  const setPixel = (imageData, x, y, color) => {
    const roundedX = Math.round(x);
    const roundedY = Math.round(y);
    
    if (roundedX < 0 || roundedX >= imageData.width || 
        roundedY < 0 || roundedY >= imageData.height) {
      return;
    }
    
    const index = (roundedY * imageData.width + roundedX) * 4;
    imageData.data[index] = color[0];
    imageData.data[index + 1] = color[1];
    imageData.data[index + 2] = color[2];
    imageData.data[index + 3] = color[3];
  };
  
  const colorsMatch = (a, b, tolerance = 5) => {
    if (!a || !b) return false;
    return Math.abs(a[0] - b[0]) <= tolerance &&
           Math.abs(a[1] - b[1]) <= tolerance &&
           Math.abs(a[2] - b[2]) <= tolerance &&
           Math.abs(a[3] - b[3]) <= tolerance;
  };
  
  const floodFill = (ctx, startX, startY, fillColor) => {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    
    const devicePixelRatio = window.devicePixelRatio || 1;
    const coords = getCanvasCoordinates({ clientX: startX, clientY: startY });
    const scaledX = Math.round(coords.x);
    const scaledY = Math.round(coords.y);
    
    if (scaledX < 0 || scaledX >= canvasWidth || scaledY < 0 || scaledY >= canvasHeight) {
      console.error("Starting point is out of bounds.");
      return;
    }
  
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    const targetColor = getPixel(imageData, scaledX, scaledY);
    if (!targetColor) return;
  
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 1;
    tempCanvas.height = 1;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.fillStyle = fillColor;
    tempCtx.fillRect(0, 0, 1, 1);
    const fillColorData = Array.from(tempCtx.getImageData(0, 0, 1, 1).data);
  
    if (colorsMatch(targetColor, fillColorData)) {
      return;
    }
  
    const queue = [[scaledX, scaledY]];
    const visited = new Set();
  
    while (queue.length > 0) {
      const [x, y] = queue.shift();
      const key = `${x},${y}`;
  
      if (visited.has(key)) continue;
      visited.add(key);
  
      const currentColor = getPixel(imageData, x, y);
      if (!colorsMatch(currentColor, targetColor)) continue;
  
      setPixel(imageData, x, y, fillColorData);
  
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dx, dy] of directions) {
        const newX = x + dx;
        const newY = y + dy;
        if (newX >= 0 && newX < canvasWidth && 
            newY >= 0 && newY < canvasHeight) {
          queue.push([newX, newY]);
        }
      }
    }
  
    ctx.putImageData(imageData, 0, 0);
  };

  const startDrawing = (e) => {
    const ctx = canvasRef.current.getContext("2d");
    const coords = getCanvasCoordinates(e);
    
    if (tool === "bucket") {
      floodFill(ctx, e.clientX, e.clientY, color);
      saveState();
      return;
    }

    setIsDrawing(true);
    lastPositionRef.current = coords;
    
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const ctx = canvasRef.current.getContext('2d');
    const coords = getCanvasCoordinates(e);
    
    if (tool === "bucket") {
      return;
    }

    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === "pen") {
      ctx.strokeStyle = color;
      ctx.globalCompositeOperation = 'source-over';
    } else if (tool === "eraser") {
      ctx.strokeStyle = '#ffffff'; // Use white color for eraser
      ctx.globalCompositeOperation = 'source-over';
    }

    // Use quadratic curves for smoother lines
    const midPoint = {
      x: (lastPositionRef.current.x + coords.x) / 2,
      y: (lastPositionRef.current.y + coords.y) / 2
    };

    ctx.quadraticCurveTo(
      lastPositionRef.current.x,
      lastPositionRef.current.y,
      midPoint.x,
      midPoint.y
    );
    
    ctx.stroke();
    lastPositionRef.current = coords;
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.stroke();
      setIsDrawing(false);
    }
  };

  const handleColorChange = (e) => setColor(e.target.value);
  const handleThicknessChange = (e) => setThickness(e.target.value);
  const handleToolChange = (selectedTool) => {
    console.log(`Tool changed to: ${selectedTool}`);
    setTool(selectedTool);
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const undo = () => {
    if (currentIndexRef.current > 0) {
      currentIndexRef.current--;
      restoreState(undoStackRef.current[currentIndexRef.current]);
    }
  };

  const setImageDataFromFile = (imageData) => {
    const img = new Image();
    img.onload = () => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
      saveState();
    };
    img.src = imageData;
  };

  const captureCanvasImage = () => {
    return canvasRef.current?.toDataURL("image/png");
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  }, []);
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
    undo
  };
}