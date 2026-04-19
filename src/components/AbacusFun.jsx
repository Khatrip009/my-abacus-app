import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Trash2, Info, Calculator, Hash, RotateCcw, Trophy, PlayCircle, XCircle } from 'lucide-react';

/**
 * BEAD COMPONENT (DRAGGABLE)
 */
const Bead = ({ active, isUpper = false, onDrag, position }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startPos = useRef(0);

  // Constants for movement
  const TRAVEL_DISTANCE = isUpper ? 20 : 32;

  const handleMouseDown = (e) => {
    setIsDragging(true);
    startY.current = e.clientY || (e.touches && e.touches[0].clientY);
    startPos.current = position;
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging) return;
      const currentY = e.clientY || (e.touches && e.touches[0].clientY);
      const delta = currentY - startY.current;
      
      // Calculate new position within bounds
      let newPos = startPos.current + delta;
      const min = 0;
      const max = TRAVEL_DISTANCE;
      
      if (newPos < min) newPos = min;
      if (newPos > max) newPos = max;

      onDrag(newPos);
    };

    const handleUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      document.body.style.userSelect = 'auto';
      
      // Snap to closest position
      const threshold = TRAVEL_DISTANCE / 2;
      const snapped = position > threshold ? TRAVEL_DISTANCE : 0;
      onDrag(snapped);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, position, onDrag, TRAVEL_DISTANCE]);

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      className={`
        w-10 h-6 md:w-12 md:h-7 rounded-full transition-shadow duration-200 cursor-grab active:cursor-grabbing
        ${active 
          ? 'bg-amber-600 shadow-[inset_-2px_-4px_8px_rgba(0,0,0,0.5),0_4px_6px_rgba(0,0,0,0.3)]' 
          : 'bg-amber-50 shadow-[inset_-1px_-2px_4px_rgba(0,0,0,0.2)]'
        }
        border border-amber-900/20 relative z-10 select-none
      `}
      style={{ 
        transform: `translateY(${position}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
    >
      <div className="absolute top-1 left-3 w-1/3 h-1/4 bg-white/30 rounded-full blur-[1px]" />
    </div>
  );
};

/**
 * ROD COMPONENT
 */
const Rod = ({ value, label, isMarked, onChange }) => {
  const [positions, setPositions] = useState({ upper: 0, lower: [32, 32, 32, 32] });

  // Update positions when parent value changes (for input field syncing)
  useEffect(() => {
    const upperPos = value >= 5 ? 20 : 0;
    const lowerCount = value % 5;
    const newLower = [1, 2, 3, 4].map(i => (i <= lowerCount ? 0 : 32));
    setPositions({ upper: upperPos, lower: newLower });
  }, [value]);

  const handleUpperDrag = (pos) => {
    const isNowActive = pos > 10;
    const newVal = isNowActive ? (5 + (value % 5)) : (value % 5);
    onChange(newVal);
  };

  const handleLowerDrag = (beadIdx, pos) => {
    const isNowActive = pos < 16;
    let newLowerCount = 0;
    
    // Physical abacus logic: dragging a bead moves those above/below it
    const updatedLower = [...positions.lower];
    if (isNowActive) {
      for (let i = 0; i <= beadIdx; i++) updatedLower[i] = 0;
    } else {
      for (let i = beadIdx; i < 4; i++) updatedLower[i] = 32;
    }

    newLowerCount = updatedLower.filter(p => p === 0).length;
    const newVal = (value >= 5 ? 5 : 0) + newLowerCount;
    onChange(newVal);
  };

  return (
    <div className="flex flex-col items-center group flex-shrink-0" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="mb-4 h-14 flex flex-col items-center justify-end">
        <span className="text-[9px] md:text-[10px] uppercase tracking-wider text-slate-400 font-bold group-hover:text-amber-600 transition-colors text-center px-1">
          {label}
        </span>
        <span className={`text-xl font-black ${value > 0 ? 'text-amber-600' : 'text-slate-300'}`}>
          {value}
        </span>
      </div>

      <div className="relative bg-stone-200/40 p-1.5 md:p-2 rounded-lg border border-transparent group-hover:border-amber-200/50 transition-colors">
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 -translate-x-1/2 rounded-full z-0" />

        {/* Heaven Deck */}
        <div className="h-14 flex items-start justify-center pt-1">
          <Bead 
            position={positions.upper} 
            active={value >= 5} 
            isUpper={true} 
            onDrag={handleUpperDrag} 
          />
        </div>

        {/* Divider Beam */}
        <div className="w-12 md:w-14 h-3 bg-stone-900 my-2 rounded-sm shadow-lg relative z-20 flex items-center justify-center">
            {isMarked && (
                <div className="w-1.5 h-1.5 bg-white/60 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
            )}
        </div>

        {/* Earth Deck */}
        <div className="h-44 md:h-48 flex flex-col items-center pt-1 relative">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="absolute" style={{ top: `${i * 32 + 8}px` }}>
                <Bead 
                    position={positions.lower[i]} 
                    active={(value % 5) > i} 
                    onDrag={(pos) => handleLowerDrag(i, pos)} 
                />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [rodValues, setRodValues] = useState(Array(10).fill(0));
  const [mode, setMode] = useState('free'); // 'free' or 'practice'
  const [targetNumber, setTargetNumber] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const TOTAL_RODS = 10;
  const placeValues = [
    "Units", "Tens", "Hundreds", "Thousands", "Ten Thousand", "Lakhs", "Ten Lakhs", 
    "Crores", "Ten Crores", "Arab"
  ];

  const currentNumber = useMemo(() => {
    const num = [...rodValues].reverse().join("").replace(/^0+/, "");
    return num === "" ? "0" : num;
  }, [rodValues]);

  const generateNewChallenge = useCallback(() => {
    const num = Math.floor(Math.random() * 999) + 1; 
    setTargetNumber(num);
    setMode('practice');
    setRodValues(Array(TOTAL_RODS).fill(0));
  }, [TOTAL_RODS]);

  const handleRodChange = (index, val) => {
    const newValues = [...rodValues];
    newValues[index] = val;
    setRodValues(newValues);

    if (mode === 'practice' && targetNumber !== null) {
        const potentialNum = [...newValues].reverse().join("").replace(/^0+/, "") || "0";
        if (potentialNum === targetNumber.toString()) {
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                generateNewChallenge();
            }, 2000);
        }
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, TOTAL_RODS);
    const newValues = Array(TOTAL_RODS).fill(0);
    val.split("").reverse().forEach((digit, i) => {
        newValues[i] = parseInt(digit);
    });
    setRodValues(newValues);
  };

  const clearAbacus = () => setRodValues(Array(TOTAL_RODS).fill(0));

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] p-4 md:p-8" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-[900] tracking-tight text-slate-800 flex items-center gap-4">
              <span className="p-2.5 bg-amber-500 rounded-2xl text-white shadow-lg shadow-amber-200">
                <Calculator size={32} />
              </span>
              Abacus Fun
            </h1>
            <p className="text-slate-500 mt-2 font-bold opacity-80">Interactive Physical Learning</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {mode === 'free' ? (
                <div className="relative group flex-1 md:flex-none">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    value={currentNumber}
                    onChange={handleInputChange}
                    className="pl-12 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm focus:border-amber-500 outline-none transition-all w-full md:w-60 text-xl font-black text-slate-700"
                />
                </div>
            ) : (
                <div className="flex items-center gap-4 bg-amber-100 px-6 py-3 rounded-2xl border-2 border-amber-200">
                    <span className="text-amber-800 font-black text-lg">TARGET: {targetNumber}</span>
                    {showSuccess && <Trophy className="text-green-600 animate-bounce" />}
                </div>
            )}
            
            <button 
              onClick={mode === 'free' ? generateNewChallenge : () => setMode('free')}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black transition-all shadow-sm active:scale-95 ${
                mode === 'free' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              {mode === 'free' ? <PlayCircle size={20} /> : <XCircle size={20} />}
              <span>{mode === 'free' ? 'PRACTICE MODE' : 'EXIT PRACTICE'}</span>
            </button>

            <button 
              onClick={clearAbacus}
              className="flex items-center gap-2 px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 font-black hover:text-red-500 hover:border-red-100 transition-all shadow-sm active:scale-95"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </header>

        {/* Abacus Visualization */}
        <div className="relative">
            <main className="relative bg-[#eeeae3] rounded-[40px] p-4 md:p-12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border-[16px] border-[#2d241e] overflow-x-auto custom-scrollbar">
            
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/wood-pattern.png")` }} />
            
            <div className="flex items-end justify-center gap-1 md:gap-4 min-w-max px-4">
                {Array.from({ length: TOTAL_RODS }).reverse().map((_, idx) => {
                    const actualIndex = (TOTAL_RODS - 1) - idx;
                    return (
                        <Rod 
                            key={actualIndex} 
                            value={rodValues[actualIndex]} 
                            label={placeValues[actualIndex]}
                            isMarked={actualIndex % 3 === 0}
                            onChange={(val) => handleRodChange(actualIndex, val)}
                        />
                    );
                })}
            </div>
            </main>

            {/* Win Animation */}
            {showSuccess && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-[40px] z-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl text-center animate-in zoom-in duration-300">
                        <Trophy size={80} className="text-amber-500 mx-auto mb-4" />
                        <h2 className="text-3xl font-black text-slate-800">AMAZING!</h2>
                        <p className="text-slate-500 font-bold">You built {targetNumber} correctly!</p>
                    </div>
                </div>
            )}
        </div>

        {/* Big Number Display */}
        <div className="mt-8 text-center">
            <div className="inline-block bg-white px-10 py-6 rounded-[32px] shadow-xl border-4 border-slate-100">
                <span className="text-slate-400 font-black uppercase tracking-widest text-xs block mb-1">Current Number</span>
                <span className="text-6xl font-[900] text-indigo-600 tracking-tighter">{currentNumber}</span>
            </div>
        </div>

        {/* Guide Cards */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-amber-50/50 p-8 rounded-[32px] border border-amber-100">
            <h3 className="text-xl font-black text-amber-900 mb-4 flex items-center gap-2">
              <Info className="text-amber-500" /> Touch & Feel
            </h3>
            <p className="text-amber-800/80 leading-relaxed font-bold text-sm">
              Click and drag the beads! In a real abacus, you move them with your fingers to count.
            </p>
          </div>
          <div className="bg-indigo-50 p-8 rounded-[32px] border border-indigo-100">
            <h3 className="text-xl font-black text-indigo-900 mb-4 flex items-center gap-2">
              <Trophy className="text-indigo-500" /> Practice Engine
            </h3>
            <p className="text-indigo-800/80 leading-relaxed font-bold text-sm">
              Try Practice Mode! It will give you a target number to build. It's like a puzzle for math!
            </p>
          </div>
          <div className="bg-slate-800 p-8 rounded-[32px] text-white">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-amber-400">
              <Calculator size={20} /> Place Values
            </h3>
            <p className="text-slate-300 leading-relaxed font-medium text-sm">
              Every rod to the left is 10 times bigger. Moving a bead on the "Tens" rod is like moving 10 beads on the "Units" rod!
            </p>
          </div>
        </section>

        <footer className="mt-20 pb-10 text-center text-slate-300 text-xs font-black tracking-widest uppercase">
          Interactive Learning Lab • Nunito Font Enabled
        </footer>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2d241e;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}