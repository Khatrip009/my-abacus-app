// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LottiePackage from 'lottie-react';
import animationData from '../assets/animations/business-group-meeting.json';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

// Compatibility for different lottie-react exports
const Lottie = LottiePackage.default || LottiePackage;

const Login = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidLottie =
    Lottie &&
    typeof Lottie === 'function' &&
    animationData &&
    typeof animationData === 'object';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });

        if (signUpError) throw signUpError;

        if (data?.user?.identities?.length === 0) {
          setError('User already exists. Please log in.');
        } else {
          alert(
            '✅ Sign up successful! Please check your email to confirm your account.'
          );
          setIsSignUp(false);
          setEmail('');
          setPassword('');
          setName('');
        }
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) throw loginError;

        // AuthContext will automatically handle session and user details
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF6F2] to-white flex items-center justify-center p-6">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E5E5E5]">
        <div className="grid md:grid-cols-2">
          {/* Left Panel – Animation */}
          <div className="bg-gradient-to-br from-[#FDE3DA] to-white p-8 flex items-center justify-center">
            {isValidLottie ? (
              <div className="w-full max-w-sm">
                <Lottie
                  animationData={animationData}
                  loop={true}
                  autoplay={true}
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-2">🧠</div>
                <p className="text-[#555555]">Loading animation...</p>
              </div>
            )}
          </div>

          {/* Right Panel – Form */}
          <div className="p-8 md:p-12">
            <div className="mb-8 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-[#FDE3DA] rounded-full px-4 py-2 mb-4">
                <Sparkles className="w-4 h-4 text-[#E2592D]" />
                <span className="text-sm font-bold text-[#27403B] uppercase tracking-wide">
                  Student Access
                </span>
              </div>
              <h2 className="text-3xl font-black text-[#1A1A1A]">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-[#555555] mt-2">
                {isSignUp
                  ? 'Sign up to access your learning dashboard.'
                  : 'Log in to continue your brain development journey.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#BFC8C6]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                      placeholder="John Doe"
                      required
                      minLength="2"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#BFC8C6]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                    placeholder="student@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#BFC8C6]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                    placeholder="••••••••"
                    required
                    minLength="6"
                  />
                </div>
                {!isSignUp && (
                  <p className="text-xs text-[#BFC8C6] mt-1">
                    Password must be at least 6 characters
                  </p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-2 text-sm">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E2592D] hover:bg-[#C94E26] text-white font-bold py-3 rounded-lg transition transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isSignUp ? 'Creating account...' : 'Logging in...'}
                  </>
                ) : (
                  <>
                    {isSignUp ? 'Sign Up' : 'Login'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="text-center text-sm text-[#555555]">
                {isSignUp ? (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(false);
                        setError('');
                      }}
                      className="text-[#E2592D] font-semibold hover:underline"
                    >
                      Login here
                    </button>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(true);
                        setError('');
                      }}
                      className="text-[#E2592D] font-semibold hover:underline"
                    >
                      Sign up
                    </button>
                  </>
                )}
              </div>
            </form>

            {/* Demo credentials hint */}
            {!isSignUp && (
              <div className="mt-4 p-3 bg-[#FDE3DA] bg-opacity-30 rounded-lg border border-[#FDE3DA]">
                <p className="text-xs text-[#555555] text-center">
                  <span className="font-semibold">💡 Demo Access:</span>{' '}
                  Use any email/password combination
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;