// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  LogOut, User, Mail, Calendar, Award, Clock, BookOpen,
  Star, TrendingUp, Loader2, Sparkles, Brain, Trophy,
  Target, Zap, ChevronRight
} from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [recentWorksheets, setRecentWorksheets] = useState([]);
  const [stats, setStats] = useState({
    totalPoints: 0,
    stars: 0,
    level: 1,
    worksheetsCompleted: 0,
    averageScore: 0,
    totalTime: 0
  });

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // 1. Fetch user record from public.users table
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user record:', userError);
        if (userError.code === 'PGRST116') {
          await createUserRecord();
          return;
        }
      }

      if (userRecord) {
        setUserData(userRecord);

        // 2. Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userRecord.id)
          .single();

        if (!profileError && profile) {
          setUserProfile(profile);
          setStats(prev => ({
            ...prev,
            totalPoints: profile.total_points || 0,
            stars: profile.stars || 0,
            level: profile.level || 1
          }));
        }

        // 3. Fetch student data if linked
        if (userRecord.student_id) {
          const { data: student, error: studentError } = await supabase
            .from('enrolled_students')
            .select(`
              *,
              courses:course_id (
                id,
                name,
                description
              )
            `)
            .eq('id', userRecord.student_id)
            .single();

          if (!studentError && student) {
            setStudentData(student);
          }
        }

        // 4. Fetch worksheet results
        await fetchWorksheetStats(userRecord.id);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUserRecord = async () => {
    try {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          user_id: user.id,
          email: user.email,
          password_hash: 'supabase_auth',
          role: 'student',
          is_active: true
        })
        .select()
        .single();

      if (createError) throw createError;

      await supabase
        .from('user_profiles')
        .insert({
          user_id: newUser.id,
          total_points: 0,
          stars: 0,
          level: 1
        });

      fetchUserData();
    } catch (error) {
      console.error('Error creating user record:', error);
    }
  };

  const fetchWorksheetStats = async (userId) => {
    try {
      const { data: results, error } = await supabase
        .from('worksheet_results')
        .select(`
          *,
          worksheets:worksheet_id (
            worksheet_type,
            created_at
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (results && results.length > 0) {
        setRecentWorksheets(results.slice(0, 5));

        const totalWorksheets = results.length;
        const avgScore = results.reduce((sum, r) => sum + (r.score || 0), 0) / totalWorksheets;
        const totalTime = results.reduce((sum, r) => sum + (r.time_taken_seconds || 0), 0);
        const totalStars = results.reduce((sum, r) => sum + (r.stars_earned || 0), 0);

        setStats(prev => ({
          ...prev,
          worksheetsCompleted: totalWorksheets,
          averageScore: Math.round(avgScore),
          totalTime: totalTime,
          stars: totalStars
        }));
      }
    } catch (error) {
      console.error('Error fetching worksheet stats:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF6F2] to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#E2592D] animate-spin mx-auto mb-4" />
          <p className="text-[#555555]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF6F2] to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#E5E5E5] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FDE3DA] rounded-xl">
                <Brain className="w-6 h-6 text-[#E2592D]" />
              </div>
              <h1 className="text-2xl font-black text-[#1A1A1A] hidden sm:block">
                Brain Development
              </h1>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-[#E2592D] hover:bg-[#FDE3DA] rounded-lg transition"
            >
              <LogOut size={18} />
              <span className="font-semibold hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#E2592D] to-[#C94E26] rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-2xl font-bold">
              Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student'}! 👋
            </h2>
          </div>
          <p className="text-white/90">
            {studentData
              ? `${studentData.child_name} - ${studentData.courses?.name || 'Active Student'}`
              : 'Continue your learning journey'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-[#E5E5E5] hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-[#FDE3DA] rounded-lg">
                <Star className="w-5 h-5 text-[#E2592D]" />
              </div>
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-black text-[#1A1A1A]">{stats.stars}</p>
            <p className="text-sm text-[#BFC8C6]">Total Stars</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-[#E5E5E5] hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-[#FDE3DA] rounded-lg">
                <TrendingUp className="w-5 h-5 text-[#E2592D]" />
              </div>
              <Target className="w-5 h-5 text-[#E2592D]" />
            </div>
            <p className="text-3xl font-black text-[#1A1A1A]">{stats.level}</p>
            <p className="text-sm text-[#BFC8C6]">Current Level</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-[#E5E5E5] hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-[#FDE3DA] rounded-lg">
                <BookOpen className="w-5 h-5 text-[#E2592D]" />
              </div>
              <Award className="w-5 h-5 text-[#E2592D]" />
            </div>
            <p className="text-3xl font-black text-[#1A1A1A]">{stats.worksheetsCompleted}</p>
            <p className="text-sm text-[#BFC8C6]">Worksheets Done</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-[#E5E5E5] hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-[#FDE3DA] rounded-lg">
                <Clock className="w-5 h-5 text-[#E2592D]" />
              </div>
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-black text-[#1A1A1A]">{formatTime(stats.totalTime)}</p>
            <p className="text-sm text-[#BFC8C6]">Total Time</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Profile */}
          <div className="md:col-span-1 space-y-6">
            {/* User Profile Card */}
            <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#E2592D]" />
                Profile
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[#BFC8C6]">Email</p>
                  <p className="font-medium text-[#1A1A1A] flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#E2592D]" />
                    {user?.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#BFC8C6]">Member Since</p>
                  <p className="font-medium text-[#1A1A1A] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#E2592D]" />
                    {formatDate(user?.created_at)}
                  </p>
                </div>
                {userProfile?.last_active && (
                  <div>
                    <p className="text-xs text-[#BFC8C6]">Last Active</p>
                    <p className="font-medium text-[#1A1A1A]">
                      {formatDate(userProfile.last_active)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Student Info Card (if linked) */}
            {studentData && (
              <div className="bg-gradient-to-br from-[#FDE3DA] to-white rounded-xl border border-[#FDE3DA] p-6">
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Student Details</h3>
                <div className="space-y-2">
                  <p><span className="text-[#BFC8C6]">Name:</span> {studentData.child_name}</p>
                  {studentData.parent_name && (
                    <p><span className="text-[#BFC8C6]">Parent:</span> {studentData.parent_name}</p>
                  )}
                  {studentData.courses && (
                    <p><span className="text-[#BFC8C6]">Course:</span> {studentData.courses.name}</p>
                  )}
                  {studentData.standard && (
                    <p><span className="text-[#BFC8C6]">Standard:</span> {studentData.standard}</p>
                  )}
                  {studentData.school_name && (
                    <p><span className="text-[#BFC8C6]">School:</span> {studentData.school_name}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Recent Activity */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-[#E2592D]" />
                Recent Worksheets
              </h3>

              {recentWorksheets.length > 0 ? (
                <div className="space-y-3">
                  {recentWorksheets.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between p-4 bg-[#F9F9F9] rounded-lg hover:bg-[#FDE3DA] transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#E2592D] rounded-full flex items-center justify-center text-white">
                          {result.worksheets?.worksheet_type === '1_digit_chain' ? '1️⃣' :
                           result.worksheets?.worksheet_type === '2_digit_chain' ? '2️⃣' : '✖️'}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1A1A1A]">
                            {result.worksheets?.worksheet_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <p className="text-xs text-[#BFC8C6]">
                            {formatDate(result.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#E2592D]">{result.score}/{result.total_questions}</p>
                        <p className="text-xs text-[#BFC8C6]">
                          {result.time_taken_seconds}s • ⭐ {result.stars_earned}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-[#BFC8C6] mx-auto mb-3" />
                  <p className="text-[#555555] mb-4">No worksheets completed yet</p>
                  <button className="bg-[#E2592D] text-white px-6 py-2 rounded-lg hover:bg-[#C94E26] transition">
                    Start Your First Worksheet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;