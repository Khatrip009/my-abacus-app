import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Info, Calculator, RotateCcw, Trophy, PlayCircle, Star, Sparkles } from 'lucide-react';

/**
 * BEAD COMPONENT (DRAGGABLE)
 */
const Bead = ({ active, isUpper = false, onDrag, position }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startPos = useRef(0);

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
      
      let newPos = startPos.current + delta;
      if (newPos < 0) newPos = 0;
      if (newPos > TRAVEL_DISTANCE) newPos = TRAVEL_DISTANCE;

      onDrag(newPos);
    };

    const handleUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      document.body.style.userSelect = 'auto';
      const snapped = position > (TRAVEL_DISTANCE / 2) ? TRAVEL_DISTANCE : 0;
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
        w-12 h-7 md:w-14 md:h-8 rounded-full transition-shadow duration-200 cursor-grab active:cursor-grabbing
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
const Rod = ({ value, label, onChange }) => {
  const [positions, setPositions] = useState({ upper: 0, lower: [32, 32, 32, 32] });

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
    const updatedLower = [...positions.lower];
    if (isNowActive) {
      for (let i = 0; i <= beadIdx; i++) updatedLower[i] = 0;
    } else {
      for (let i = beadIdx; i < 4; i++) updatedLower[i] = 32;
    }
    const newLowerCount = updatedLower.filter(p => p === 0).length;
    const newVal = (value >= 5 ? 5 : 0) + newLowerCount;
    onChange(newVal);
  };

  return (
    <div className="flex flex-col items-center group" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="mb-4 h-16 flex flex-col items-center justify-end">
        <span className="text-xs uppercase tracking-widest text-slate-400 font-black mb-1">
          {label}
        </span>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl font-black transition-all ${value > 0 ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-100 text-slate-300'}`}>
          {value}
        </div>
      </div>

      <div className="relative bg-stone-200/50 p-3 rounded-2xl border-4 border-stone-300 shadow-inner">
        <div className="absolute left-1/2 top-0 bottom-0 w-1.5 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 -translate-x-1/2 rounded-full z-0" />

        <div className="h-14 flex items-start justify-center pt-1">
          <Bead 
            position={positions.upper} 
            active={value >= 5} 
            isUpper={true} 
            onDrag={handleUpperDrag} 
          />
        </div>

        <div className="w-16 md:w-20 h-4 bg-stone-900 my-2 rounded-md shadow-xl relative z-20" />

        <div className="h-48 flex flex-col items-center pt-1 relative">
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
  const [rodValues, setRodValues] = useState([0, 0]); 
  const [challengeCount, setChallengeCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [objects, setObjects] = useState([]);
  const [currentEmoji, setCurrentEmoji] = useState('⭐');

  const emojis = [
    '🚀', '🦖', '🍦', '🍕', '🐱', '🦄', '👾', 
    '🎈', '🍩', '🦋', '🤖', '🐯', '🍓', '🚗'
  ];

  const currentCount = useMemo(() => {
    return rodValues[1] * 10 + rodValues[0];
  }, [rodValues]);

  const generateNewChallenge = useCallback(() => {
    // UPDATED: Now generates between 1 and 20 objects
    const num = Math.floor(Math.random() * 20) + 1; 
    setChallengeCount(num);
    setRodValues([0, 0]);
    setShowSuccess(false);
    
    setCurrentEmoji(emojis[Math.floor(Math.random() * emojis.length)]);

    // Generate fixed random positions for objects
    const newObjects = Array.from({ length: num }).map((_, i) => ({
      id: i,
      x: Math.random() * 80 + 10, // More central spread for fewer objects
      y: Math.random() * 75 + 10,
      rotate: Math.random() * 30 - 15,
      scale: 1.3 + Math.random() * 0.4 // Even bigger scale for 20 max items
    }));
    setObjects(newObjects);
  }, []);

  useEffect(() => {
    generateNewChallenge();
  }, [generateNewChallenge]);

  const handleRodChange = (index, val) => {
    const newValues = [...rodValues];
    newValues[index] = val;
    setRodValues(newValues);

    const total = index === 1 ? (val * 10 + newValues[0]) : (newValues[1] * 10 + val);
    if (total === challengeCount) {
        setShowSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 text-slate-800 p-4 md:p-8" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-[900] text-indigo-900 flex items-center justify-center gap-4">
                <Sparkles className="text-amber-500 animate-pulse" />
                Counting Quest
                <Sparkles className="text-amber-500 animate-pulse" />
            </h1>
            <p className="text-indigo-600 font-bold text-lg mt-2">Count up to 20! Show the number on your Abacus.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Left Side: The Counting Area */}
            <div className="bg-white rounded-[40px] p-6 shadow-2xl border-8 border-indigo-200 relative min-h-[400px]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-black text-indigo-900 flex items-center gap-2">
                        <Star className="fill-amber-400 text-amber-400" />
                        Count carefully...
                    </h2>
                    <button 
                        onClick={generateNewChallenge}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-xl transition-all font-bold active:scale-95"
                    >
                        <RotateCcw size={20} />
                        New Challenge
                    </button>
                </div>
                
                <div className="relative w-full h-[450px] bg-slate-50 rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 shadow-inner">
                    {objects.map((obj) => (
                        <div 
                            key={obj.id}
                            className="absolute select-none pointer-events-none drop-shadow-md"
                            style={{
                                left: `${obj.x}%`,
                                top: `${obj.y}%`,
                                transform: `rotate(${obj.rotate}deg) scale(${obj.scale})`,
                                fontSize: '3.5rem' // Increased size for better visibility with max 20
                            }}
                        >
                            {currentEmoji}
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-center h-14">
                    {showSuccess ? (
                        <div className="bg-green-500 text-white px-8 py-3 rounded-full font-black text-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                            Total Counted: <span className="bg-white text-green-600 w-10 h-10 rounded-full flex items-center justify-center">{challengeCount}</span>
                        </div>
                    ) : (
                        <div className="text-slate-400 font-bold italic flex items-center gap-2">
                            Set the abacus to see the total!
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side: 2-Rod Abacus */}
            <div className="flex flex-col items-center">
                <div className="relative">
                    <main className="bg-[#eeeae3] rounded-[48px] p-10 md:p-16 shadow-2xl border-[20px] border-[#2d241e]">
                        <div className="flex items-end justify-center gap-12 md:gap-20">
                            <Rod 
                                value={rodValues[1]} 
                                label="Tens"
                                onChange={(val) => handleRodChange(1, val)}
                            />
                            <Rod 
                                value={rodValues[0]} 
                                label="Units"
                                onChange={(val) => handleRodChange(0, val)}
                            />
                        </div>
                    </main>

                    {/* Feedback Overlay */}
                    {showSuccess && (
                        <div className="absolute inset-0 bg-indigo-600/90 backdrop-blur-md rounded-[48px] z-50 flex flex-col items-center justify-center text-white p-8 text-center animate-in zoom-in duration-500">
                            <Trophy size={100} className="text-amber-400 mb-6" />
                            <h2 className="text-5xl font-black mb-2">YOU GOT IT!</h2>
                            <p className="text-xl font-bold opacity-90 mb-8">That's exactly {challengeCount}!</p>
                            <button 
                                onClick={generateNewChallenge}
                                className="flex items-center gap-3 bg-white text-indigo-600 px-10 py-5 rounded-3xl font-black text-2xl hover:bg-amber-400 hover:text-white transition-all shadow-xl active:scale-95"
                            >
                                <PlayCircle size={32} />
                                PLAY AGAIN
                            </button>
                        </div>
                    )}
                </div>

                {/* Big Result Display */}
                <div className="mt-8 flex items-center gap-4">
                    <div className="bg-white px-10 py-6 rounded-[32px] shadow-xl border-4 border-indigo-200 text-center min-w-[200px]">
                        <span className="text-slate-400 font-black uppercase text-xs block mb-1">Abacus Number</span>
                        <span className="text-7xl font-[900] text-indigo-600 tracking-tighter">{currentCount}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Instructions */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/60 p-6 rounded-3xl flex items-start gap-4 border border-white">
                <div className="p-3 bg-amber-500 rounded-2xl text-white">
                    <Calculator size={24} />
                </div>
                <div>
                    <h4 className="font-black text-indigo-900">Step 1: Count</h4>
                    <p className="text-sm text-slate-600 font-bold">Count all the {currentEmoji}s in the box on the left. You can point at them with your finger!</p>
                </div>
            </div>
            <div className="bg-white/60 p-6 rounded-3xl flex items-start gap-4 border border-white">
                <div className="p-3 bg-indigo-500 rounded-2xl text-white">
                    <Info size={24} />
                </div>
                <div>
                    <h4 className="font-black text-indigo-900">Step 2: Abacus</h4>
                    <p className="text-sm text-slate-600 font-bold">Slide the beads to match your count. The number at the bottom will change as you move them!</p>
                </div>
            </div>
        </section>

        <footer className="mt-16 pb-10 text-center text-indigo-300 text-xs font-black tracking-widest uppercase">
          Max 20 Items • Extra Large Emojis • Kid-Friendly Focus
        </footer>
      </div>

      <style>{`
        .animate-in {
            animation: fadeInScale 0.5s ease-out forwards;
        }
        @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        .fade-in { animation: fadeIn 0.3s ease-in; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}