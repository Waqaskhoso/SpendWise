import React, { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalForm } from '../components/goals/GoalForm';
import { EmptyState } from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { useGoals } from '../hooks/useGoals';
import { useAppStore } from '../store/useAppStore';
import api from '../services/api';
import { Goal } from '../types';

export function Goals() {
  const { currency } = useAppStore();
  const { goals, loading, refetch } = useGoals();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  const handleCreate = async (data: Omit<Goal, 'id'>) => {
    await api.post('/goals', data);
    setModalOpen(false);
    refetch();
  };

  const handleUpdate = async (data: Omit<Goal, 'id'>) => {
    if (!editing) return;
    await api.put(`/goals/${editing.id}`, data);
    setEditing(null);
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this goal?')) return;
    await api.delete(`/goals/${id}`);
    refetch();
  };

  if (loading) return <PageLoader />;

  const completed = goals.filter((g) => g.currentAmount >= g.targetAmount);
  const active = goals.filter((g) => g.currentAmount < g.targetAmount);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
          New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Create financial goals to stay motivated and track your progress."
          action={{ label: 'Create Goal', onClick: () => setModalOpen(true) }}
        />
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                Active Goals ({active.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {active.map((g) => (
                  <GoalCard
                    key={g.id}
                    goal={g}
                    currency={currency}
                    onEdit={setEditing}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                Completed Goals ({completed.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {completed.map((g) => (
                  <GoalCard
                    key={g.id}
                    goal={g}
                    currency={currency}
                    onEdit={setEditing}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Goal">
        <GoalForm
          onSubmit={handleCreate}
          onCancel={() => setModalOpen(false)}
          currency={currency}
        />
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Goal">
        {editing && (
          <GoalForm
            initial={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            currency={currency}
          />
        )}
      </Modal>
    </div>
  );
}
