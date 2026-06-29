import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle, FileText, Sparkles, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { Transaction, Category } from '../../types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../../utils/categoryUtils';
import { formatCurrency } from '../../utils/formatters';

// Auto-categorization keyword map
const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  food: ['grocery', 'groceries', 'supermarket', 'restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'kfc', 'mcdonalds', 'food', 'eat', 'dining', 'lunch', 'dinner', 'breakfast', 'bakery', 'imtiaz', 'carrefour', 'metro', 'naheed', 'agha'],
  transport: ['uber', 'careem', 'fuel', 'petrol', 'gas station', 'shell', 'pso', 'total', 'parking', 'toll', 'bus', 'train', 'taxi', 'transport', 'ride', 'vehicle', 'auto'],
  shopping: ['amazon', 'daraz', 'aliexpress', 'shop', 'store', 'mall', 'clothes', 'fashion', 'shoes', 'nike', 'adidas', 'retail', 'market', 'purchase'],
  bills: ['electricity', 'water', 'gas', 'internet', 'wifi', 'phone', 'mobile', 'bill', 'utility', 'rent', 'lease', 'ptcl', 'jazz', 'zong', 'telenor', 'ufone', 'wapda', 'sui'],
  entertainment: ['netflix', 'spotify', 'youtube', 'cinema', 'movie', 'game', 'gaming', 'steam', 'disney', 'hulu', 'subscription', 'concert', 'event', 'ticket'],
  healthcare: ['pharmacy', 'hospital', 'clinic', 'doctor', 'medical', 'medicine', 'health', 'dental', 'lab', 'test', 'dawakhana', 'shifa'],
  education: ['school', 'college', 'university', 'course', 'book', 'tuition', 'fee', 'education', 'udemy', 'coursera', 'training'],
  salary: ['salary', 'wage', 'payroll', 'income', 'payment received', 'transfer in', 'credit'],
  investment: ['investment', 'stock', 'mutual fund', 'dividend', 'profit', 'return', 'interest earned'],
  other: [],
};

function detectCategory(title: string): Category {
  const lower = title.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category as Category;
    }
  }
  return 'other';
}

function detectType(title: string, amount: number): 'income' | 'expense' {
  const lower = title.toLowerCase();
  const incomeKeywords = ['salary', 'income', 'received', 'credit', 'dividend', 'bonus', 'refund', 'cashback'];
  if (incomeKeywords.some((kw) => lower.includes(kw))) return 'income';
  if (amount < 0) return 'expense';
  return 'expense';
}

interface ParsedRow {
  id: string;
  title: string;
  amount: number;
  category: Category;
  type: 'income' | 'expense';
  date: string;
  notes: string;
  selected: boolean;
  confidence: 'high' | 'medium' | 'low';
}

interface CSVImportProps {
  onImport: (transactions: Omit<Transaction, 'id'>[]) => Promise<void>;
  onClose: () => void;
  currency: string;
}

