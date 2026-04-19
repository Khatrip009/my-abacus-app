import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { RotateCcw, Trophy, PlayCircle, CheckCircle2, AlertCircle, Hash } from 'lucide-react';

/**
 * BEAD COMPONENT (DRAGGABLE)
 */
const Bead = ({ active, isUpper = false, onDrag, position, colorClass }) => {
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
        w-10 h-6 md:w-12 md:h-7 rounded-full transition-shadow duration-200 cursor-grab active:cursor-grabbing
        ${active 
          ? `${colorClass} shadow-[inset_-2px_-4px_8px_rgba(0,0,0,0.4),0_3px_5px_rgba(0,0,0,0.2)]` 
          : 'bg-slate-50 shadow-[inset_-1px_-2px_4px_rgba(0,0,0,0.1)]'
        }
        border border-black/10 relative z-10 select-none
      `}
      style={{ 
        transform: `translateY(${position}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
    >
      <div className="absolute top-1 left-2 w-1/3 h-1/4 bg-white/30 rounded-full blur-[1px]" />
    </div>
  );
};

/**
 * ROD COMPONENT
 */
const Rod = ({ value, label, onChange, colorClass }) => {
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
    <div className="flex flex-col items-center">
      <div className="mb-1 h-10 flex flex-col items-center justify-end">
        <span className="text-[10px] uppercase font-bold text-slate-400">{label}</span>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black transition-all ${value > 0 ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-300'}`}>
          {value}
        </div>
      </div>

      <div className="relative bg-slate-200 p-1.5 rounded-xl border-2 border-slate-300 shadow-inner">
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-slate-400 -translate-x-1/2 rounded-full z-0" />
        <div className="h-10 flex items-start justify-center pt-1">
          <Bead position={positions.upper} active={value >= 5} isUpper={true} onDrag={handleUpperDrag} colorClass={colorClass} />
        </div>
        <div className="w-12 md:w-14 h-3 bg-stone-800 my-1 rounded-sm shadow-md relative z-20" />
        <div className="h-32 md:h-36 flex flex-col items-center pt-1 relative">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="absolute" style={{ top: `${i * (window.innerWidth < 768 ? 26 : 30) + 4}px` }}>
              <Bead position={positions.lower[i]} active={(value % 5) > i} onDrag={(pos) => handleLowerDrag(i, pos)} colorClass={colorClass} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * ABACUS COMPONENT (2 RODS)
 */
const Abacus = ({ value, label, onValueChange, colorClass, borderClass }) => {
  const tens = Math.floor(value / 10);
  const units = value % 10;

  return (
    <div className={`bg-white p-4 rounded-[32px] shadow-lg border-4 ${borderClass} flex flex-col items-center`}>
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">{label} Count</h3>
      <div className="flex gap-4 items-end bg-slate-50 p-4 rounded-3xl border border-slate-100 shadow-inner">
        <Rod value={tens} label="T" colorClass={colorClass} onChange={(v) => onValueChange(v * 10 + units)} />
        <Rod value={units} label="U" colorClass={colorClass} onChange={(v) => onValueChange(tens * 10 + v)} />
      </div>
      <div className="mt-4 bg-slate-800 text-white px-6 py-2 rounded-2xl font-black text-xl shadow-inner min-w-[80px] text-center">
        {value}
      </div>
    </div>
  );
};

export default function App() {
  const [counts, setCounts] = useState({ typeA: 0, typeB: 0, typeC: 0 });
  const [abacusValues, setAbacusValues] = useState({ typeA: 0, typeB: 0, typeC: 0 });
  const [objects, setObjects] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const objectTypes = [
    { id: 'typeA', emoji: '🍎', color: 'bg-rose-500', border: 'border-rose-200' },
    { id: 'typeB', emoji: '🍌', color: 'bg-amber-400', border: 'border-amber-200' },
    { id: 'typeC', emoji: '🍇', color: 'bg-purple-500', border: 'border-purple-200' }
  ];

  const generateChallenge = useCallback(() => {
    const cA = Math.floor(Math.random() * 20) + 1;
    const cB = Math.floor(Math.random() * 20) + 1;
    const cC = Math.floor(Math.random() * 20) + 1;
    
    setCounts({ typeA: cA, typeB: cB, typeC: cC });
    setAbacusValues({ typeA: 0, typeB: 0, typeC: 0 });
    setShowSuccess(false);
    setFeedback({ message: '', type: '' });

    const newObjects = [];
    const addBatch = (num, typeObj) => {
      for (let i = 0; i < num; i++) {
        newObjects.push({
          id: `${typeObj.id}-${i}`,
          emoji: typeObj.emoji,
          type: typeObj.id,
          x: Math.random() * 85 + 5,
          y: Math.random() * 85 + 5,
          rotate: Math.random() * 360,
          scale: 0.9 + Math.random() * 0.4
        });
      }
    };

    addBatch(cA, objectTypes[0]);
    addBatch(cB, objectTypes[1]);
    addBatch(cC, objectTypes[2]);

    // Shuffle array
    setObjects(newObjects.sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    generateChallenge();
  }, [generateChallenge]);

  const checkAnswers = () => {
    const isACorrect = abacusValues.typeA === counts.typeA;
    const isBCorrect = abacusValues.typeB === counts.typeB;
    const isCCorrect = abacusValues.typeC === counts.typeC;

    if (isACorrect && isBCorrect && isCCorrect) {
      setShowSuccess(true);
      setFeedback({ message: 'Wow! Expert counter! All three are correct!', type: 'success' });
    } else {
      let errorMsg = "Check your counts: ";
      const errors = [];
      if (!isACorrect) errors.push(objectTypes[0].emoji);
      if (!isBCorrect) errors.push(objectTypes[1].emoji);
      if (!isCCorrect) errors.push(objectTypes[2].emoji);
      
      setFeedback({ 
        message: `Almost! Check your count for: ${errors.join(' ')}`, 
        type: 'error' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 p-4 md:p-8 select-none" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="max-w-6xl mx-auto">
        
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-black text-sky-900 flex items-center justify-center gap-3">
            <Hash className="text-sky-500" /> Mixed Object Count
          </h1>
          <p className="text-sky-600 font-bold mt-2">Sort and count each type of fruit on the abacuses!</p>
        </header>

        {/* Play Area */}
        <div className="bg-white rounded-[40px] p-4 md:p-8 shadow-xl border-8 border-white relative overflow-hidden mb-10 h-[350px] md:h-[500px]">
          <div className="absolute inset-0 bg-emerald-50/30" />
          {objects.map((obj) => (
            <div
              key={obj.id}
              className="absolute transition-transform hover:scale-125 cursor-default"
              style={{
                left: `${obj.x}%`,
                top: `${obj.y}%`,
                transform: `translate(-50%, -50%) rotate(${obj.rotate}deg) scale(${obj.scale})`,
                fontSize: window.innerWidth < 768 ? '1.5rem' : '2.5rem'
              }}
            >
              {obj.emoji}
            </div>
          ))}
          
          {showSuccess && (
            <div className="absolute inset-0 bg-sky-600/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white p-6 text-center animate-in zoom-in duration-500">
              <Trophy size={100} className="text-amber-400 mb-4 animate-bounce" />
              <h2 className="text-4xl md:text-6xl font-black mb-4">AWESOME!</h2>
              <div className="flex gap-4 md:gap-8 mb-8 bg-white/20 p-6 rounded-[32px]">
                {objectTypes.map(t => (
                  <div key={t.id} className="flex flex-col items-center">
                    <span className="text-3xl md:text-5xl">{t.emoji}</span>
                    <span className="text-2xl font-black">{counts[t.id]}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={generateChallenge}
                className="bg-white text-sky-600 px-10 py-5 rounded-[24px] font-black text-2xl hover:bg-amber-400 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center gap-3"
              >
                <PlayCircle size={32} /> PLAY AGAIN
              </button>
            </div>
          )}
        </div>

        {/* Abacus Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {objectTypes.map((type) => (
            <Abacus 
              key={type.id}
              label={type.emoji}
              colorClass={type.color}
              borderClass={type.border}
              value={abacusValues[type.id]}
              onValueChange={(val) => {
                setAbacusValues(prev => ({ ...prev, [type.id]: val }));
                if (feedback.message) setFeedback({ message: '', type: '' });
              }}
            />
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={checkAnswers}
            disabled={showSuccess}
            className={`w-full max-w-md py-5 rounded-[24px] font-black text-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl ${
              showSuccess 
              ? 'bg-emerald-500 text-white opacity-50' 
              : 'bg-sky-600 hover:bg-sky-700 text-white'
            }`}
          >
            <CheckCircle2 size={32} /> CHECK ANSWERS
          </button>

          {feedback.message && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 text-lg font-bold animate-in slide-in-from-top-4 ${
              feedback.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {feedback.type === 'success' ? <Trophy size={24} /> : <AlertCircle size={24} />}
              {feedback.message}
            </div>
          )}

          <button 
            onClick={generateChallenge}
            className="mt-4 flex items-center gap-2 text-sky-500 font-black hover:text-sky-700 transition-colors"
          >
            <RotateCcw size={20} /> Reset Challenge
          </button>
        </div>

        <footer className="mt-20 pb-10 text-center text-sky-300 text-xs font-black uppercase tracking-[0.2em]">
          Interactive Counting Activity • 2-Rod Abacus Practice
        </footer>
      </div>

      <style>{`
        .animate-in { animation: fadeInScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        body { overscroll-behavior: contain; touch-action: manipulation; }
      `}</style>
    </div>
  );
}