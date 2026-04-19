// src/pages/Worksheets.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { generateWorksheet, generateTwoDigitWorksheet } from '../utils/abacusSimulation';
import { sendNotification, NotificationTemplates } from '../utils/notifications';
import {
  Loader2, CheckCircle, XCircle, RotateCcw, Trophy,
  Clock, Printer, AlertTriangle, Check, X, Smartphone, Monitor
} from 'lucide-react';

// ---------- Multiplication Worksheet Generator ----------
const generateMultiplicationWorksheet = (count = 25) => {
  const problems = [];
  for (let i = 0; i < count; i++) {
    const twoDigit = Math.floor(Math.random() * 90) + 10;
    const oneDigit = Math.floor(Math.random() * 8) + 2;
    problems.push({
      multiplicand: twoDigit,
      multiplier: oneDigit,
      answer: twoDigit * oneDigit,
    });
  }
  return problems;
};

// ---------- Printable Component ----------
const PrintableWorksheet = React.forwardRef((props, ref) => {
  const { studentData, worksheetType, problems, answers, submitted, score, stars, timeTaken } = props;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTitle = () => {
    if (worksheetType === '1') return '1-Digit Direct Sums';
    if (worksheetType === '2') return '2-Digit Direct Sums';
    return 'Multiplication (2-Digit × 1-Digit)';
  };

  return (
    <div ref={ref} className="p-4 bg-white" style={{ fontFamily: 'Nunito, sans-serif' }}>
      <style>{`
        @media print {
          @page { margin: 0.3in; }
          body { margin: 0; padding: 0; }
          .print-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
          .print-card { break-inside: avoid; border: 1px solid #ccc; padding: 6px; border-radius: 8px; }
          .print-header { margin-bottom: 16px; }
        }
      `}</style>

      <div className="print-header border-b-2 border-[#E2592D] pb-3 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/braincity_logo.png" alt="BrainCity" className="h-12 w-auto" />
            <div>
              <h1 className="text-2xl font-black text-[#1A1A1A]">BrainCity</h1>
              <p className="text-xs text-gray-500">One Stop Math Solution</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-sm">{studentData?.child_name || 'Student'}</p>
            <p className="text-xs">Standard: {studentData?.standard || 'N/A'}</p>
            <p className="text-xs">School: {studentData?.school_name || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-bold">{getTitle()} (No Formulas)</h2>
        <div className="text-right text-sm">
          <p>Date: {new Date().toLocaleDateString()}</p>
          {submitted && (
            <>
              <p className="font-bold">Score: {score} / 25</p>
              <p>Stars: {'⭐'.repeat(stars)}</p>
              <p>Time: {formatTime(timeTaken)}</p>
            </>
          )}
        </div>
      </div>

      <div className="print-grid">
        {problems.map((prob, idx) => {
          const userAnswer = answers[idx];
          const correctAnswer = worksheetType === 'multiply' ? prob.answer : prob.answer;
          const isCorrect = submitted && parseInt(userAnswer) === correctAnswer;

          return (
            <div key={idx} className="print-card">
              <div className="flex justify-between items-center mb-1">
                <span className="bg-gray-200 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                {submitted && (
                  isCorrect ? <CheckCircle size={12} className="text-green-600" /> : <XCircle size={12} className="text-red-600" />
                )}
              </div>
              <div className="font-mono text-right text-xs space-y-0.5">
                {worksheetType === 'multiply' ? (
                  <>
                    <div className="font-bold">{prob.multiplicand}</div>
                    <div className="flex justify-end items-center gap-1">
                      <span className="text-base">×</span>
                      <span className="font-bold">{prob.multiplier}</span>
                    </div>
                    <hr className="my-1" />
                    <div className="flex justify-end items-center gap-1">
                      <span>=</span>
                      <span className={`w-16 px-1 py-0.5 border rounded text-right ${
                        submitted
                          ? isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                          : 'border-gray-300'
                      }`}>
                        {userAnswer || ''}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-bold">{prob.numbers[0]}</div>
                    {prob.ops.map((op, i) => (
                      <div key={i} className="flex justify-end gap-1">
                        <span className="w-4">{op}</span>
                        <span className="w-6">{prob.numbers[i+1]}</span>
                      </div>
                    ))}
                    <hr className="my-1" />
                    <div className="flex justify-end items-center gap-1">
                      <span>=</span>
                      <span className={`w-12 px-1 py-0.5 border rounded text-right ${
                        submitted
                          ? isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                          : 'border-gray-300'
                      }`}>
                        {userAnswer || ''}
                      </span>
                    </div>
                  </>
                )}
                {submitted && !isCorrect && (
                  <div className="text-xs text-red-600">Ans: {correctAnswer}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-center text-xs text-gray-400 border-t pt-2">
        Generated by BrainCity Learning Platform · {new Date().toLocaleString()}
      </div>
    </div>
  );
});

// ---------- Main Component ----------
const Worksheets = () => {
  const { userDetails, studentData } = useAuth();
  const [worksheetType, setWorksheetType] = useState('1');
  const [problems, setProblems] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [stars, setStars] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(true);
  const [timer, setTimer] = useState(0);
  const timerInterval = useRef(null);
  const printRef = useRef();
  const [timeTaken, setTimeTaken] = useState(0);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [sendingEmail, setSendingEmail] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (timerInterval.current) clearInterval(timerInterval.current);
    timerInterval.current = setInterval(() => setTimer(prev => prev + 1), 1000);
  };

  const stopTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  };

  const resetTimer = () => {
    stopTimer();
    setTimer(0);
  };

  const generateNewWorksheet = useCallback(() => {
    setGenerating(true);
    setError(null);
    stopTimer();
    resetTimer();

    try {
      let newProblems;
      if (worksheetType === '1') {
        newProblems = generateWorksheet(null, 25);
      } else if (worksheetType === '2') {
        newProblems = generateTwoDigitWorksheet(25);
      } else {
        newProblems = generateMultiplicationWorksheet(25);
      }

      if (!newProblems || newProblems.length === 0) throw new Error('No problems generated');
      setProblems(newProblems);
      setAnswers({});
      setSubmitted(false);
      setScore(null);
      setStars(0);
      setTimeTaken(0);
      startTimer();
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message);
      showToast('Failed to generate worksheet. Using fallback.', 'error');

      let fallback;
      if (worksheetType === 'multiply') {
        fallback = Array(25).fill(null).map(() => ({
          multiplicand: 54,
          multiplier: 8,
          answer: 432,
        }));
      } else {
        fallback = Array(25).fill(null).map(() => ({
          numbers: worksheetType === '1' ? [5, 2, 3, 1, 2, 1] : [45, 12, 23, 34, 11, 22],
          ops: ['+', '-', '+', '-', '+'],
          answer: worksheetType === '1' ? 5+2-3+1-2+1 : 45+12-23+34-11+22,
        }));
      }
      setProblems(fallback);
      setAnswers({});
      startTimer();
    } finally {
      setGenerating(false);
    }
  }, [worksheetType]);

  useEffect(() => {
    if (userDetails?.id) {
      generateNewWorksheet();
    }
    return () => stopTimer();
  }, [userDetails?.id, generateNewWorksheet]);

  const handleAnswerChange = (index, value) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [index]: value }));
  };

  const calculateStars = (correct, total) => {
    if (correct === total) return 3;
    if (correct >= total - 3) return 2;
    if (correct >= total - 7) return 1;
    return 0;
  };

  const handleSubmit = async () => {
    if (submitted || !userDetails?.id) return;
    stopTimer();
    setLoading(true);
    const finalTime = timer;
    setTimeTaken(finalTime);

    let correct = 0;
    problems.forEach((prob, idx) => {
      const userAns = parseInt(answers[idx]);
      const correctAns = worksheetType === 'multiply' ? prob.answer : prob.answer;
      if (userAns === correctAns) correct++;
    });
    const earnedStars = calculateStars(correct, problems.length);
    setScore(correct);
    setStars(earnedStars);
    setSubmitted(true);

    try {
      if (worksheetType !== 'multiply') {
        const { data: worksheetData, error: worksheetError } = await supabase
          .from('worksheets')
          .insert({
            user_id: userDetails.id,
            worksheet_type: worksheetType === '1' ? '1_digit_chain' : '2_digit_chain',
            questions: { problems, type: 'direct' },
          })
          .select()
          .single();
        if (worksheetError) throw worksheetError;

        const { error: resultError } = await supabase
          .from('worksheet_results')
          .insert({
            worksheet_id: worksheetData.id,
            user_id: userDetails.id,
            score: correct,
            total_questions: problems.length,
            time_taken_seconds: finalTime,
            stars_earned: earnedStars,
          });
        if (resultError) throw resultError;
      } else {
        const { error: resultError } = await supabase
          .from('worksheet_results')
          .insert({
            user_id: userDetails.id,
            score: correct,
            total_questions: problems.length,
            time_taken_seconds: finalTime,
            stars_earned: earnedStars,
          });
        if (resultError) throw resultError;
      }

      await supabase.rpc('increment_user_stats', {
        p_user_id: userDetails.id,
        p_stars: earnedStars,
        p_points: correct * 2,
      });

      showToast(`Worksheet saved! Score: ${correct}/${problems.length}`, 'success');

      // Send email notification with results summary
      if (studentData?.email) {
        setSendingEmail(true);
        try {
          const template = NotificationTemplates.worksheetCompleted(
            studentData.child_name || 'Student',
            correct,
            problems.length,
            earnedStars
          );
          await sendNotification({
            to: studentData.email,
            type: 'email',
            subject: template.subject,
            message: `${template.message}\n\nTime taken: ${formatTime(finalTime)}\n\nYou can view the full report in your dashboard.`,
          });
        } catch (emailErr) {
          console.warn('Email notification failed:', emailErr);
        } finally {
          setSendingEmail(false);
        }
      }
    } catch (err) {
      console.error('Error saving worksheet:', err);
      showToast('Failed to save results. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Worksheet_${studentData?.child_name || 'student'}_${new Date().toLocaleDateString()}`,
  });

  if (!userDetails) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#E2592D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF6F2] to-white py-4 md:py-6 px-3 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Toast Notification */}
        {toast.show && (
          <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-white ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {toast.type === 'success' ? <Check size={18} /> : <X size={18} />}
            {toast.message}
          </div>
        )}

        <div style={{ display: 'none' }}>
          <PrintableWorksheet
            ref={printRef}
            studentData={studentData}
            worksheetType={worksheetType}
            problems={problems}
            answers={answers}
            submitted={submitted}
            score={score}
            stars={stars}
            timeTaken={timeTaken}
          />
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 mb-5 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-2xl md:text-3xl font-black text-[#1A1A1A]">
              {worksheetType === 'multiply' ? '✖️ Multiplication' : '📝 Direct Sums'}
            </h1>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Clock className="text-[#E2592D] w-5 h-5 md:w-6 md:h-6" />
              <span className="text-lg md:text-xl font-mono font-bold">{formatTime(timer)}</span>
            </div>
          </div>

          <p className="text-sm text-[#555555] mt-1">
            {worksheetType === 'multiply' 
              ? '2‑digit × 1‑digit multiplication practice' 
              : 'No formulas · pure direct moves · keep answers within range'}
          </p>

          {error && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-700">
              <AlertTriangle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3 items-center mt-5">
            <div className="flex gap-1.5 bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
              <button
                onClick={() => setWorksheetType('1')}
                className={`flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-md text-sm font-medium transition ${
                  worksheetType === '1' ? 'bg-white shadow text-[#E2592D]' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="sm:hidden">1‑Dig</span>
                <span className="hidden sm:inline">1‑Digit</span>
              </button>
              <button
                onClick={() => setWorksheetType('2')}
                className={`flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-md text-sm font-medium transition ${
                  worksheetType === '2' ? 'bg-white shadow text-[#E2592D]' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="sm:hidden">2‑Dig</span>
                <span className="hidden sm:inline">2‑Digit</span>
              </button>
              <button
                onClick={() => setWorksheetType('multiply')}
                className={`flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-md text-sm font-medium transition ${
                  worksheetType === 'multiply' ? 'bg-white shadow text-[#E2592D]' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="sm:hidden">✖️</span>
                <span className="hidden sm:inline">Multiply</span>
              </button>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={generateNewWorksheet}
                disabled={generating}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 bg-[#E2592D] text-white rounded-lg hover:bg-[#C94E26] disabled:opacity-50 text-sm"
              >
                <RotateCcw size={16} />
                {generating ? 'Generating...' : 'New'}
              </button>

              {!submitted && problems.length > 0 && (
                <button
                  onClick={handleSubmit}
                  disabled={loading || Object.keys(answers).length < problems.length}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                >
                  <CheckCircle size={16} />
                  Submit
                </button>
              )}

              {submitted && (
                <button onClick={handlePrint} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                  <Printer size={16} />
                  PDF
                </button>
              )}
            </div>
          </div>

          {submitted && (
            <div className="mt-5 p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-4">
              <Trophy className="text-yellow-600 flex-shrink-0" size={28} />
              <div>
                <p className="font-bold">Score: {score} / {problems.length}</p>
                <p className="text-sm">Stars: {'⭐'.repeat(stars)} · Time: {formatTime(timeTaken)}</p>
                {sendingEmail && <p className="text-xs text-gray-500 mt-1">Sending email...</p>}
              </div>
            </div>
          )}
        </div>

        {generating ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#E2592D]" />
            <span className="ml-3 text-gray-500">Generating worksheet...</span>
          </div>
        ) : problems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
            {problems.map((prob, idx) => {
              const userAnswer = answers[idx];
              const correctAnswer = worksheetType === 'multiply' ? prob.answer : prob.answer;
              const isCorrect = submitted && parseInt(userAnswer) === correctAnswer;

              return (
                <div key={idx} className="bg-white rounded-lg md:rounded-xl shadow-sm p-2 md:p-3 border hover:shadow transition">
                  <div className="flex justify-between items-center mb-1">
                    <span className="bg-[#FDE3DA] text-[#E2592D] font-bold w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full text-xs md:text-sm">
                      {idx + 1}
                    </span>
                    {submitted && (
                      isCorrect ? <CheckCircle className="text-green-500 w-4 h-4" /> : <XCircle className="text-red-500 w-4 h-4" />
                    )}
                  </div>
                  <div className="font-mono text-right text-xs space-y-0.5 bg-slate-50 p-2 rounded-lg">
                    {worksheetType === 'multiply' ? (
                      <>
                        <div className="font-bold">{prob.multiplicand}</div>
                        <div className="flex justify-end items-center gap-1">
                          <span className="text-sm">×</span>
                          <span className="font-bold">{prob.multiplier}</span>
                        </div>
                        <hr className="my-1 border-slate-300" />
                        <div className="flex justify-end items-center gap-1">
                          <span className="font-medium">=</span>
                          <input
                            type="number"
                            value={answers[idx] || ''}
                            onChange={(e) => handleAnswerChange(idx, e.target.value)}
                            disabled={submitted}
                            className={`w-14 md:w-16 px-1 py-0.5 border rounded text-right text-xs ${
                              submitted
                                ? isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                                : 'border-gray-300 focus:ring-1 focus:ring-[#E2592D]'
                            }`}
                            placeholder="?"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-bold">{prob.numbers[0]}</div>
                        {prob.ops.map((op, i) => (
                          <div key={i} className="flex justify-end gap-1">
                            <span className="w-4 text-left">{op}</span>
                            <span className="w-6 text-right">{prob.numbers[i+1]}</span>
                          </div>
                        ))}
                        <hr className="my-1 border-slate-300" />
                        <div className="flex justify-end items-center gap-1">
                          <span className="font-medium">=</span>
                          <input
                            type="number"
                            value={answers[idx] || ''}
                            onChange={(e) => handleAnswerChange(idx, e.target.value)}
                            disabled={submitted}
                            className={`w-14 md:w-16 px-1 py-0.5 border rounded text-right text-xs ${
                              submitted
                                ? isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                                : 'border-gray-300 focus:ring-1 focus:ring-[#E2592D]'
                            }`}
                            placeholder="?"
                          />
                        </div>
                      </>
                    )}
                    {submitted && !isCorrect && (
                      <div className="text-[10px] text-red-500 mt-0.5">
                        Ans: {correctAnswer}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No problems generated. Please try again.
          </div>
        )}
      </div>
    </div>
  );
};

export default Worksheets;