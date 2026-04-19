// src/pages/Results.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import {
  Loader2, Trophy, Clock, Star, FileText, Printer, AlertCircle,
  TrendingUp, TrendingDown, Minus, Search, Filter, ChevronDown,
  Award, Calendar, BarChart3
} from 'lucide-react';

// ---------- Printable Results Component (unchanged, kept for reference) ----------
const PrintableResults = React.forwardRef((props, ref) => {
  const { studentData, results, stats } = props;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0m';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWorksheetTypeLabel = (type) => {
    if (type === '1_digit_chain') return '1-Digit Sums';
    if (type === '2_digit_chain') return '2-Digit Sums';
    if (type === 'multiplication') return 'Multiplication';
    return type;
  };

  return (
    <div ref={ref} className="p-6 bg-white" style={{ fontFamily: 'Nunito, sans-serif' }}>
      <style>{`
        @media print {
          @page { margin: 0.3in; }
          body { margin: 0; padding: 0; }
          .print-header { margin-bottom: 20px; }
          .print-table { width: 100%; border-collapse: collapse; }
          .print-table th, .print-table td { border: 1px solid #ccc; padding: 8px 10px; text-align: left; }
          .print-table th { background-color: #f5f5f5; font-weight: bold; }
        }
      `}</style>

      <div className="print-header border-b-2 border-[#E2592D] pb-3 mb-6">
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

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Worksheet Results History</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Total Worksheets</p>
            <p className="text-2xl font-bold">{stats.totalWorksheets}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Average Score</p>
            <p className="text-2xl font-bold">{stats.averageScore}%</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Total Stars</p>
            <p className="text-2xl font-bold">{stats.totalStars} ⭐</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">Generated on: {new Date().toLocaleString()}</p>
      </div>

      <table className="print-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Score</th>
            <th>Stars</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id}>
              <td>{formatDate(result.created_at)}</td>
              <td>{getWorksheetTypeLabel(result.worksheet_type)}</td>
              <td>{result.score} / {result.total_questions}</td>
              <td>{'⭐'.repeat(result.stars_earned)}</td>
              <td>{formatTime(result.time_taken_seconds)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 text-center text-xs text-gray-400 border-t pt-2">
        BrainCity Learning Platform · {new Date().toLocaleString()}
      </div>
    </div>
  );
});

