import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Eye, EyeOff, Sparkles, ShieldCheck, BarChart3, Wallet } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';

const FEATURES = [
  { icon: BarChart3, text: 'Visual spending analytics' },
  { icon: Wallet, text: 'Budget tracking & alerts' },
  { icon: ShieldCheck, text: 'Secure & private' },
  { icon: Sparkles, text: 'AI-powered categorization' },
];

export function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };
      const { data } = await api.post(endpoint, payload);
      setAuth(data.user, data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 h-48 w-48 rounded-full bg-pink-400/20 blur-2xl" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl">Expense Tracker</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Take control of<br />your finances
            </h2>
            <p className="mt-4 text-indigo-100 text-lg leading-relaxed">
              Track every rupee, visualize your spending, and hit your financial goals.
            </p>
          </div>

          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-indigo-100 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 rounded-2xl bg-white/10 backdrop-blur-sm p-5 border border-white/20">
          <p className="text-white/90 text-sm italic">"A budget is telling your money where to go instead of wondering where it went."</p>
          <p className="text-indigo-200 text-xs mt-2">— Dave Ramsey</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-dark-900">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl mb-3">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Expense Tracker</h1>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-3xl shadow-xl border border-slate-100 dark:border-dark-700 p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {mode === 'login' ? 'Welcome back 👋' : 'Create account'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                {mode === 'login' ? 'Sign in to your account' : 'Start tracking your finances today'}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-dark-700 p-1 mb-6">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    mode === m
                      ? 'bg-white dark:bg-dark-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <Input label="Full Name" type="text" placeholder="John Doe" value={form.name} onChange={(e) => set('name', e.target.value)} required />
              )}
              <Input label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} required />
              <div className="relative">
                <Input
                  label="Password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:from-indigo-600 hover:to-purple-700 disabled:opacity-60 transition-all duration-200 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:shadow-xl hover:-translate-y-0.5"
              >
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-slate-100 dark:border-dark-700 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">Want to explore first?</p>
              <button
                onClick={() => { setForm({ name: '', email: 'demo@example.com', password: 'password123' }); setMode('login'); }}
                className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
              >
                Use demo account →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
