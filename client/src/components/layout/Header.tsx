import React from 'react';
import { Menu, Sun, Moon, Bell } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../hooks/useTheme';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { setSidebarOpen, sidebarOpen } = useAppStore();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-dark-800 border-b border-slate-200 dark:border-dark-700 h-16">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors">
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
