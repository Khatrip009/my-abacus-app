// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const hasInitialized = useRef(false);
  const timeoutRef = useRef(null);

  const fetchUserDetails = useCallback(async (authUserId) => {
    try {
      const { data: userRecord, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', authUserId)
        .maybeSingle();

      if (error) throw error;

      if (!userRecord) {
        await createUserRecord(authUserId);
        return;
      }

      setUserDetails(userRecord);

      if (userRecord.student_id) {
        const { data: student } = await supabase
          .from('enrolled_students')
          .select(`*, courses:course_id (id, name, description)`)
          .eq('id', userRecord.student_id)
          .maybeSingle();

        if (student) setStudentData(student);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
    }
  }, []);

  const createUserRecord = useCallback(async (authUserId) => {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      const email = authUser?.user?.email;
      if (!email) return;

      const { data: newUser } = await supabase
        .from('users')
        .insert({
          user_id: authUserId,
          email,
          password_hash: 'supabase_auth',
          role: 'student',
          is_active: true,
        })
        .select()
        .single();

      if (newUser) {
        await supabase.from('user_profiles').insert({
          user_id: newUser.id,
          total_points: 0,
          stars: 0,
          level: 1,
        });
        setUserDetails(newUser);
      }
    } catch (err) {
      console.error('Error creating user record:', err);
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    console.log('🔄 AuthContext: Starting initialization');

    // Safety timeout – always stop loading after 3 seconds
    timeoutRef.current = setTimeout(() => {
      console.warn('⚠️ Auth initialization timeout – forcing ready state');
      setLoading(false);
    }, 3000);

    try {
      // Attempt to get the current session directly (with a short timeout)
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('getSession timed out')), 2000)
      );

      const { data: { session: initialSession }, error: sessionError } = await Promise.race([
        sessionPromise,
        timeoutPromise,
      ]);

      if (sessionError) throw sessionError;

      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
        await fetchUserDetails(initialSession.user.id);
      }

      // Clear the safety timeout because we already have a result
      clearTimeout(timeoutRef.current);
      setLoading(false);
    } catch (err) {
      console.error('❌ Auth initialization error:', err);
      // If getSession fails, we still set up the listener and hope for the best
    } finally {
      // Only clear loading if we didn't already get a session
      if (loading) {
        clearTimeout(timeoutRef.current);
        setLoading(false);
      }
    }

    // Set up the auth state listener for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('🔔 Auth event:', event, currentSession?.user?.email || 'no user');
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await fetchUserDetails(currentSession.user.id);
      } else {
        setUserDetails(null);
        setStudentData(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchUserDetails]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserDetails(null);
    setStudentData(null);
  }, []);

  const retry = useCallback(() => {
    setLoading(true);
    setAuthError(null);
    hasInitialized.current = false;
    initializeAuth();
  }, [initializeAuth]);

  const value = {
    user,
    session,
    userDetails,
    studentData,
    loading,
    authError,
    signOut,
    retry,
    isAdmin: userDetails?.role === 'admin',
    isStudent: userDetails?.role === 'student',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF6F2]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#E2592D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#555555]">Preparing your session...</p>
          <p className="text-xs text-gray-400 mt-2">If this takes too long, please refresh.</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF6F2] p-6">
        <div className="max-w-md bg-white rounded-xl shadow-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Connection Error</h2>
          <p className="text-gray-700 mb-4">{authError}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={retry} className="bg-[#E2592D] text-white px-6 py-2 rounded-lg hover:bg-[#C94E26]">
              Retry
            </button>
            <button onClick={() => window.location.reload()} className="border border-[#E2592D] text-[#E2592D] px-6 py-2 rounded-lg">
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};