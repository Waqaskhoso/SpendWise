import { Transaction, Budget, Goal } from '../types';
import { formatDate } from '../utils/dateUtils';
import { getCategoryLabel } from '../utils/categoryUtils';

export function exportTransactionsCSV(transactions: Transaction[]): void {
  const headers = ['Date', 'Title', 'Category', 'Type', 'Amount', 'Currency', 'Notes', 'Tags'];
  const rows = transactions.map((t) => [
    formatDate(t.date),
    `"${t.title}"`,
    getCategoryLabel(t.category),
    t.type,
    t.amount.toFixed(2),
    t.currency,
    `"${t.notes || ''}"`,
    `"${(t.tags || []).join(', ')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadFile(csv, 'transactions.csv', 'text/csv');
}

export function exportDataJSON(data: {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
}): void {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, 'expense-tracker-backup.json', 'application/json');
}

export function parseImportedData(jsonStr: string): {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
} {
  const data = JSON.parse(jsonStr);
  return {
    transactions: data.transactions || [],
    budgets: data.budgets || [],
    goals: data.goals || [],
  };
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
