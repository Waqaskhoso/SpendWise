import React, { useState } from 'react';
import { User, Palette, Database, Download, Upload, Trash2 } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../hooks/useTheme';
import { CURRENCIES } from '../utils/categoryUtils';
import api from '../services/api';

const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({ value: c.code, label: c.label }));

export function Settings() {
  const { user, updateUser } = useAuthStore();
  const { currency, setCurrency } = useAppStore();
  const { theme, toggleTheme } = useTheme();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', profile);
      updateUser(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.next !== pwForm.confirm) {
      setPwError('Passwords do not match');
      return;
    }
    if (pwForm.next.length < 6) {
      setPwError('Password must be at least 6 characters');
      return;
    }
    try {
      await api.put('/auth/password', {
        currentPassword: pwForm.current,
        newPassword: pwForm.next,
      });
      setPwForm({ current: '', next: '', confirm: '' });
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 2000);
    } catch (err: any) {
      setPwError(err.response?.data?.error || 'Failed to change password');
    }
  };

  const handleExport = async () => {
    try {
      const [txRes, budgetRes, goalRes] = await Promise.all([
        api.get('/transactions?limit=10000'),
        api.get('/budgets'),
        api.get('/goals'),
      ]);
      const data = {
        transactions: txRes.data.data,
        budgets: budgetRes.data,
        goals: goalRes.data,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expense-tracker-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Export failed');
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile */}
      <Card>
        <CardHeader title="Profile" subtitle="Update your personal information" />
        <form onSubmit={handleProfileSave} className="space-y-4">
          <Input
            label="Full Name"
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={profile.email}
            onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
          />
          <Select
            label="Currency"
            options={CURRENCY_OPTIONS}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
          <Button type="submit" loading={saving}>
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </form>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader title="Change Password" subtitle="Keep your account secure" />
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={pwForm.current}
            onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
          />
          <Input
            label="New Password"
            type="password"
            value={pwForm.next}
            onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={pwForm.confirm}
            onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
          />
          {pwError && <p className="text-sm text-red-600">{pwError}</p>}
          <Button type="submit">
            {pwSaved ? 'Password Updated!' : 'Change Password'}
          </Button>
        </form>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader title="Appearance" subtitle="Customize your experience" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme</p>
            <p className="text-xs text-slate-400">
              Currently using {theme === 'dark' ? 'dark' : 'light'} mode
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader title="Data Management" subtitle="Export or manage your data" />
        <div className="space-y-3">
          <Button
            variant="outline"
            icon={<Download className="h-4 w-4" />}
            onClick={handleExport}
            className="w-full justify-start"
          >
            Export all data (JSON)
          </Button>
        </div>
      </Card>
    </div>
  );
}
