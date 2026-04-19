import React, { useState, useMemo } from 'react';
import { Trash2, Info, Calculator, Hash, RotateCcw } from 'lucide-react';

/**
 * BEAD COMPONENT
 * Represents a single physical bead.
 * Styled with Nunito-inspired rounded aesthetics.
 */
const Bead = ({ active, isUpper = false }) => {
  return (
    <div
      className={`
        w-10 h-6 md:w-12 md:h-7 rounded-full transition-all duration-500 ease-out cursor-default
        ${active 
          ? 'bg-amber-600 shadow-[inset_-2px_-4px_8px_rgba(0,0,0,0.5),0_4px_6px_rgba(0,0,0,0.3)] translate-y-0' 
          : isUpper 
            ? 'bg-amber-50 shadow-[inset_-1px_-2px_4px_rgba(0,0,0,0.2)] -translate-y-4 md:-translate-y-5' 
            : 'bg-amber-50 shadow-[inset_-1px_-2px_4px_rgba(0,0,0,0.2)] translate-y-7 md:translate-y-8'
        }
        border border-amber-900/20 relative z-10
      `}
    >
      <div className="absolute top-1 left-3 w-1/3 h-1/4 bg-white/30 rounded-full blur-[1px]" />
    </div>
  );
};

/**
 * ROD COMPONENT
 */
