import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Scale,
  Gauge,
  ScrollText,
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const adminNav = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Allocation Analytics', path: '/admin/allocation', icon: BarChart3 },
  { label: 'Fairness Dashboard', path: '/admin/fairness', icon: Scale },
  { label: 'Capacity Utilization', path: '/admin/capacity', icon: Gauge },
  { label: 'Audit Logs', path: '/admin/audit-logs', icon: ScrollText },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <div className="flex">
        <Sidebar
          navItems={adminNav}
          role="admin"
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
