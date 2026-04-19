// src/layouts/DashboardLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';

const DashboardLayout = () => {
  const { user, studentData, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-[#FFF6F2]">
      {/* Header always visible */}
      <Header />

      {/* Sidebar and Main Content Row */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-20 left-4 z-30 p-2 bg-white rounded-lg shadow-md md:hidden"
        >
          <Menu size={24} className="text-[#1A1A1A]" />
        </button>

        <Sidebar
          user={user}
          studentData={studentData}
          onSignOut={signOut}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto pt-4 md:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;