const Rod = ({ value, label, isMarked }) => {
  const upperActive = value >= 5;
  const lowerCount = value % 5;

  return (
    <div className="flex flex-col items-center group flex-shrink-0" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Label and Digit */}
      <div className="mb-4 h-14 flex flex-col items-center justify-end">
        <span className="text-[9px] md:text-[10px] uppercase tracking-wider text-slate-400 font-bold group-hover:text-amber-600 transition-colors text-center px-1">
          {label}
        </span>
        <span className={`text-xl font-black ${value > 0 ? 'text-amber-600' : 'text-slate-300'}`}>
          {value}
        </span>
      </div>

      {/* The Physical Rod Column */}
      <div className="relative bg-stone-200/40 p-1.5 md:p-2 rounded-lg border border-transparent group-hover:border-amber-200/50 transition-colors">
        {/* The Metal Rod */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 -translate-x-1/2 rounded-full z-0" />

        {/* Upper Deck (Heaven) */}
        <div className="h-14 flex items-start justify-center pt-1">
          <Bead active={upperActive} isUpper={true} />
        </div>

        {/* Divider Bar (The Beam) */}
        <div className="w-12 md:w-14 h-3 bg-stone-900 my-2 rounded-sm shadow-lg relative z-20 flex items-center justify-center">
            {isMarked && (
                <div className="w-1.5 h-1.5 bg-white/60 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
            )}
        </div>

        {/* Lower Deck (Earth) */}
        <div className="h-44 md:h-48 flex flex-col items-center space-y-1.5 pt-1">
          {[1, 2, 3, 4].map((i) => (
            <Bead key={i} active={i <= lowerCount} isUpper={false} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [inputValue, setInputValue] = useState("");
  const TOTAL_RODS = 10;

  const placeValues = [
    "Units", "Tens", "Hundreds", "Thousands", "Ten Thousand", "Lakhs", "Ten Lakhs", 
    "Crores", "Ten Crores", "Arab"
  ];

  const handleInputChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    // Limit to 10 digits
    if (val.length <= TOTAL_RODS) {
      setInputValue(val);
    }
  };

  const getRodValue = (index) => {
    const reversedInput = inputValue.split("").reverse();
    const val = reversedInput[index];
    return val ? parseInt(val) : 0;
  };

  const clearAbacus = () => setInputValue("");

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] p-4 md:p-8" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-[900] tracking-tight text-slate-800 flex items-center gap-4">
              <span className="p-2.5 bg-amber-500 rounded-2xl text-white shadow-lg shadow-amber-200">
                <Calculator size={32} />
              </span>
              Soroban Master
            </h1>
            <p className="text-slate-500 mt-2 font-bold opacity-80">{TOTAL_RODS}-Rod Professional Grade Simulator</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group flex-1 md:flex-none">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={20} />
              <input
                type="text"
                inputMode="numeric"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Enter numbers..."
                className="pl-12 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all w-full md:w-80 text-xl font-black text-slate-700"
              />
            </div>
            <button 
              onClick={clearAbacus}
              className="flex items-center gap-2 px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 font-black hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all shadow-sm active:scale-95"
              title="Reset Beads"
            >
              <RotateCcw size={20} />
              <span className="hidden md:inline">RESET</span>
            </button>
          </div>
        </header>

        {/* Main Abacus Frame */}
        <div className="relative">
            {/* Wooden Frame Wrapper */}
            <main className="relative bg-[#eeeae3] rounded-[40px] p-4 md:p-12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border-[16px] border-[#2d241e] overflow-x-auto custom-scrollbar">
            
            {/* Subtle Wood Grain Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/wood-pattern.png")` }} />
            
            <div className="flex items-end justify-center gap-1 md:gap-4 min-w-max px-4">
                {/* Generate 10 Rods Fixed */}
                {Array.from({ length: TOTAL_RODS }).reverse().map((_, idx) => {
                    const actualIndex = (TOTAL_RODS - 1) - idx;
                    return (
                        <Rod 
                            key={actualIndex} 
                            value={getRodValue(actualIndex)} 
                            label={placeValues[actualIndex]}
                            // Traditional marked rods for decimal points (every 3rd or specific indices)
                            isMarked={actualIndex % 3 === 0}
                        />
                    );
                })}
            </div>
            </main>
            
            {/* Brass Mounting Bolts (Decorative) */}
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-amber-700 rounded-full border-2 border-amber-900 shadow-inner z-30" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-700 rounded-full border-2 border-amber-900 shadow-inner z-30" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-amber-700 rounded-full border-2 border-amber-900 shadow-inner z-30" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-amber-700 rounded-full border-2 border-amber-900 shadow-inner z-30" />
        </div>

        {/* Footer Stats / Legend */}
        <div className="mt-8 flex flex-wrap justify-between items-center gap-4 text-slate-400 text-sm font-bold">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white border border-slate-300" />
                    <span>Uncounted</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-600 shadow-sm" />
                    <span>Counted (Touching Beam)</span>
                </div>
            </div>
            <p className="italic">
                Current total: <span className="text-slate-800 ml-1">{inputValue || "0"}</span>
            </p>
        </div>

        {/* Educational Section */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-amber-50/50 p-8 rounded-[32px] border border-amber-100">
            <h3 className="text-xl font-black text-amber-900 mb-4 flex items-center gap-2">
              <Info className="text-amber-500" /> The Soroban Layout
            </h3>
            <p className="text-amber-800/80 leading-relaxed font-bold">
              In a standard 10-rod abacus, the "rest" position is when all Heaven beads (upper) are up and Earth beads (lower) are down. 
              Values are only recorded when beads move <strong>towards the center beam</strong>.
            </p>
          </div>
          <div className="bg-slate-800 p-8 rounded-[32px] text-white shadow-xl shadow-slate-200">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-amber-400">
              <Calculator /> Mental Arithmetic
            </h3>
            <p className="text-slate-300 leading-relaxed font-medium">
              This layout allows for numbers up to 1 Arab. Practice visualizing the movement of the beads to improve calculation speed and concentration.
            </p>
          </div>
        </section>

        <footer className="mt-20 pb-10 text-center text-slate-300 text-xs font-black tracking-widest uppercase">
          Professional Learning Environment • {TOTAL_RODS} Rods • 1-4 Soroban System
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
        @media (max-width: 768px) {
            .custom-scrollbar {
                mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
            }
        }
      `}</style>
    </div>
  );
}