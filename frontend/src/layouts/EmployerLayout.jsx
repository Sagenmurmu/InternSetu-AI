import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Users, FileText } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const employerNav = [
  { label: 'Dashboard', path: '/employer/dashboard', icon: LayoutDashboard },
  { label: 'Create Internship', path: '/employer/create-internship', icon: PlusCircle },
  { label: 'Candidate Shortlist', path: '/employer/shortlist', icon: Users },
  { label: 'Applications', path: '/employer/applications', icon: FileText },
];

export default function EmployerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <div className="flex">
        <Sidebar
          navItems={employerNav}
          role="employer"
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
