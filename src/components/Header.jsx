// src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Menu, X, MessageCircle, ChevronDown, LogIn, User, LogOut,
  LayoutDashboard, Award, Sparkles, Star
} from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, studentData, signOut, isAuthenticated } = useAuth();
  const userDropdownRef = useRef(null);

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu and dropdowns on navigation
  useEffect(() => {
    setIsMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation items (public) – Home, About, Courses removed
  const navItems = [
    { name: 'Results', path: '/results' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const whatsappLink = 'https://wa.me/916352372744?text=I%27m%20interested%20in%20BrainCity%20program';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Display name for authenticated user
  const displayName = studentData?.child_name || user?.email?.split('@')[0] || 'Student';
  const profileImage = studentData?.image_url;

  return (
    <>
      {/* Top Bar – Trust Signals */}
      <div className="bg-[#27403B] text-white text-xs sm:text-sm py-1.5 sm:py-2 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-x-4 gap-y-1 sm:gap-6">
          <span className="inline-flex items-center gap-1">
            <Award size={14} className="text-yellow-400" />
            10,000+ Students Trained
          </span>
          <span className="inline-flex items-center gap-1">
            <Star size={14} className="text-yellow-400" />
            15+ Years Experience
          </span>
          <span className="inline-flex items-center gap-1">
            <Sparkles size={14} className="text-yellow-400" />
            Free Demo Available
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white shadow-lg py-1.5 sm:py-2'
            : 'bg-white border-b border-[#E5E5E5] py-3 sm:py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img
                src="/braincity_logo.png"
                alt="BrainCity"
                className="h-10 sm:h-12 w-auto"
              />
            </Link>

            {/* Desktop Navigation – only Results and Contact */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`font-semibold transition-colors duration-300 ${
                    isActive(item.path)
                      ? 'text-[#E2592D] border-b-2 border-[#E2592D]'
                      : 'text-[#27403B] hover:text-[#E2592D]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Side – Actions */}
            <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#27403B] hover:text-[#E2592D] transition-colors"
              >
                <MessageCircle size={20} />
                <span className="font-semibold">WhatsApp</span>
              </a>

              {isAuthenticated ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-[#FDE3DA] transition"
                  >
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={displayName}
                        className="w-9 h-9 rounded-full object-cover border-2 border-[#E2592D]"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#FDE3DA] flex items-center justify-center text-[#E2592D] font-bold border-2 border-[#E2592D]">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-semibold text-[#27403B] max-w-[120px] truncate">
                      {displayName}
                    </span>
                    <ChevronDown size={16} className={`transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#E5E5E5] py-2 z-30">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-[#27403B] hover:bg-[#FDE3DA] hover:text-[#E2592D] transition"
                      >
                        <LayoutDashboard size={18} />
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-[#27403B] hover:bg-[#FDE3DA] hover:text-[#E2592D] transition"
                      >
                        <User size={18} />
                        My Profile
                      </Link>
                      <hr className="my-1 border-[#E5E5E5]" />
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut size={18} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/demo')}
                    className="bg-[#E2592D] hover:bg-[#C94E26] text-white font-bold px-4 xl:px-5 py-2 rounded-lg transition-transform hover:scale-105 shadow-md whitespace-nowrap"
                  >
                    Book Free Demo
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 text-[#27403B] hover:text-[#E2592D] transition-colors font-semibold"
                  >
                    <LogIn size={20} />
                    <span>Login</span>
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-[#27403B] focus:outline-none p-1"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-[#E5E5E5] z-40 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-4 py-6 space-y-4">
              {/* User Info (if authenticated) */}
              {isAuthenticated && (
                <div className="flex items-center gap-3 pb-4 border-b border-[#E5E5E5]">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={displayName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#E2592D]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#FDE3DA] flex items-center justify-center text-[#E2592D] font-bold text-lg border-2 border-[#E2592D]">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-[#1A1A1A]">{displayName}</p>
                    <p className="text-xs text-[#555555]">{studentData?.standard || 'Student'}</p>
                  </div>
                </div>
              )}

              {/* Navigation Items – only Results and Contact */}
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block py-2 font-semibold transition-colors ${
                    isActive(item.path) ? 'text-[#E2592D]' : 'text-[#27403B]'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Authenticated Mobile Links */}
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 py-2 text-[#27403B] font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard size={20} />
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 py-2 text-[#27403B] font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={20} />
                    My Profile
                  </Link>
                </>
              ) : (
                <>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-[#27403B] py-2"
                  >
                    <MessageCircle size={20} />
                    <span className="font-semibold">WhatsApp</span>
                  </a>
                  <button
                    onClick={() => {
                      navigate('/demo');
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-[#E2592D] hover:bg-[#C94E26] text-white font-bold px-5 py-3 rounded-lg transition"
                  >
                    Book Free Demo
                  </button>
                </>
              )}

              {/* Login / Sign Out */}
              <div className="pt-4 border-t border-[#E5E5E5]">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 text-red-600 font-bold px-5 py-3 rounded-lg border border-red-200 hover:bg-red-50 transition"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      navigate('/login');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 border border-[#E2592D] text-[#E2592D] hover:bg-[#FDE3DA] font-bold px-5 py-3 rounded-lg transition"
                  >
                    <LogIn size={18} />
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Gradient line */}
      <div className="h-[2px] bg-gradient-to-r from-[#E2592D] to-[#27403B]"></div>
    </>
  );
};

export default Header;