import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppStore } from '../../store/useAppStore';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/analytics': 'Analytics',
  '/budget': 'Budget',
  '/goals': 'Goals',
  '/settings': 'Settings',
};

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { sidebarOpen } = useAppStore();
  const title = PAGE_TITLES[location.pathname] || 'Expense Tracker';

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-dark-900 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" />
      )}

      {/* Sidebar */}
      <div className="flex-shrink-0 hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 lg:hidden transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
