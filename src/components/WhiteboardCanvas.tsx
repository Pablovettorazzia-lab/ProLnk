import React, { useRef, useState, useEffect } from 'react';
import {
  Pen,
  Highlighter,
  Eraser,
  RotateCcw,
  Download,
  Save,
  Grid,
  Trash2,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface SavedSketch {
  id: string;
  dataUrl: string;
  title: string;
  timestamp: string;
}

export const WhiteboardCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [strokeColor, setStrokeColor] = useState('#F6C62B');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [bgStyle, setBgStyle] = useState<'grid' | 'dots' | 'lines' | 'blank'>('grid');
  
  // History for undo
  const [history, setHistory] = useState<ImageData[]>([]);
  
  // Saved user sketches
  const [savedSketches, setSavedSketches] = useState<SavedSketch[]>([
    {
      id: 'sketch-sample',
      dataUrl: '',
      title: 'Calculus derivatives scratch notes',
      timestamp: 'Today, 4:15 PM'
    }
  ]);
  const [toast, setToast] = useState<string | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-DPI scaling
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    drawBackground(ctx, rect.width, rect.height, bgStyle);

    // Save initial state
    const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialData]);
  }, []);

  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, style: string) => {
    ctx.fillStyle = '#080f21';
    ctx.fillRect(0, 0, width, height);

    if (style === 'grid') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const step = 24;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (style === 'dots') {
      ctx.fillStyle = 'rgba(246, 198, 43, 0.15)';
      const step = 24;
      for (let x = 12; x < width; x += step) {
        for (let y = 12; y < height; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (style === 'lines') {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      const step = 28;
      for (let y = step; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
  };

  const changeBackground = (newStyle: 'grid' | 'dots' | 'lines' | 'blank') => {
    setBgStyle(newStyle);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    drawBackground(ctx, rect.width, rect.height, newStyle);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (currentTool === 'eraser') {
      ctx.strokeStyle = '#080f21';
      ctx.lineWidth = strokeWidth * 4;
      ctx.globalAlpha = 1.0;
    } else if (currentTool === 'highlighter') {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth * 3.5;
      ctx.globalAlpha = 0.35;
    } else {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.globalAlpha = 1.0;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
    ctx.globalAlpha = 1.0;

    // Push state to history
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev.slice(-15), data]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // remove current state
    const previous = newHistory[newHistory.length - 1];
    ctx.putImageData(previous, 0, 0);
    setHistory(newHistory);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    drawBackground(ctx, rect.width, rect.height, bgStyle);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([data]);
  };

  const handleSaveSketch = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');

    const newSketch: SavedSketch = {
      id: 'sketch-' + Date.now(),
      dataUrl,
      title: `Personal Study Notes (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setSavedSketches(prev => [newSketch, ...prev]);
    setToast('Drawing saved to your notebook notes!');
    setTimeout(() => setToast(null), 3000);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `prolnk-whiteboard-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Canvas Tool Bar */}
      <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        
        {/* Tool selectors */}
        <div className="flex items-center gap-1.5 p-1 bg-[#080f21] rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setCurrentTool('pen')}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentTool === 'pen'
                ? 'bg-[#F6C62B] text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Pen"
          >
            <Pen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pen</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTool('highlighter')}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentTool === 'highlighter'
                ? 'bg-[#F6C62B] text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Highlighter"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Highlighter</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTool('eraser')}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentTool === 'eraser'
                ? 'bg-[#F6C62B] text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Eraser"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Eraser</span>
          </button>
        </div>

        {/* Color Palette */}
        {currentTool !== 'eraser' && (
          <div className="flex items-center gap-2">
            {[
              { color: '#F6C62B', label: 'ProLnk Gold' },
              { color: '#FFFFFF', label: 'White' },
              { color: '#38BDF8', label: 'Sky Blue' },
              { color: '#34D399', label: 'Emerald' },
              { color: '#F87171', label: 'Coral' }
            ].map(c => (
              <button
                key={c.color}
                type="button"
                onClick={() => setStrokeColor(c.color)}
                style={{ backgroundColor: c.color }}
                className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                  strokeColor === c.color ? 'scale-125 border-white shadow-md' : 'border-transparent hover:scale-110'
                }`}
                title={c.label}
              />
            ))}
          </div>
        )}

        {/* Thickness */}
        <div className="flex items-center gap-1.5 p-1 bg-[#080f21] rounded-xl border border-slate-800 text-xs">
          {[
            { size: 2, label: 'Thin' },
            { size: 4, label: 'Med' },
            { size: 8, label: 'Thick' }
          ].map(s => (
            <button
              key={s.size}
              type="button"
              onClick={() => setStrokeWidth(s.size)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                strokeWidth === s.size
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Background Style */}
        <div className="flex items-center gap-1.5 p-1 bg-[#080f21] rounded-xl border border-slate-800 text-xs">
          {(['grid', 'dots', 'lines', 'blank'] as const).map(style => (
            <button
              key={style}
              type="button"
              onClick={() => changeBackground(style)}
              className={`px-2 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                bgStyle === style ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {style}
            </button>
          ))}
        </div>

        {/* Canvas Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
            title="Undo stroke"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
            title="Clear board"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleSaveSketch}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Note</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PNG</span>
          </button>
        </div>

      </div>

      {/* Drawing Canvas Area */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-[#080f21] shadow-2xl">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-[460px] cursor-crosshair touch-none"
        />

        <div className="absolute bottom-3 left-4 text-[11px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800 pointer-events-none">
          Draw freely: scratch calculus proofs, physics free-body diagrams, or study notes.
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Saved Sketches Gallery */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm font-display">My Saved Sketches & Diagrams</h3>
          <span className="text-xs text-slate-400">{savedSketches.length} notes</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedSketches.map(sk => (
            <div
              key={sk.id}
              className="bg-[#0c162e] border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-600 transition-colors"
            >
              <div>
                {sk.dataUrl ? (
                  <div className="w-full h-32 rounded-lg bg-[#080f21] border border-slate-800 overflow-hidden mb-3 flex items-center justify-center">
                    <img src={sk.dataUrl} alt={sk.title} className="max-h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-full h-32 rounded-lg bg-[#080f21] border border-dashed border-slate-800 mb-3 flex flex-col items-center justify-center text-slate-400 p-2 text-center text-xs">
                    <Pen className="w-6 h-6 text-[#F6C62B] mb-1" />
                    <span>Derivative & limit scratch notes</span>
                  </div>
                )}
                <h4 className="font-bold text-white text-xs">{sk.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{sk.timestamp}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (sk.dataUrl) {
                      const img = new Image();
                      img.onload = () => {
                        const canvas = canvasRef.current;
                        if (!canvas) return;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return;
                        ctx.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2);
                      };
                      img.src = sk.dataUrl;
                    }
                  }}
                  className="text-xs font-semibold text-[#F6C62B] hover:underline cursor-pointer"
                >
                  Load to canvas
                </button>
                <button
                  type="button"
                  onClick={() => setSavedSketches(prev => prev.filter(s => s.id !== sk.id))}
                  className="text-[11px] text-slate-400 hover:text-rose-400 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
