import React, { useState } from 'react';
import { Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { User } from '../../contexts/AuthContext';
import { ROLE_DEFINITIONS, hasPermission } from '../../lib/roles';
import ImageUpload from '../ImageUpload';

interface Credit {
  id: string;
  discord_id?: string;
  email?: string;
  display_name: string;
  avatar_url?: string;
  role_name: string;
  title?: string;
  contribution?: string;
  sort_order?: number;
  featured?: boolean;
  is_visible?: boolean;
}

interface CreditsManagerProps {
  credits: Credit[];
  users: User[];
  currentUser: User;
  onRefresh: () => void;
}

const CreditsManager: React.FC<CreditsManagerProps> = ({ credits, users, currentUser, onRefresh }) => {
  const [editingCredit, setEditingCredit] = useState<Credit | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const canManageCredits = hasPermission(currentUser.permissions, 'manage_credits');

  const handleSaveCredit = async (creditData: Partial<Credit>) => {
    setIsLoading(true);
    try {
      if (editingCredit) {
        const { error } = await supabase.from('credits').update(creditData).eq('id', editingCredit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('credits').insert(creditData);
        if (error) throw error;
      }

      onRefresh();
      setEditingCredit(null);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving credit:', error);
      alert('Failed to save credit.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCredit = async (credit: Credit) => {
    if (!confirm(`Delete credit for "${credit.display_name}"?`)) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from('credits').delete().eq('id', credit.id);
      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error deleting credit:', error);
      alert('Failed to delete credit.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-8 rounded-lg border-2 p-4 shadow-xl md:p-6 bb-panel">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black text-stone-50">Credits</h2>
          <p className="text-sm text-red-100/80">{credits.length} public credit entries</p>
        </div>
        {canManageCredits && (
          <button
            onClick={() => setShowAddForm(true)}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 rounded-lg border-2 px-4 py-2 text-sm font-semibold text-red-50 transition-all duration-200 hover:scale-105 disabled:opacity-50"
            style={{ backgroundColor: 'rgba(127, 29, 29, 0.35)', borderColor: 'rgba(239, 68, 68, 0.55)' }}
          >
            <Plus className="h-4 w-4" />
            <span>Add Credit</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {credits.map((credit) => (
          <article
            key={credit.id}
            className="rounded-lg border p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.22)', borderColor: 'rgba(185, 28, 28, 0.35)' }}
          >
            <div className="flex gap-4">
              <div
                className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border"
                style={{ backgroundColor: 'rgba(127, 29, 29, 0.2)', borderColor: 'rgba(239, 68, 68, 0.45)' }}
              >
                {credit.avatar_url ? (
                  <img src={credit.avatar_url} alt={credit.display_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-black text-red-100">
                    {credit.display_name.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-bold text-stone-50">{credit.display_name}</h3>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-red-200">{credit.role_name}</p>
                    {credit.title && <p className="mt-1 text-sm text-stone-200">{credit.title}</p>}
                  </div>
                  {canManageCredits && (
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => setEditingCredit(credit)}
                        className="rounded-lg p-2 text-red-100 transition-colors hover:bg-red-950/40"
                        aria-label={`Edit ${credit.display_name}`}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCredit(credit)}
                        className="rounded-lg p-2 text-red-300 transition-colors hover:bg-red-500/15"
                        aria-label={`Delete ${credit.display_name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded border border-red-900/40 bg-black/20 px-2 py-1 text-red-100">
                    {credit.is_visible === false ? 'Hidden' : 'Visible'}
                  </span>
                  {credit.featured && (
                    <span className="rounded border border-red-500/40 bg-red-500/15 px-2 py-1 text-red-100">
                      Featured
                    </span>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {credits.length === 0 && (
        <div className="rounded-lg border border-red-900/40 bg-black/20 p-8 text-center text-red-100">
          No credits yet.
        </div>
      )}

      {(editingCredit || showAddForm) && (
        <CreditModal
          credit={editingCredit}
          users={users}
          onSave={handleSaveCredit}
          onClose={() => {
            setEditingCredit(null);
            setShowAddForm(false);
          }}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

interface CreditModalProps {
  credit: Credit | null;
  users: User[];
  onSave: (credit: Partial<Credit>) => void;
  onClose: () => void;
  isLoading: boolean;
}

const CreditModal: React.FC<CreditModalProps> = ({ credit, users, onSave, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    discord_id: credit?.discord_id || '',
    display_name: credit?.display_name || '',
    avatar_url: credit?.avatar_url || '',
    role_name: credit?.role_name || 'Web Mod',
    title: credit?.title || '',
    contribution: credit?.contribution || '',
    sort_order: credit?.sort_order || 0,
    featured: credit?.featured || false,
    is_visible: credit?.is_visible ?? true
  });

  const handleUserSelect = (discordId: string) => {
    const selectedUser = users.find((user) => user.discord_id === discordId);
    if (!selectedUser) {
      setFormData({ ...formData, discord_id: discordId });
      return;
    }

    setFormData({
      ...formData,
      discord_id: selectedUser.discord_id,
      display_name: selectedUser.display_name || selectedUser.username,
      avatar_url: selectedUser.avatar_url || '',
      role_name: selectedUser.role_name
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      discord_id: formData.discord_id || null,
      sort_order: Number(formData.sort_order) || 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border-2 p-6 shadow-2xl bb-panel animate-fade-in">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-2xl font-black text-stone-50">{credit ? 'Edit Credit' : 'Add Credit'}</h3>
          <button onClick={onClose} className="rounded-lg p-2 text-red-100 hover:bg-red-950/40" aria-label="Close">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-red-100">Attach Discord User ID</span>
            <input
              value={formData.discord_id}
              onChange={(e) => handleUserSelect(e.target.value)}
              list="credit-users"
              className="bb-input"
              placeholder="Optional"
            />
            <datalist id="credit-users">
              {users.map((user) => (
                <option key={user.id} value={user.discord_id}>
                  {user.display_name || user.username}
                </option>
              ))}
            </datalist>
          </label>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-red-100">Display Name</span>
              <input
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="bb-input"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-red-100">Rank</span>
              <select
                value={formData.role_name}
                onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
                className="bb-input"
              >
                {ROLE_DEFINITIONS.map((role) => (
                  <option key={role.role_name} value={role.role_name}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-red-100">Avatar</span>
            <ImageUpload
              currentImage={formData.avatar_url}
              onImageChange={(imageUrl) => setFormData({ ...formData, avatar_url: imageUrl })}
              className="h-24 w-24"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-red-100">Title</span>
            <input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bb-input"
              placeholder="Optional"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-red-100">Contribution</span>
            <textarea
              value={formData.contribution}
              onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
              className="bb-input min-h-28"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-red-100">Sort Order</span>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                className="bb-input"
              />
            </label>
            <label className="flex items-center gap-2 pt-7 text-red-100">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="h-4 w-4 rounded text-red-600 focus:ring-red-500"
              />
              Featured
            </label>
            <label className="flex items-center gap-2 pt-7 text-red-100">
              <input
                type="checkbox"
                checked={formData.is_visible}
                onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                className="h-4 w-4 rounded text-red-600 focus:ring-red-500"
              />
              Visible
            </label>
          </div>

          <div className="flex flex-col justify-end gap-2 border-t border-red-900/40 pt-5 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-red-900/50 px-5 py-3 text-red-100 hover:bg-red-950/30"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 rounded-lg border px-5 py-3 font-semibold text-stone-50 transition-all duration-200 hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: 'rgba(185, 28, 28, 0.62)', borderColor: 'rgba(239, 68, 68, 0.62)' }}
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? 'Saving...' : credit ? 'Update Credit' : 'Create Credit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreditsManager;
