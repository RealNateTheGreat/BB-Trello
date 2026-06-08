import React, { useState } from 'react';
import { Edit3, Save, Shield, UserPlus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { User } from '../../contexts/AuthContext';
import {
  OWNER_DISCORD_ID,
  ROLE_DEFINITIONS,
  getAssignableRoles,
  getBuiltInRoleForDiscordId,
  getRoleByName,
  hasPermission,
  normalizeDiscordId
} from '../../lib/roles';
import ImageUpload from '../ImageUpload';
import CustomSelect, { SelectOption } from '../ui/CustomSelect';

interface UsersManagerProps {
  users: User[];
  currentUser: User;
  onRefresh: () => void;
}

const UsersManager: React.FC<UsersManagerProps> = ({ users, currentUser, onRefresh }) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const canInviteUsers = hasPermission(currentUser.permissions, 'invite_users');
  const canAssignRoles = hasPermission(currentUser.permissions, 'assign_roles');

  const canEditUser = (targetUser: User) => {
    if (targetUser.discord_id === OWNER_DISCORD_ID && currentUser.discord_id !== OWNER_DISCORD_ID) return false;
    if (currentUser.id === targetUser.id) return true;
    return canAssignRoles && currentUser.role_level > targetUser.role_level;
  };

  const handleAddUser = async (userData: Partial<User>) => {
    const role = getRoleByName(userData.role_name);
    if (!role) return;

    setIsLoading(true);
    try {
      const discordId = normalizeDiscordId(userData.discord_id);
      const { data: existingUser, error: lookupError } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url, email')
        .eq('discord_id', discordId)
        .maybeSingle();

      if (lookupError) throw lookupError;

      const username = userData.display_name || existingUser?.username || `discord-${discordId}`;
      const payload = {
        discord_id: discordId,
        email: existingUser?.email || null,
        username,
        display_name: userData.display_name || existingUser?.display_name || username,
        avatar_url: userData.avatar_url || existingUser?.avatar_url || '',
        role_name: role.role_name,
        role_level: role.role_level,
        permissions: role.permissions,
        dashboard_access: true
      };

      if (existingUser) {
        const { error } = await supabase.from('users').update(payload).eq('discord_id', discordId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('users').insert({
          id: `pending-${discordId}`,
          ...payload
        });
        if (error) throw error;
      }

      onRefresh();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to save user access.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUser = async (updates: Partial<User>) => {
    if (!editingUser) return;

    setIsLoading(true);
    try {
      const payload = { ...updates };

      if (editingUser.discord_id === OWNER_DISCORD_ID) {
        const ownerRole = getBuiltInRoleForDiscordId(editingUser.discord_id);
        if (ownerRole) {
          payload.role_name = ownerRole.role_name;
          payload.role_level = ownerRole.role_level;
          payload.permissions = ownerRole.permissions;
          payload.dashboard_access = true;
        }
      }

      const { error } = await supabase.from('users').update(payload).eq('discord_id', editingUser.discord_id);
      if (error) throw error;

      onRefresh();
      setEditingUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-8 rounded-lg border-2 p-4 shadow-xl md:p-6 bb-panel">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black text-stone-50">Users & Access</h2>
          <p className="text-sm text-red-100/80">{users.length} users in the access list</p>
        </div>
        {canInviteUsers && (
          <button
            onClick={() => setShowAddForm(true)}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 rounded-lg border-2 px-4 py-2 text-sm font-semibold text-red-50 transition-all duration-200 hover:scale-105 disabled:opacity-50"
            style={{ backgroundColor: 'rgba(127, 29, 29, 0.35)', borderColor: 'rgba(239, 68, 68, 0.55)' }}
          >
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-red-900/40 text-left">
              <th className="px-2 py-3 text-sm font-semibold text-red-100">User</th>
              <th className="px-2 py-3 text-sm font-semibold text-red-100">Discord ID</th>
              <th className="px-2 py-3 text-sm font-semibold text-red-100">Rank</th>
              <th className="px-2 py-3 text-sm font-semibold text-red-100">Access</th>
              <th className="px-2 py-3 text-sm font-semibold text-red-100">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((targetUser) => (
              <tr key={targetUser.discord_id || targetUser.id} className="border-b border-red-900/20 hover:bg-red-950/20">
                <td className="px-2 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 overflow-hidden rounded-lg border"
                      style={{ backgroundColor: 'rgba(127, 29, 29, 0.22)', borderColor: 'rgba(239, 68, 68, 0.45)' }}
                    >
                      {targetUser.avatar_url ? (
                        <img src={targetUser.avatar_url} alt={targetUser.username} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-red-100">
                          <Shield className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-stone-50">{targetUser.display_name || targetUser.username}</span>
                  </div>
                </td>
                <td className="px-2 py-3 text-red-100/90">{targetUser.discord_id}</td>
                <td className="px-2 py-3">
                  <span className="rounded border border-red-500/40 bg-red-500/15 px-2 py-1 text-xs font-semibold text-red-100">
                    {targetUser.role_name}
                  </span>
                </td>
                <td className="px-2 py-3">
                  <span className={`rounded border px-2 py-1 text-xs font-semibold ${
                    targetUser.dashboard_access
                      ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-100'
                      : 'border-stone-500/40 bg-stone-500/15 text-stone-200'
                  }`}>
                    {targetUser.dashboard_access ? 'Management' : 'Viewer'}
                  </span>
                </td>
                <td className="px-2 py-3">
                  {canEditUser(targetUser) ? (
                    <button
                      onClick={() => setEditingUser(targetUser)}
                      className="rounded-lg p-2 text-red-100 transition-colors hover:bg-red-950/40"
                      aria-label={`Edit ${targetUser.username}`}
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  ) : (
                    <span className="text-xs text-red-200/60">Locked</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="rounded-lg border border-red-900/40 bg-black/20 p-8 text-center text-red-100">
          No users yet.
        </div>
      )}

      {showAddForm && (
        <AddUserModal
          currentUser={currentUser}
          onSave={handleAddUser}
          onClose={() => setShowAddForm(false)}
          isLoading={isLoading}
        />
      )}

      {editingUser && (
        <UserEditModal
          user={editingUser}
          currentUser={currentUser}
          onSave={handleSaveUser}
          onClose={() => setEditingUser(null)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

interface AddUserModalProps {
  currentUser: User;
  onSave: (user: Partial<User>) => void;
  onClose: () => void;
  isLoading: boolean;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ currentUser, onSave, onClose, isLoading }) => {
  const availableRoles = getAssignableRoles(currentUser.role_level);
  const roleOptions: SelectOption[] = availableRoles.map((role) => ({
    value: role.role_name,
    label: role.role_name,
    description: role.description
  }));
  const [formData, setFormData] = useState({
    discord_id: '',
    display_name: '',
    avatar_url: '',
    role_name: availableRoles[0]?.role_name || 'Web Mod'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border-2 p-6 shadow-2xl bb-panel animate-fade-in">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-2xl font-black text-stone-50">Add User Access</h3>
          <button onClick={onClose} className="rounded-lg p-2 text-red-100 hover:bg-red-950/40" aria-label="Close">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-red-100">Discord User ID</span>
            <input
              inputMode="numeric"
              value={formData.discord_id}
              onChange={(e) => setFormData({ ...formData, discord_id: e.target.value })}
              className="bb-input"
              placeholder="210768103594917888"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-red-100">Display Name</span>
            <input
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              className="bb-input"
              placeholder="Optional"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-red-100">Rank</span>
            <CustomSelect
              value={formData.role_name}
              options={roleOptions}
              onChange={(roleName) => setFormData({ ...formData, role_name: roleName })}
              ariaLabel="Access rank"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-red-100">Avatar</span>
            <ImageUpload
              currentImage={formData.avatar_url}
              onImageChange={(imageUrl) => setFormData({ ...formData, avatar_url: imageUrl })}
              className="h-24 w-24"
            />
          </label>

          <ModalActions onClose={onClose} isLoading={isLoading} action="Save User" />
        </form>
      </div>
    </div>
  );
};

interface UserEditModalProps {
  user: User;
  currentUser: User;
  onSave: (user: Partial<User>) => void;
  onClose: () => void;
  isLoading: boolean;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, currentUser, onSave, onClose, isLoading }) => {
  const assignableRoles = getAssignableRoles(currentUser.role_level);
  const currentRole = getRoleByName(user.role_name);
  const roleOptions = currentRole && !assignableRoles.some((role) => role.role_name === currentRole.role_name)
    ? [currentRole, ...assignableRoles]
    : assignableRoles;
  const customRoleOptions: SelectOption[] = roleOptions.map((role) => ({
    value: role.role_name,
    label: role.role_name,
    description: role.description
  }));
  const roleLocked = user.discord_id === OWNER_DISCORD_ID || user.id === currentUser.id;
  const [formData, setFormData] = useState({
    display_name: user.display_name || user.username,
    username: user.username,
    avatar_url: user.avatar_url || '',
    role_name: user.role_name,
    role_level: user.role_level,
    permissions: user.permissions,
    dashboard_access: user.dashboard_access
  });

  const handleRoleChange = (roleName: string) => {
    const role = ROLE_DEFINITIONS.find((candidate) => candidate.role_name === roleName);
    if (!role) return;

    setFormData({
      ...formData,
      role_name: role.role_name,
      role_level: role.role_level,
      permissions: role.permissions,
      dashboard_access: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border-2 p-6 shadow-2xl bb-panel animate-fade-in">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-2xl font-black text-stone-50">Edit User</h3>
          <button onClick={onClose} className="rounded-lg p-2 text-red-100 hover:bg-red-950/40" aria-label="Close">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <span className="mb-2 block text-sm font-semibold text-red-100">Username</span>
              <input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="bb-input"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-red-100">Rank</span>
            <CustomSelect
              value={formData.role_name}
              options={customRoleOptions}
              onChange={handleRoleChange}
              disabled={roleLocked}
              ariaLabel="User rank"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-red-100">Avatar</span>
            <ImageUpload
              currentImage={formData.avatar_url}
              onImageChange={(imageUrl) => setFormData({ ...formData, avatar_url: imageUrl })}
              className="h-24 w-24"
            />
          </label>

          <ModalActions onClose={onClose} isLoading={isLoading} action="Update User" />
        </form>
      </div>
    </div>
  );
};

interface ModalActionsProps {
  onClose: () => void;
  isLoading: boolean;
  action: string;
}

const ModalActions: React.FC<ModalActionsProps> = ({ onClose, isLoading, action }) => (
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
      <span>{isLoading ? 'Saving...' : action}</span>
    </button>
  </div>
);

export default UsersManager;
