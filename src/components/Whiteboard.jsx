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
  const [color, setColor] = useState('#6366f1');
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState(null);

  const colors = [
    { label: 'Indigo', value: '#6366f1' },
    { label: 'Cyan', value: '#06b6d4' },
    { label: 'Emerald', value: '#10b981' },
    { label: 'Amber', value: '#f59e0b' },
    { label: 'Rose', value: '#f43f5e' },
    { label: 'White', value: '#f8fafc' },
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

    // Fill dark background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw subtle grid dots
    drawGrid(ctx, rect.width, rect.height);
  }, []);

  const drawGrid = (ctx, w, h) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
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

    ctx.strokeStyle = tool === 'eraser' ? '#0f172a' : color;
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
    ctx.fillStyle = '#0f172a';
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
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();

    // Text label
    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 13px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
      {/* Top Whiteboard Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 text-xs">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setTool('pencil')}
            className={`p-1.5 rounded flex items-center gap-1 transition ${tool === 'pencil' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            title="Freehand Pencil"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTool('rect')}
            className={`p-1.5 rounded flex items-center gap-1 transition ${tool === 'rect' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            title="Rectangle"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTool('circle')}
            className={`p-1.5 rounded flex items-center gap-1 transition ${tool === 'circle' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            title="Circle"
          >
            <Circle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTool('line')}
            className={`p-1.5 rounded flex items-center gap-1 transition ${tool === 'line' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            title="Line / Connector"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-1.5 rounded flex items-center gap-1 transition ${tool === 'eraser' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
            title="Eraser"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {colors.map((c) => (
            <button
              key={c.value}
              onClick={() => setColor(c.value)}
              className={`w-4 h-4 rounded-full transition-transform ${color === c.value ? 'scale-125 ring-2 ring-white/60' : 'opacity-80 hover:opacity-100'}`}
              style={{ backgroundColor: c.value }}
              title={c.label}
            />
          ))}
        </div>

        {/* Quick System Design Stamps */}
        <div className="hidden lg:flex items-center gap-1.5 text-slate-300">
          <span className="text-[11px] text-slate-500 font-medium mr-1">System Nodes:</span>
          <button 
            onClick={() => stampArchitectureNode('Client App', 'client')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 transition"
          >
            + Client
          </button>
          <button 
            onClick={() => stampArchitectureNode('Load Balancer', 'lb')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 transition"
          >
            + Nginx / LB
          </button>
          <button 
            onClick={() => stampArchitectureNode('API Server', 'api')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 transition"
          >
            + API Gateway
          </button>
          <button 
            onClick={() => stampArchitectureNode('Redis Cache', 'cache')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 transition"
          >
            + Redis
          </button>
          <button 
            onClick={() => stampArchitectureNode('PostgreSQL DB', 'db')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 transition"
          >
            + Database
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={clearCanvas}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Clear Board"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={downloadCanvas}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 transition text-xs"
            title="Download Whiteboard"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Canvas Drawing Surface */}
      <div className="relative flex-1 w-full h-full cursor-crosshair overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-full block"
        />
        <div className="absolute bottom-3 left-4 pointer-events-none text-[11px] text-slate-600 font-mono">
          System Design Architecture Canvas • Interactive Freehand & Blocks
        </div>
      </div>
    </div>
  );
}
