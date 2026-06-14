import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutDashboard, User, Sparkles, FileText } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const candidateNav = [
  { label: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', path: '/candidate/profile', icon: User },
  { label: 'Recommended Internships', path: '/candidate/recommendations', icon: Sparkles },
  { label: 'Applications', path: '/candidate/applications', icon: FileText },
];

export default function CandidateLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <div className="flex">
        <Sidebar
          navItems={candidateNav}
          role="candidate"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 p-4 lg:p-8 min-h-[calc(100vh-4rem)] overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
