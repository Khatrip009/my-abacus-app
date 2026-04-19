// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  BarChart3,
  User,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const Sidebar = ({ user, studentData, onSignOut, isOpen, onClose }) => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Worksheets', path: '/worksheets', icon: FileText },
    { name: 'Results', path: '/results', icon: BarChart3 },
    { name: 'Fees', path: '/fees', icon: CreditCard },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const displayName = studentData?.child_name || user?.email?.split('@')[0] || 'Student';
  const profileImage = studentData?.image_url;

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50 md:z-auto
          h-screen bg-white border-r border-[#E5E5E5]
          flex flex-col
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${collapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 md:hidden"
        >
          <X size={24} className="text-[#555555]" />
        </button>

        {/* Collapse toggle button (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-[#E5E5E5] rounded-full items-center justify-center text-[#555555] hover:text-[#E2592D] shadow-sm z-10"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Profile Section */}
        <div className={`p-4 border-b border-[#E5E5E5] ${collapsed ? 'px-2' : ''}`}>
          <div className={`flex ${collapsed ? 'justify-center' : 'items-center gap-3'}`}>
            {profileImage ? (
              <img
                src={profileImage}
                alt={displayName}
                className={`rounded-full object-cover border-2 border-[#E2592D] ${
                  collapsed ? 'w-10 h-10' : 'w-12 h-12'
                }`}
              />
            ) : (
              <div
                className={`rounded-full bg-[#FDE3DA] flex items-center justify-center text-[#E2592D] font-bold border-2 border-[#E2592D] ${
                  collapsed ? 'w-10 h-10 text-base' : 'w-12 h-12 text-lg'
                }`}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#BFC8C6] uppercase tracking-wider mb-0.5">
                  Student
                </p>
                <p className="font-semibold text-[#1A1A1A] truncate">
                  {displayName}
                </p>
                {studentData?.standard && (
                  <p className="text-xs text-[#555555] truncate">
                    {studentData.standard}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation - scrollable */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 md:py-2 rounded-lg transition-colors ${
                    collapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-[#FDE3DA] text-[#E2592D] font-semibold'
                      : 'text-[#555555] hover:bg-[#F9F9F9] hover:text-[#1A1A1A]'
                  }`
                }
                title={collapsed ? item.name : ''}
              >
                <Icon size={20} />
                {!collapsed && <span className="text-base md:text-sm">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Sign Out - fixed at bottom */}
        <div className={`p-4 border-t border-[#E5E5E5] ${collapsed ? 'px-2' : ''}`}>
          <button
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className={`flex items-center gap-3 w-full px-3 py-3 md:py-2 text-[#555555] hover:bg-[#FDE3DA] hover:text-[#E2592D] rounded-lg transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Sign Out' : ''}
          >
            <LogOut size={20} />
            {!collapsed && <span className="text-base md:text-sm">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;