function parseDate(raw: string): string {
  // Try multiple date formats
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
    /^(\d{2})\/(\d{2})\/(\d{4})$/, // MM/DD/YYYY
    /^(\d{2})-(\d{2})-(\d{4})$/, // DD-MM-YYYY
    /^(\d{2})\/(\d{2})\/(\d{2})$/, // MM/DD/YY
  ];

  for (const fmt of formats) {
    const m = raw.match(fmt);
    if (m) {
      if (fmt === formats[0]) return raw;
      if (fmt === formats[1]) return `${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`;
      if (fmt === formats[2]) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
      if (fmt === formats[3]) return `20${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`;
    }
  }

  // Try native Date parsing
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];

  return new Date().toISOString().split('T')[0];
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));

  const findCol = (...names: string[]) => headers.findIndex((h) => names.some((n) => h.includes(n)));

  const dateCol = findCol('date', 'time', 'when');
  const titleCol = findCol('title', 'description', 'narration', 'details', 'merchant', 'name', 'particulars');
  const amountCol = findCol('amount', 'debit', 'credit', 'value', 'sum');
  const notesCol = findCol('notes', 'note', 'remarks', 'memo', 'comment');

  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Handle quoted CSV fields
    const cols: string[] = [];
    let cur = '';
    let inQuote = false;
    for (const ch of lines[i]) {
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === ',' && !inQuote) { cols.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    cols.push(cur.trim());

    if (cols.length < 2) continue;

    const rawTitle = titleCol >= 0 ? cols[titleCol] : cols[1] || 'Unknown';
    const rawAmount = amountCol >= 0 ? cols[amountCol] : cols[2] || '0';
    const rawDate = dateCol >= 0 ? cols[dateCol] : cols[0] || new Date().toISOString().split('T')[0];
    const rawNotes = notesCol >= 0 ? cols[notesCol] : '';

    const amount = Math.abs(parseFloat(rawAmount.replace(/[^0-9.-]/g, '')) || 0);
    if (amount === 0) continue;

    const title = rawTitle || 'Unknown Transaction';
    const category = detectCategory(title);
    const type = detectType(title, parseFloat(rawAmount.replace(/[^0-9.-]/g, '') || '0'));
    const confidence = category !== 'other' ? 'high' : title.length > 3 ? 'medium' : 'low';

    rows.push({
      id: `import-${i}`,
      title,
      amount,
      category,
      type,
      date: parseDate(rawDate),
      notes: rawNotes,
      selected: true,
      confidence,
    });
  }

  return rows;
}

