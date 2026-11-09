import React, { useRef, useState, useEffect } from 'react';
import { 
  Pencil, 
  Square, 
  Circle, 
  Minus, 
  Type, 
  Eraser, 
  RotateCcw, 
  Download, 
  Layers, 
  Database, 
  Server, 
  Cpu, 
  HardDrive 
} from 'lucide-react';

export default function Whiteboard() {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('pencil'); // 'pencil', 'rect', 'circle', 'line', 'eraser'
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState(null);

  const colors = [
    { label: 'Black', value: '#000000' },
    { label: 'Indigo', value: '#4f46e5' },
    { label: 'Cyan', value: '#0284c7' },
    { label: 'Emerald', value: '#059669' },
    { label: 'Amber', value: '#d97706' },
    { label: 'Rose', value: '#e11d48' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle high DPI
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;

    const ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw subtle grid dots
    drawGrid(ctx, rect.width, rect.height);
  }, []);

  const drawGrid = (ctx, w, h) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    const spacing = 28;
    for (let x = 0; x < w; x += spacing) {
      for (let y = 0; y < h; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    const pos = getPos(e);
    setIsDrawing(true);
    setStartPos(pos);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Save snapshot for shapes
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));

    if (tool === 'pencil' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 4 : lineWidth;

    if (tool === 'pencil' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (snapshot) {
      // Restore before drawing preview
      ctx.putImageData(snapshot, 0, 0);
      ctx.beginPath();

      if (tool === 'rect') {
        ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (tool === 'line') {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    drawGrid(ctx, rect.width, rect.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'prepal-system-design-whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  // Stamp pre-built system design architectural node
  const stampArchitectureNode = (label, iconType) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const x = 80 + Math.random() * 200;
    const y = 80 + Math.random() * 200;
    const w = 150;
    const h = 60;

    // Box
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();

    // Text label
    ctx.fillStyle = '#000000';
    ctx.font = '600 13px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border-2 border-black overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
      {/* Top Whiteboard Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white border-b border-black text-xs">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-black shadow-sm">
          <button
            onClick={() => setTool('pencil')}
            className={`p-1.5 rounded flex items-center gap-1 transition ${tool === 'pencil' ? 'bg-black text-white' : 'text-black hover:bg-zinc-100'}`}
            title="Freehand Pencil"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTool('rect')}
            className={`p-1.5 rounded flex items-center gap-1 transition ${tool === 'rect' ? 'bg-black text-white' : 'text-black hover:bg-zinc-100'}`}
            title="Rectangle"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTool('circle')}
            className={`p-1.5 rounded flex items-center gap-1 transition ${tool === 'circle' ? 'bg-black text-white' : 'text-black hover:bg-zinc-100'}`}
            title="Circle"
          >
            <Circle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTool('line')}
            className={`p-1.5 rounded flex items-center gap-1 transition ${tool === 'line' ? 'bg-black text-white' : 'text-black hover:bg-zinc-100'}`}
            title="Line / Connector"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-1.5 rounded flex items-center gap-1 transition ${tool === 'eraser' ? 'bg-black text-white' : 'text-black hover:bg-zinc-100'}`}
            title="Eraser"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-black shadow-sm">
          {colors.map((c) => (
            <button
              key={c.value}
              onClick={() => setColor(c.value)}
              className={`w-4 h-4 rounded-full border border-black/40 transition-transform ${color === c.value ? 'scale-125 ring-2 ring-black' : 'opacity-80 hover:opacity-100'}`}
              style={{ backgroundColor: c.value }}
              title={c.label}
            />
          ))}
        </div>

        {/* Quick System Design Stamps */}
        <div className="hidden lg:flex items-center gap-1.5 text-black">
          <span className="text-[11px] text-zinc-600 font-semibold mr-1">System Nodes:</span>
          <button 
            onClick={() => stampArchitectureNode('Client App', 'client')}
            className="px-2 py-1 rounded bg-white hover:bg-zinc-100 border border-black text-[11px] font-mono text-black transition shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
          >
            + Client
          </button>
          <button 
            onClick={() => stampArchitectureNode('Load Balancer', 'lb')}
            className="px-2 py-1 rounded bg-white hover:bg-zinc-100 border border-black text-[11px] font-mono text-black transition shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
          >
            + Nginx / LB
          </button>
          <button 
            onClick={() => stampArchitectureNode('API Server', 'api')}
            className="px-2 py-1 rounded bg-white hover:bg-zinc-100 border border-black text-[11px] font-mono text-black transition shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
          >
            + API Gateway
          </button>
          <button 
            onClick={() => stampArchitectureNode('Redis Cache', 'cache')}
            className="px-2 py-1 rounded bg-white hover:bg-zinc-100 border border-black text-[11px] font-mono text-black transition shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
          >
            + Redis
          </button>
          <button 
            onClick={() => stampArchitectureNode('PostgreSQL DB', 'db')}
            className="px-2 py-1 rounded bg-white hover:bg-zinc-100 border border-black text-[11px] font-mono text-black transition shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
          >
            + Database
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={clearCanvas}
            className="p-1.5 rounded bg-white hover:bg-zinc-100 border border-black text-black transition shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            title="Clear Board"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={downloadCanvas}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-black hover:bg-zinc-800 text-white border border-black transition text-xs shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            title="Download Whiteboard"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Canvas Drawing Surface */}
      <div className="relative flex-1 w-full h-full cursor-crosshair overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-full block"
        />
        <div className="absolute bottom-3 left-4 pointer-events-none text-[11px] text-zinc-500 font-mono">
          System Design Architecture Canvas • Interactive Freehand & Blocks
        </div>
      </div>
    </div>
  );
}
