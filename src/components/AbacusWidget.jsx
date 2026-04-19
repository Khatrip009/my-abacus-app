// src/components/AbacusWidget.jsx
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Hash, RotateCcw, PlayCircle, XCircle, Trophy } from 'lucide-react';

// ------------------- BEAD COMPONENT (DRAGGABLE) -------------------
const Bead = ({ active, isUpper = false, onDrag, position }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startPos = useRef(0);
  const TRAVEL_DISTANCE = isUpper ? 20 : 32;

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    startY.current = clientY;
    startPos.current = position;
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging) return;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const delta = clientY - startY.current;
      let newPos = startPos.current + delta;
      newPos = Math.max(0, Math.min(newPos, TRAVEL_DISTANCE));
      onDrag(newPos);
    };

    const handleUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      document.body.style.userSelect = 'auto';
      const snapped = position > TRAVEL_DISTANCE / 2 ? TRAVEL_DISTANCE : 0;
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
        w-8 h-5 md:w-9 md:h-5.5 rounded-full cursor-grab active:cursor-grabbing select-none
        ${active 
          ? 'bg-amber-600 shadow-[inset_-2px_-4px_8px_rgba(0,0,0,0.5),0_4px_6px_rgba(0,0,0,0.3)]' 
          : 'bg-amber-50 shadow-[inset_-1px_-2px_4px_rgba(0,0,0,0.2)]'
        }
        border border-amber-900/20 relative z-10
      `}
      style={{ 
        transform: `translateY(${position}px)`,
        transition: isDragging ? 'none' : 'transform 0.2s ease-out'
      }}
    >
      <div className="absolute top-0.5 left-2 w-1/3 h-1/4 bg-white/30 rounded-full blur-[1px]" />
    </div>
  );
};

// ------------------- ROD COMPONENT -------------------
const Rod = ({ value, label, onChange, compact }) => {
  const [positions, setPositions] = useState({ upper: 0, lower: [32, 32, 32, 32] });

  useEffect(() => {
    const upperPos = value >= 5 ? 20 : 0;
    const lowerCount = value % 5;
    const newLower = [1, 2, 3, 4].map(i => (i <= lowerCount ? 0 : 32));
    setPositions({ upper: upperPos, lower: newLower });
  }, [value]);

  const handleUpperDrag = (pos) => {
    const isActive = pos > 10;
    const newVal = isActive ? (5 + (value % 5)) : (value % 5);
    onChange(newVal);
  };

  const handleLowerDrag = (beadIdx, pos) => {
    const isActive = pos < 16;
    const updatedLower = [...positions.lower];
    if (isActive) {
      for (let i = 0; i <= beadIdx; i++) updatedLower[i] = 0;
    } else {
      for (let i = beadIdx; i < 4; i++) updatedLower[i] = 32;
    }
    const newLowerCount = updatedLower.filter(p => p === 0).length;
    const newVal = (value >= 5 ? 5 : 0) + newLowerCount;
    onChange(newVal);
  };

  const sizeClasses = compact 
    ? { bead: 'w-7 h-4', rodHeight: 'h-32', upperH: 'h-8', lowerH: 'h-24', gap: 'space-y-1' }
    : { bead: 'w-8 h-5 md:w-9 md:h-5.5', rodHeight: 'h-44 md:h-48', upperH: 'h-14', lowerH: 'h-44 md:h-48', gap: 'space-y-1.5' };

  return (
    <div className="flex flex-col items-center flex-shrink-0">
      <div className="mb-2 h-10 flex flex-col items-center justify-end">
        <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">
          {label}
        </span>
        <span className={`text-sm font-black ${value > 0 ? 'text-amber-600' : 'text-slate-300'}`}>
          {value}
        </span>
      </div>

      <div className="relative bg-stone-200/40 p-1 rounded-md">
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400 -translate-x-1/2 rounded-full z-0" />
        
        <div className={`${sizeClasses.upperH} flex items-start justify-center pt-0.5`}>
          <Bead position={positions.upper} active={value >= 5} isUpper={true} onDrag={handleUpperDrag} />
        </div>

        <div className="w-10 md:w-11 h-2 bg-stone-900 my-1 rounded-sm shadow relative z-20" />

        <div className={`${sizeClasses.lowerH} flex flex-col items-center ${sizeClasses.gap} relative`}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="absolute" style={{ top: `${i * 28 + 4}px` }}>
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

// ------------------- MAIN WIDGET -------------------
const AbacusWidget = () => {
  const TOTAL_RODS = 5; // Compact: Ten Thousands, Thousands, Hundreds, Tens, Units
  const placeValues = ["10K", "1K", "100", "10", "1"];
  
  const [rodValues, setRodValues] = useState(Array(TOTAL_RODS).fill(0));
  const [mode, setMode] = useState('free');
  const [targetNumber, setTargetNumber] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const currentNumber = useMemo(() => {
    const num = [...rodValues].reverse().join("").replace(/^0+/, "");
    return num === "" ? "0" : num;
  }, [rodValues]);

  const generateChallenge = useCallback(() => {
    const max = 99999;
    const num = Math.floor(Math.random() * max) + 1;
    setTargetNumber(num);
    setMode('practice');
    setRodValues(Array(TOTAL_RODS).fill(0));
    setShowSuccess(false);
  }, []);

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
          generateChallenge();
        }, 1500);
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
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
          🧮 Abacus Practice
        </h3>
        <div className="flex gap-2">
          {mode === 'free' ? (
            <button
              onClick={generateChallenge}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition"
            >
              <PlayCircle size={16} /> Practice
            </button>
          ) : (
            <button
              onClick={() => setMode('free')}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-300 transition"
            >
              <XCircle size={16} /> Exit
            </button>
          )}
          <button
            onClick={clearAbacus}
            className="p-1.5 text-slate-400 hover:text-red-500 transition"
            title="Reset"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {mode === 'practice' && targetNumber !== null && (
        <div className="mb-4 flex items-center justify-between bg-amber-50 p-3 rounded-lg border border-amber-200">
          <span className="font-bold text-amber-800">Target: {targetNumber.toLocaleString()}</span>
          {showSuccess && <Trophy className="text-green-600 animate-bounce" size={20} />}
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-lg">
          <Hash size={16} className="text-slate-400" />
          <input
            type="text"
            value={currentNumber}
            onChange={handleInputChange}
            className="bg-transparent w-full outline-none font-mono text-lg font-bold text-slate-700"
            placeholder="Enter number"
          />
        </div>
      </div>

      {/* Abacus Visualization */}
      <div className="relative bg-[#eeeae3] rounded-xl p-4 border-4 border-[#2d241e] overflow-x-auto custom-scrollbar">
        <div className="flex justify-center gap-2 min-w-max">
          {Array.from({ length: TOTAL_RODS }).reverse().map((_, idx) => {
            const actualIndex = (TOTAL_RODS - 1) - idx;
            return (
              <Rod
                key={actualIndex}
                value={rodValues[actualIndex]}
                label={placeValues[actualIndex]}
                onChange={(val) => handleRodChange(actualIndex, val)}
                compact
              />
            );
          })}
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-3 text-center">
        Drag beads to count • Practice mode challenges you
      </p>
    </div>
  );
};

export default AbacusWidget;