// src/pages/StudentDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import {
  Star, TrendingUp, BookOpen, Clock,
  Loader2, AlertCircle, Sparkles
} from 'lucide-react';
import AbacusWidget from '../components/AbacusWidget';

const StudentDashboard = () => {
  const { user, userDetails, studentData, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    worksheetsCompleted: 0,
    totalTime: 0,
    starsEarned: 0,
    currentLevel: 1,
  });
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!userDetails?.id) return;
    
    try {
      setLoading(true);

      // Fetch user profile for level & stars
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('stars, level')
        .eq('user_id', userDetails.id)
        .maybeSingle();

      if (profile) {
        setStats(prev => ({
          ...prev,
          currentLevel: profile.level || 1,
          starsEarned: profile.stars || 0,
        }));
      }

      // Fetch worksheet results for count & total time
      const { data: results, error: resultsError } = await supabase
        .from('worksheet_results')
        .select('time_taken_seconds, stars_earned')
        .eq('user_id', userDetails.id);

      if (resultsError) throw resultsError;

      if (results) {
        const totalWorksheets = results.length;
        const totalTime = results.reduce((sum, r) => sum + (r.time_taken_seconds || 0), 0);
        const totalStars = results.reduce((sum, r) => sum + (r.stars_earned || 0), 0);

        setStats(prev => ({
          ...prev,
          worksheetsCompleted: totalWorksheets,
          totalTime,
          starsEarned: prev.starsEarned || totalStars,
        }));
      }
    } catch (err) {
      console.error('Dashboard data error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [userDetails?.id]);

  useEffect(() => {
    if (userDetails && studentData) {
      fetchDashboardData();
    } else if (userDetails && !studentData && !isAdmin) {
      setLoading(false);
      setError('No student profile linked to your account. Please contact support.');
    } else if (!userDetails && !loading) {
      setLoading(false);
    }
  }, [userDetails, studentData, isAdmin, fetchDashboardData]);

  const formatTime = (seconds) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 text-[#E2592D] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-800 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-lg text-[#555555]">Admin dashboard is under construction.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#E2592D] to-[#C94E26] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">
              Welcome back, {studentData?.child_name || user?.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-white/90 text-sm sm:text-base">
              {studentData?.courses?.name ? `Enrolled in ${studentData.courses.name}` : 'Keep up the great work!'}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium">
            <Sparkles className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Let's practice!
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E5E5E5] shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <div className="p-1.5 sm:p-2 bg-[#FDE3DA] rounded-lg">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#E2592D]" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-[#BFC8C6]">Total</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#1A1A1A]">{stats.starsEarned}</p>
          <p className="text-xs sm:text-sm text-[#555555]">Stars Earned</p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E5E5E5] shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <div className="p-1.5 sm:p-2 bg-[#FDE3DA] rounded-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#E2592D]" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-[#BFC8C6]">Current</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#1A1A1A]">Level {stats.currentLevel}</p>
          <p className="text-xs sm:text-sm text-[#555555]">Your Level</p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E5E5E5] shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <div className="p-1.5 sm:p-2 bg-[#FDE3DA] rounded-lg">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#E2592D]" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-[#BFC8C6]">Completed</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#1A1A1A]">{stats.worksheetsCompleted}</p>
          <p className="text-xs sm:text-sm text-[#555555]">Worksheets</p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E5E5E5] shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <div className="p-1.5 sm:p-2 bg-[#FDE3DA] rounded-lg">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#E2592D]" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-[#BFC8C6]">Total Time</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#1A1A1A]">{formatTime(stats.totalTime)}</p>
          <p className="text-xs sm:text-sm text-[#555555]">Learning Time</p>
        </div>
      </div>

      {/* Full-Width Abacus Widget */}
      <AbacusWidget />
    </div>
  );
};

export default StudentDashboard;