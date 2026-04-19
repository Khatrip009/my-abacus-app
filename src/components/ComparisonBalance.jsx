import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Info, Calculator, RotateCcw, Trophy, PlayCircle, Star, Sparkles, Scale, CheckCircle2, AlertCircle } from 'lucide-react';

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
        w-10 h-6 md:w-14 md:h-8 rounded-full transition-shadow duration-200 cursor-grab active:cursor-grabbing
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
      <div className="absolute top-1 left-2 md:left-3 w-1/3 h-1/4 bg-white/30 rounded-full blur-[1px]" />
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
      <div className="mb-2 md:mb-4 h-12 md:h-16 flex flex-col items-center justify-end">
        <span className="text-[10px] md:text-xs uppercase tracking-widest text-slate-400 font-black mb-1">
          {label}
        </span>
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-lg md:text-2xl font-black transition-all ${value > 0 ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-100 text-slate-300'}`}>
          {value}
        </div>
      </div>

      <div className="relative bg-stone-200/50 p-2 md:p-3 rounded-xl md:rounded-2xl border-2 md:border-4 border-stone-300 shadow-inner">
        <div className="absolute left-1/2 top-0 bottom-0 w-1 md:w-1.5 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 -translate-x-1/2 rounded-full z-0" />

        <div className="h-10 md:h-14 flex items-start justify-center pt-1">
          <Bead 
            position={positions.upper} 
            active={value >= 5} 
            isUpper={true} 
            onDrag={handleUpperDrag} 
          />
        </div>

        <div className="w-12 md:w-20 h-3 md:h-4 bg-stone-900 my-1 md:my-2 rounded-sm md:rounded-md shadow-xl relative z-20" />

        <div className="h-36 md:h-48 flex flex-col items-center pt-1 relative">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="absolute" style={{ top: `${i * (window.innerWidth < 768 ? 26 : 32) + 8}px` }}>
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
  const [counts, setCounts] = useState({ left: 0, right: 0 });
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [objects, setObjects] = useState({ left: [], right: [] });
  const [currentEmoji, setCurrentEmoji] = useState('⭐');

  const emojis = ['🚀', '🦖', '🍦', '🍕', '🐱', '🦄', '👾', '🎈', '🍩', '🦋', '🤖', '🐯', '🍓', '🚗'];

  const currentAbacusValue = useMemo(() => {
    return rodValues[1] * 10 + rodValues[0];
  }, [rodValues]);

  const targetDifference = useMemo(() => {
    return Math.abs(counts.left - counts.right);
  }, [counts]);

  const targetSymbol = useMemo(() => {
    if (counts.left > counts.right) return '>';
    if (counts.left < counts.right) return '<';
    return '=';
  }, [counts]);

  const generateNewChallenge = useCallback(() => {
    const numLeft = Math.floor(Math.random() * 15) + 1;
    const numRight = Math.floor(Math.random() * 15) + 1;
    
    setCounts({ left: numLeft, right: numRight });
    setRodValues([0, 0]);
    setSelectedSymbol(null);
    setShowSuccess(false);
    setFeedback({ message: '', type: '' });
    
    setCurrentEmoji(emojis[Math.floor(Math.random() * emojis.length)]);

    const createObjects = (num) => Array.from({ length: num }).map((_, i) => ({
      id: i,
      x: Math.random() * 75 + 12,
      y: Math.random() * 70 + 15,
      rotate: Math.random() * 30 - 15,
      scale: 1.0 + Math.random() * 0.3
    }));

    setObjects({
      left: createObjects(numLeft),
      right: createObjects(numRight)
    });
  }, []);

  useEffect(() => {
    generateNewChallenge();
  }, [generateNewChallenge]);

  const handleCheckAnswer = () => {
    if (selectedSymbol === null) {
      setFeedback({ message: 'Pick a symbol first!', type: 'error' });
      return;
    }

    const isSymbolCorrect = selectedSymbol === targetSymbol;
    const isAbacusCorrect = currentAbacusValue === targetDifference;

    if (isSymbolCorrect && isAbacusCorrect) {
      setShowSuccess(true);
      setFeedback({ message: 'Perfect! You got it right!', type: 'success' });
    } else if (!isSymbolCorrect && !isAbacusCorrect) {
      setFeedback({ message: 'Check both the symbol and the count!', type: 'error' });
    } else if (!isSymbolCorrect) {
      setFeedback({ message: 'Count is right! Check the symbol.', type: 'error' });
    } else {
      setFeedback({ message: 'Symbol is right! Check the abacus.', type: 'error' });
    }
  };

  const handleRodChange = (index, val) => {
    const newValues = [...rodValues];
    newValues[index] = val;
    setRodValues(newValues);
    if (feedback.message) setFeedback({ message: '', type: '' });
  };

  const handleSymbolSelect = (sym) => {
    setSelectedSymbol(sym);
    if (feedback.message) setFeedback({ message: '', type: '' });
  };

  return (
    <div className="min-h-screen bg-indigo-50 text-slate-800 p-3 md:p-8 overflow-x-hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="text-center mb-6 md:mb-10">
            <h1 className="text-3xl md:text-5xl font-[900] text-indigo-900 flex items-center justify-center gap-3 md:gap-4">
                <Scale className="text-amber-500 w-8 h-8 md:w-12 md:h-12" />
                <span className="leading-tight">Comparison Balance</span>
                <Scale className="text-amber-500 w-8 h-8 md:w-12 md:h-12" />
            </h1>
            <p className="text-indigo-600 font-bold text-sm md:text-lg mt-2 px-4">Count both sides and show the difference!</p>
        </header>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 md:gap-6 items-stretch">
            
            {/* Left Box */}
            <div className="lg:col-span-4 bg-white rounded-[30px] md:rounded-[40px] p-4 md:p-6 shadow-lg border-4 md:border-8 border-rose-200 order-1">
                <div className="flex justify-between items-center mb-3">
                    <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full font-black uppercase text-[10px] md:text-xs tracking-wider">Side A</span>
                    {showSuccess && <span className="text-rose-500 font-black text-xl md:text-2xl animate-bounce">{counts.left}</span>}
                </div>
                <div className="relative w-full h-[200px] md:h-[300px] bg-rose-50/30 rounded-2xl md:rounded-3xl overflow-hidden border-2 border-dashed border-rose-100">
                    {objects.left.map((obj) => (
                        <div key={`left-${obj.id}`} className="absolute select-none pointer-events-none" style={{ left: `${obj.x}%`, top: `${obj.y}%`, transform: `rotate(${obj.rotate}deg) scale(${obj.scale})`, fontSize: window.innerWidth < 768 ? '1.8rem' : '2.5rem' }}>
                            {currentEmoji}
                        </div>
                    ))}
                </div>
            </div>

            {/* Middle Controls */}
            <div className="lg:col-span-4 flex flex-col items-center gap-4 md:gap-6 order-2 lg:order-2">
                <div className="bg-white p-5 md:p-6 rounded-[30px] md:rounded-[40px] shadow-xl border-4 border-indigo-200 w-full flex flex-col items-center">
                    <h3 className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">Which side has more?</h3>
                    <div className="flex gap-2 md:gap-4 mb-4 md:mb-6">
                        {['<', '=', '>'].map((sym) => (
                            <button
                                key={sym}
                                onClick={() => handleSymbolSelect(sym)}
                                className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl text-2xl md:text-3xl font-black transition-all flex items-center justify-center ${
                                    selectedSymbol === sym 
                                    ? 'bg-indigo-600 text-white shadow-lg scale-105 md:scale-110' 
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                }`}
                            >
                                {sym}
                            </button>
                        ))}
                    </div>

                    <div className="w-full h-px bg-slate-100 mb-4 md:mb-6" />

                    <h3 className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-widest mb-2">What is the difference?</h3>
                    <div className="bg-indigo-50 px-6 py-3 md:px-8 md:py-4 rounded-2xl md:rounded-3xl border-2 border-indigo-100 text-center mb-4 md:mb-6">
                        <span className="text-3xl md:text-4xl font-black text-indigo-600">{currentAbacusValue}</span>
                    </div>

                    <button 
                        onClick={handleCheckAnswer}
                        disabled={showSuccess}
                        className={`w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-lg md:text-xl flex items-center justify-center gap-2 md:gap-3 transition-all active:scale-95 shadow-md ${
                            showSuccess 
                            ? 'bg-emerald-500 text-white opacity-50 cursor-not-allowed' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                    >
                        <CheckCircle2 size={window.innerWidth < 768 ? 20 : 24} />
                        Check Answer
                    </button>

                    {feedback.message && (
                        <div className={`mt-3 p-3 rounded-lg md:rounded-xl flex items-center gap-2 text-xs md:text-sm font-bold w-full animate-in slide-in-from-top-2 duration-300 ${
                            feedback.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                            {feedback.type === 'success' ? <Trophy size={16} /> : <AlertCircle size={16} />}
                            {feedback.message}
                        </div>
                    )}
                </div>

                <button 
                    onClick={generateNewChallenge}
                    className="flex items-center gap-2 md:gap-3 px-6 py-3 md:px-8 md:py-4 bg-amber-400 hover:bg-amber-500 text-white rounded-xl md:rounded-2xl transition-all font-black shadow-md active:scale-95 text-lg md:text-xl w-full lg:w-auto justify-center"
                >
                    <RotateCcw size={window.innerWidth < 768 ? 20 : 24} />
                    New Challenge
                </button>
            </div>

            {/* Right Box */}
            <div className="lg:col-span-4 bg-white rounded-[30px] md:rounded-[40px] p-4 md:p-6 shadow-lg border-4 md:border-8 border-emerald-200 order-3">
                <div className="flex justify-between items-center mb-3">
                    <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full font-black uppercase text-[10px] md:text-xs tracking-wider">Side B</span>
                    {showSuccess && <span className="text-emerald-500 font-black text-xl md:text-2xl animate-bounce">{counts.right}</span>}
                </div>
                <div className="relative w-full h-[200px] md:h-[300px] bg-emerald-50/30 rounded-2xl md:rounded-3xl overflow-hidden border-2 border-dashed border-emerald-100">
                    {objects.right.map((obj) => (
                        <div key={`right-${obj.id}`} className="absolute select-none pointer-events-none" style={{ left: `${obj.x}%`, top: `${obj.y}%`, transform: `rotate(${obj.rotate}deg) scale(${obj.scale})`, fontSize: window.innerWidth < 768 ? '1.8rem' : '2.5rem' }}>
                            {currentEmoji}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Section: Abacus */}
            <div className="lg:col-span-12 flex justify-center mt-4 md:mt-10 order-4">
                <div className="relative w-full max-w-lg md:max-w-none md:w-auto">
                    <main className="bg-[#eeeae3] rounded-[30px] md:rounded-[48px] p-5 md:p-12 shadow-2xl border-[10px] md:border-[16px] border-[#2d241e]">
                        <div className="flex items-end justify-center gap-6 md:gap-16">
                            <Rod value={rodValues[1]} label="Tens" onChange={(val) => handleRodChange(1, val)} />
                            <Rod value={rodValues[0]} label="Units" onChange={(val) => handleRodChange(0, val)} />
                        </div>
                    </main>

                    {/* Success Overlay */}
                    {showSuccess && (
                        <div className="absolute inset-0 bg-indigo-600/90 backdrop-blur-md rounded-[30px] md:rounded-[48px] z-50 flex flex-col items-center justify-center text-white p-6 md:p-8 text-center animate-in zoom-in duration-500">
                            <Trophy className="text-amber-400 mb-2 md:mb-4 w-12 h-12 md:w-20 md:h-20" />
                            <h2 className="text-2xl md:text-4xl font-black mb-2">PERFECT!</h2>
                            <div className="text-lg md:text-2xl font-bold flex items-center gap-2 md:gap-4 bg-white/20 px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl mb-4 md:mb-6">
                                <span>{counts.left}</span>
                                <span className="text-amber-300 text-xl md:text-3xl">{targetSymbol}</span>
                                <span>{counts.right}</span>
                                <span className="ml-2 md:ml-4 border-l border-white/30 pl-2 md:pl-4 text-sm md:text-xl">Gap: {targetDifference}</span>
                            </div>
                            <button 
                                onClick={generateNewChallenge}
                                className="flex items-center gap-2 md:gap-3 bg-white text-indigo-600 px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-black text-lg md:text-xl hover:bg-amber-400 hover:text-white transition-all shadow-xl active:scale-95"
                            >
                                <PlayCircle size={20} md={24} />
                                NEXT LEVEL
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Responsive Instructions Grid */}
        <section className="mt-10 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white/60 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white">
                <h4 className="font-black text-rose-600 mb-1 md:mb-2 text-sm md:text-base">1. Count Both Sides</h4>
                <p className="text-[11px] md:text-sm text-slate-600 font-bold leading-relaxed">Count the items on Side A and Side B. Which side has more?</p>
            </div>
            <div className="bg-white/60 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white">
                <h4 className="font-black text-indigo-600 mb-1 md:mb-2 text-sm md:text-base">2. Pick a Symbol</h4>
                <p className="text-[11px] md:text-sm text-slate-600 font-bold leading-relaxed">Is Side A Greater Than (&gt;), Less Than (&lt;), or Equal (=) to Side B?</p>
            </div>
            <div className="bg-white/60 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white sm:col-span-2 lg:col-span-1">
                <h4 className="font-black text-emerald-600 mb-1 md:mb-2 text-sm md:text-base">3. Find the Gap</h4>
                <p className="text-[11px] md:text-sm text-slate-600 font-bold leading-relaxed">Use the abacus to show how many more items the bigger side has.</p>
            </div>
        </section>

        <footer className="mt-12 md:mt-20 pb-8 text-center text-indigo-300 text-[10px] md:text-xs font-black tracking-widest uppercase">
          Comparison Logic • Math Balance • Interactive Abacus
        </footer>
      </div>

      <style>{`
        .animate-in { animation: fadeInScale 0.5s ease-out forwards; }
        @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        /* Prevents bounce scroll on iOS when dragging beads */
        body { 
          overscroll-behavior: contain; 
          touch-action: pan-y;
        }
      `}</style>
    </div>
  );
}