export function CSVImport({ onImport, onClose, currency }: CSVImportProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'done'>('upload');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [imported, setImported] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('Please upload a CSV file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        setError('No valid transactions found. Make sure your CSV has Date, Description, and Amount columns.');
        return;
      }
      setRows(parsed);
      setStep('preview');
      setError('');
    };
    reader.readAsText(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const toggleRow = (id: string) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const toggleAll = () => {
    const allSelected = rows.every((r) => r.selected);
    setRows((prev) => prev.map((r) => ({ ...r, selected: !allSelected })));
  };

  const updateCategory = (id: string, category: Category) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, category } : r));
  };

  const updateType = (id: string, type: 'income' | 'expense') => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, type } : r));
  };

  const handleImport = async () => {
    const selected = rows.filter((r) => r.selected);
    if (selected.length === 0) return;
    setStep('importing');
    try {
      await onImport(
        selected.map(({ title, amount, category, type, date, notes }) => ({
          title, amount, category, type, date,
          notes: notes || undefined,
          currency,
          isRecurring: false,
          tags: [],
        }))
      );
      setImported(selected.length);
      setStep('done');
    } catch {
      setError('Import failed. Please try again.');
      setStep('preview');
    }
  };

  const selectedCount = rows.filter((r) => r.selected).length;
  const totalAmount = rows.filter((r) => r.selected && r.type === 'expense').reduce((s, r) => s + r.amount, 0);

  return (
    <div className="flex flex-col gap-0">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {['upload', 'preview', 'done'].map((s, i) => (
          <React.Fragment key={s}>
            <div className={clsx(
              'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all',
              step === s || (step === 'importing' && s === 'preview')
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                : i < ['upload','preview','done'].indexOf(step)
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                  : 'bg-slate-100 text-slate-400 dark:bg-dark-700 dark:text-slate-500'
            )}>
              <span>{i + 1}</span>
              <span className="capitalize">{s}</span>
            </div>
            {i < 2 && <div className="flex-1 h-px bg-slate-200 dark:bg-dark-600" />}
          </React.Fragment>
        ))}
      </div>

      {/* Upload step */}
      {step === 'upload' && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={clsx(
              'relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-all duration-200',
              dragging
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.01]'
                : 'border-slate-200 dark:border-dark-600 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10'
            )}
          >
            <div className={clsx(
              'flex h-16 w-16 items-center justify-center rounded-2xl transition-all',
              dragging ? 'bg-indigo-500 text-white' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
            )}>
              <Upload className="h-8 w-8" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
                {dragging ? 'Drop it here!' : 'Upload your bank statement'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Drag & drop or click to browse · CSV files only
              </p>
            </div>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Format guide */}
          <div className="rounded-xl bg-slate-50 dark:bg-dark-700/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              <FileText className="h-3.5 w-3.5" />
              Expected CSV Format
            </div>
            <div className="overflow-x-auto">
              <table className="text-xs text-slate-600 dark:text-slate-400 w-full">
                <thead>
                  <tr className="text-slate-400 dark:text-slate-500">
                    <td className="pr-4 pb-1 font-medium">Date</td>
                    <td className="pr-4 pb-1 font-medium">Description</td>
                    <td className="pr-4 pb-1 font-medium">Amount</td>
                    <td className="pb-1 font-medium">Notes</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="pr-4">2024-01-15</td>
                    <td className="pr-4">Netflix Subscription</td>
                    <td className="pr-4">1500</td>
                    <td>Monthly</td>
                  </tr>
                  <tr>
                    <td className="pr-4">2024-01-16</td>
                    <td className="pr-4">Salary Credit</td>
                    <td className="pr-4">85000</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Categories are auto-detected from transaction names
            </p>
          </div>
        </div>
      )}

      {/* Preview step */}
      {(step === 'preview' || step === 'importing') && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-900/20 p-3 text-center">
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{rows.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Detected</p>
            </div>
            <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-3 text-center">
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{selectedCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Selected</p>
            </div>
            <div className="rounded-xl bg-orange-50 dark:bg-orange-900/20 p-3 text-center">
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{formatCurrency(totalAmount, currency)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total Expenses</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Table */}
          <div className="rounded-xl border border-slate-200 dark:border-dark-600 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-dark-700 border-b border-slate-200 dark:border-dark-600">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked={rows.every((r) => r.selected)} onChange={toggleAll} className="rounded" />
                Select all
              </label>
              <span className="text-xs text-slate-400">{selectedCount} / {rows.length} selected</span>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-dark-600">
              {rows.map((row) => (
                <div key={row.id} className={clsx(
                  'flex items-center gap-3 px-4 py-3 transition-colors',
                  row.selected ? 'bg-white dark:bg-dark-800' : 'bg-slate-50/50 dark:bg-dark-700/50 opacity-50'
                )}>
                  <input type="checkbox" checked={row.selected} onChange={() => toggleRow(row.id)} className="rounded flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{row.title}</p>
                    <p className="text-xs text-slate-400">{row.date}</p>
                  </div>
                  {/* Category dropdown */}
                  <div className="relative flex-shrink-0">
                    <select
                      value={row.category}
                      onChange={(e) => updateCategory(row.id, e.target.value as Category)}
                      className="text-xs rounded-lg px-2 py-1 pr-6 border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-700 text-slate-700 dark:text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      style={{ borderLeftColor: CATEGORY_COLORS[row.category], borderLeftWidth: 3 }}
                    >
                      {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                  {/* Type toggle */}
                  <button
                    onClick={() => updateType(row.id, row.type === 'income' ? 'expense' : 'income')}
                    className={clsx(
                      'text-xs px-2.5 py-1 rounded-lg font-medium flex-shrink-0 transition-colors',
                      row.type === 'income'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    )}
                  >
                    {row.type === 'income' ? '+ Income' : '- Expense'}
                  </button>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex-shrink-0 w-20 text-right">
                    {formatCurrency(row.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('upload')} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-600 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors">
              Back
            </button>
            <button
              onClick={handleImport}
              disabled={selectedCount === 0 || step === 'importing'}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900/30"
            >
              {step === 'importing' ? 'Importing...' : `Import ${selectedCount} Transactions`}
            </button>
          </div>
        </div>
      )}

      {/* Done step */}
      {step === 'done' && (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">Import Complete!</p>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Successfully imported <span className="font-semibold text-indigo-600">{imported} transactions</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900/30"
          >
            View Transactions
          </button>
        </div>
      )}
    </div>
  );
}