// ---------- Main Component ----------
const Results = () => {
  const { userDetails, studentData } = useAuth();
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [stats, setStats] = useState({
    totalWorksheets: 0,
    averageScore: 0,
    totalStars: 0,
    bestScore: 0,
    recentTrend: 'neutral',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', '1_digit', '2_digit', 'multiplication'
  const printRef = useRef();

  useEffect(() => {
    if (userDetails?.id) {
      fetchResults();
    }
  }, [userDetails]);

  useEffect(() => {
    applyFilters();
  }, [results, searchTerm, filterType]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('worksheet_results')
        .select(`
          id,
          score,
          total_questions,
          time_taken_seconds,
          stars_earned,
          created_at,
          worksheet_id,
          worksheets!left(worksheet_type)
        `)
        .eq('user_id', userDetails.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Also fetch multiplication results (those without worksheet_id)
      const { data: multData, error: multError } = await supabase
        .from('worksheet_results')
        .select(`
          id,
          score,
          total_questions,
          time_taken_seconds,
          stars_earned,
          created_at
        `)
        .eq('user_id', userDetails.id)
        .is('worksheet_id', null)
        .order('created_at', { ascending: false });

      if (multError) throw multError;

      // Combine and mark multiplication results
      const combined = [
        ...(data || []).map(r => ({ ...r, worksheet_type: r.worksheets?.worksheet_type || 'unknown' })),
        ...(multData || []).map(r => ({ ...r, worksheet_type: 'multiplication' }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setResults(combined);
      calculateStats(combined);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    if (!data.length) {
      setStats({
        totalWorksheets: 0,
        averageScore: 0,
        totalStars: 0,
        bestScore: 0,
        recentTrend: 'neutral',
      });
      return;
    }

    const total = data.length;
    const totalScore = data.reduce((sum, r) => sum + (r.score || 0), 0);
    const totalPossible = data.reduce((sum, r) => sum + (r.total_questions || 25), 0);
    const avgScore = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
    const totalStars = data.reduce((sum, r) => sum + (r.stars_earned || 0), 0);
    const bestScore = Math.max(...data.map(r => (r.score / (r.total_questions || 25)) * 100));

    // Recent trend: compare last 3 vs previous 3
    const recentScores = data.slice(0, 3).map(r => (r.score / (r.total_questions || 25)) * 100);
    const previousScores = data.slice(3, 6).map(r => (r.score / (r.total_questions || 25)) * 100);
    const recentAvg = recentScores.length ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length : 0;
    const previousAvg = previousScores.length ? previousScores.reduce((a, b) => a + b, 0) / previousScores.length : 0;
    let trend = 'neutral';
    if (recentAvg > previousAvg + 5) trend = 'up';
    else if (recentAvg < previousAvg - 5) trend = 'down';

    setStats({
      totalWorksheets: total,
      averageScore: avgScore,
      totalStars,
      bestScore,
      recentTrend: trend,
    });
  };

  const applyFilters = () => {
    let filtered = [...results];
    
    if (filterType !== 'all') {
      filtered = filtered.filter(r => {
        if (filterType === '1_digit') return r.worksheet_type === '1_digit_chain';
        if (filterType === '2_digit') return r.worksheet_type === '2_digit_chain';
        if (filterType === 'multiplication') return r.worksheet_type === 'multiplication';
        return true;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(r => {
        const typeLabel = getWorksheetTypeLabel(r.worksheet_type).toLowerCase();
        const scoreStr = `${r.score}/${r.total_questions}`;
        return typeLabel.includes(searchTerm.toLowerCase()) || scoreStr.includes(searchTerm);
      });
    }

    setFilteredResults(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0m';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWorksheetTypeLabel = (type) => {
    if (type === '1_digit_chain') return '1-Digit Sums';
    if (type === '2_digit_chain') return '2-Digit Sums';
    if (type === 'multiplication') return 'Multiplication';
    return 'Worksheet';
  };

  const getScoreColor = (score, total) => {
    const percent = (score / total) * 100;
    if (percent >= 80) return 'text-green-600';
    if (percent >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Results_${studentData?.child_name || 'student'}_${new Date().toLocaleDateString()}`,
  });

  const TrendIcon = () => {
    if (stats.recentTrend === 'up') return <TrendingUp className="text-green-500" size={20} />;
    if (stats.recentTrend === 'down') return <TrendingDown className="text-red-500" size={20} />;
    return <Minus className="text-gray-400" size={20} />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#E2592D]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4">
          <AlertCircle className="text-red-500" size={24} />
          <div>
            <h3 className="font-bold text-red-800 mb-1">Error Loading Results</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF6F2] to-white py-6 px-4 md:py-8 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Hidden printable component */}
        <div style={{ display: 'none' }}>
          <PrintableResults
            ref={printRef}
            studentData={studentData}
            results={filteredResults}
            stats={stats}
          />
        </div>

        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#FDE3DA] rounded-2xl">
              <BarChart3 className="text-[#E2592D]" size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#1A1A1A]">Your Results</h1>
              <p className="text-sm md:text-base text-[#555555]">Track your progress and achievements</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {results.length > 0 ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 md:p-5 border border-[#E5E5E5] shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="text-[#E2592D]" size={20} />
                  <span className="text-xs md:text-sm font-medium text-[#555555]">Total</span>
                </div>
                <p className="text-2xl md:text-3xl font-black text-[#1A1A1A]">{stats.totalWorksheets}</p>
                <p className="text-xs text-gray-400 mt-1">worksheets completed</p>
              </div>

              <div className="bg-white rounded-xl p-4 md:p-5 border border-[#E5E5E5] shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="text-[#E2592D]" size={20} />
                  <span className="text-xs md:text-sm font-medium text-[#555555]">Average</span>
                </div>
                <p className="text-2xl md:text-3xl font-black text-[#1A1A1A]">{stats.averageScore}%</p>
                <p className="text-xs text-gray-400 mt-1">overall accuracy</p>
              </div>

              <div className="bg-white rounded-xl p-4 md:p-5 border border-[#E5E5E5] shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="text-yellow-500" size={20} />
                  <span className="text-xs md:text-sm font-medium text-[#555555]">Stars</span>
                </div>
                <p className="text-2xl md:text-3xl font-black text-[#1A1A1A]">{stats.totalStars}</p>
                <p className="text-xs text-gray-400 mt-1">earned</p>
              </div>

              <div className="bg-white rounded-xl p-4 md:p-5 border border-[#E5E5E5] shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="text-[#E2592D]" size={20} />
                  <span className="text-xs md:text-sm font-medium text-[#555555]">Best</span>
                </div>
                <p className="text-2xl md:text-3xl font-black text-[#1A1A1A]">{Math.round(stats.bestScore)}%</p>
                <p className="text-xs text-gray-400 mt-1">highest score</p>
              </div>

              <div className="bg-white rounded-xl p-4 md:p-5 border border-[#E5E5E5] shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <TrendIcon />
                  <span className="text-xs md:text-sm font-medium text-[#555555]">Trend</span>
                </div>
                <p className="text-lg font-semibold capitalize">{stats.recentTrend}</p>
                <p className="text-xs text-gray-400 mt-1">last 3 vs previous 3</p>
              </div>
            </div>

            {/* Filters and Export */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#E2592D] focus:border-transparent w-full sm:w-64"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="pl-10 pr-8 py-2.5 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#E2592D] focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">All Types</option>
                    <option value="1_digit">1-Digit Sums</option>
                    <option value="2_digit">2-Digit Sums</option>
                    <option value="multiplication">Multiplication</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm w-full sm:w-auto justify-center"
              >
                <Printer size={18} />
                Export PDF
              </button>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-[#E5E5E5]">
                    <tr>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-[#1A1A1A]">Date</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-[#1A1A1A]">Type</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-[#1A1A1A]">Score</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-[#1A1A1A]">Stars</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-[#1A1A1A]">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {filteredResults.map((result) => (
                      <tr key={result.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-[#555555] whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400 hidden sm:block" />
                            {formatDate(result.created_at)}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-[#555555]">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {getWorksheetTypeLabel(result.worksheet_type)}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <span className={`font-semibold ${getScoreColor(result.score, result.total_questions)}`}>
                            {result.score} / {result.total_questions}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <span className="text-yellow-500 text-base">
                            {'⭐'.repeat(result.stars_earned)}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-[#555555]">
                          <div className="flex items-center gap-1">
                            <Clock size={14} className="text-gray-400" />
                            {formatTime(result.time_taken_seconds)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredResults.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">No matching results</h3>
                  <p className="text-[#555555]">Try adjusting your filters or search term.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-8 md:p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-[#FDE3DA] rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-[#E2592D]" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#1A1A1A] mb-3">No results yet</h3>
            <p className="text-[#555555] max-w-md mx-auto mb-6">
              Complete a worksheet to see your performance stats, stars earned, and track your progress over time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;