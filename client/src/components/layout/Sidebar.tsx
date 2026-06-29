import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Target,
  Wallet,
  Settings,
  LogOut,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/budget', icon: Wallet, label: 'Budget' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={clsx(
        'flex flex-col h-full bg-white dark:bg-dark-800 border-r border-slate-200 dark:border-dark-700 transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-200 dark:border-dark-700">
        <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">Expense</p>
            <p className="font-bold text-indigo-600 text-sm leading-tight">Tracker</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700 hover:text-slate-900 dark:hover:text-slate-100'
              )
            }
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User & toggle */}
      <div className="border-t border-slate-200 dark:border-dark-700 p-2 space-y-1">
        {sidebarOpen && user && (
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-5 w-5 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-5 w-5 flex-shrink-0" />
          )}
          {sidebarOpen && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
