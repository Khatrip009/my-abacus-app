// src/pages/OneDigitNoFormulaWorksheet.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { generateWorksheet } from '../utils/abacusSimulation';
import { Loader2, CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react';

const OneDigitNoFormulaWorksheet = () => {
  const { user, userDetails } = useAuth();
  const [problems, setProblems] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [stars, setStars] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const startTimeRef = useRef(Date.now());
  const [worksheetId, setWorksheetId] = useState(null);

  const generateNewWorksheet = async () => {
    setGenerating(true);
    const newProblems = generateWorksheet(null); // null = no formula allowed
    setProblems(newProblems);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setStars(0);
    setWorksheetId(null);
    startTimeRef.current = Date.now();
    setGenerating(false);
  };

  useEffect(() => {
    generateNewWorksheet();
  }, []);

  const handleAnswerChange = (index, value) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [index]: value }));
  };

  const calculateStars = (correct, total, timeSeconds) => {
    if (correct === total) return 3;
    if (correct >= total - 5) return 2;
    if (correct >= total - 10) return 1;
    return 0;
  };

  const handleSubmit = async () => {
    if (submitted) return;
    setLoading(true);

    let correct = 0;
    problems.forEach((prob, idx) => {
      if (parseInt(answers[idx]) === prob.answer) correct++;
    });
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const earnedStars = calculateStars(correct, problems.length, timeTaken);
    setScore(correct);
    setStars(earnedStars);
    setSubmitted(true);

    try {
      const { data: worksheetData, error: worksheetError } = await supabase
        .from('worksheets')
        .insert({
          user_id: userDetails.id,
          worksheet_type: '1_digit_chain',
          questions: { problems, formula: null },
        })
        .select()
        .single();

      if (worksheetError) throw worksheetError;
      setWorksheetId(worksheetData.id);

      const { error: resultError } = await supabase
        .from('worksheet_results')
        .insert({
          worksheet_id: worksheetData.id,
          user_id: userDetails.id,
          score: correct,
          total_questions: problems.length,
          time_taken_seconds: timeTaken,
          stars_earned: earnedStars,
        });

      if (resultError) throw resultError;

      await supabase.rpc('increment_user_stats', {
        p_user_id: userDetails.id,
        p_stars: earnedStars,
        p_points: correct * 2,
      });

    } catch (err) {
      console.error('Error saving worksheet:', err);
      alert('Failed to save results.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    generateNewWorksheet();
  };

  if (!problems.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#E2592D]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-black text-[#1A1A1A] mb-2">🧮 Direct 1‑Digit Sums</h1>
        <p className="text-[#555555]">No formulas · pure direct moves · 6‑number chains</p>

        <div className="flex gap-4 items-center mt-6">
          <button
            onClick={handleReset}
            disabled={generating}
            className="flex items-center gap-2 px-6 py-2 bg-[#E2592D] text-white rounded-lg hover:bg-[#C94E26] disabled:opacity-50"
          >
            <RotateCcw size={18} />
            {generating ? 'Generating...' : 'New Worksheet'}
          </button>
          {!submitted && (
            <button
              onClick={handleSubmit}
              disabled={loading || Object.keys(answers).length < problems.length}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle size={18} />
              Submit Answers
            </button>
          )}
        </div>

        {submitted && (
          <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-4">
            <Trophy className="text-yellow-600" size={32} />
            <div>
              <p className="font-bold text-lg">Score: {score} / {problems.length}</p>
              <p className="text-sm">Stars earned: {'⭐'.repeat(stars)}</p>
            </div>
            <button
              onClick={handleReset}
              className="ml-auto px-4 py-2 bg-[#E2592D] text-white rounded-lg"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {problems.map((prob, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-md p-4 border">
            <div className="flex justify-between items-center mb-2">
              <span className="bg-[#FDE3DA] text-[#E2592D] font-bold w-8 h-8 flex items-center justify-center rounded-full">
                {idx + 1}
              </span>
              {submitted && (
                parseInt(answers[idx]) === prob.answer
                  ? <CheckCircle className="text-green-500" size={20} />
                  : <XCircle className="text-red-500" size={20} />
              )}
            </div>
            <div className="font-mono text-right space-y-1 bg-slate-50 p-3 rounded-lg">
              <div className="text-xl font-bold">{prob.numbers[0]}</div>
              {prob.ops.map((op, i) => (
                <div key={i} className="flex justify-end gap-2">
                  <span className="w-6 text-left">{op}</span>
                  <span className="w-12 text-right">{prob.numbers[i+1]}</span>
                </div>
              ))}
              <hr className="my-2 border-slate-300" />
              <div className="flex justify-end items-center gap-2">
                <span className="font-medium">=</span>
                <input
                  type="number"
                  value={answers[idx] || ''}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  disabled={submitted}
                  className={`w-20 px-2 py-1 border rounded text-right ${
                    submitted
                      ? parseInt(answers[idx]) === prob.answer
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="?"
                />
              </div>
              {submitted && parseInt(answers[idx]) !== prob.answer && (
                <div className="text-xs text-red-500 mt-1">
                  Correct: {prob.answer}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OneDigitNoFormulaWorksheet;