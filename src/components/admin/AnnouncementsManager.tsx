import React, { useState } from 'react';
import { Save, Plus, Trash2, Edit3, X, Megaphone } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  active: boolean;
  priority: number;
  expires_at?: string;
  created_at: string;
}

type AnnouncementType = Announcement['type'];

interface AnnouncementsManagerProps {
  announcements: Announcement[];
  onRefresh: () => void;
}

const AnnouncementsManager: React.FC<AnnouncementsManagerProps> = ({ 
  announcements, 
  onRefresh 
}) => {
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveAnnouncement = async (announcementData: Partial<Announcement>) => {
    setIsLoading(true);
    try {
      if (editingAnnouncement) {
        const { error } = await supabase
          .from('announcements')
          .update(announcementData)
          .eq('id', editingAnnouncement.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert(announcementData);
        
        if (error) throw error;
      }
      
      onRefresh();
      setEditingAnnouncement(null);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Failed to save announcement. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Failed to delete announcement. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'success':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    }
  };

  return (
    <div 
      className="rounded-xl p-4 md:p-6 shadow-xl border-2 mb-8"
      style={{ backgroundColor: '#3D2914', borderColor: '#8B6F47' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-amber-100">
          Manage Announcements ({announcements.length} total)
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200 border-2 shadow-lg disabled:opacity-50"
          style={{ backgroundColor: '#3D2914', borderColor: '#8B6F47' }}
        >
          <Plus className="w-4 h-4 text-amber-200" />
          <span className="text-amber-100 font-medium text-sm">Add Announcement</span>
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Mobile Cards View */}
          <div className="block lg:hidden space-y-4">
            {announcements.map((announcement) => (
              <div 
                key={announcement.id}
                className="rounded-lg p-4 border-2"
                style={{ 
                  backgroundColor: 'rgba(74, 55, 40, 0.3)',
                  borderColor: '#8B6F47'
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-amber-100 font-medium text-lg">{announcement.title}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingAnnouncement(announcement)}
                      className="p-2 rounded-lg hover:bg-amber-800/30 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-amber-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div><span className="text-amber-300">Content:</span> <span className="text-amber-200">{announcement.content.substring(0, 50)}...</span></div>
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getTypeColor(announcement.type)}`}>
                      {announcement.type}
                    </span>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                      announcement.active 
                        ? 'bg-green-500/20 text-green-400 border-green-500/50'
                        : 'bg-red-500/20 text-red-400 border-red-500/50'
                    }`}>
                      {announcement.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <table className="hidden lg:table w-full">
            <thead>
              <tr className="border-b border-amber-700/30">
                <th className="text-left text-amber-200 font-semibold py-3 px-2">Title</th>
                <th className="text-left text-amber-200 font-semibold py-3 px-2">Content</th>
                <th className="text-left text-amber-200 font-semibold py-3 px-2">Type</th>
                <th className="text-left text-amber-200 font-semibold py-3 px-2">Status</th>
                <th className="text-left text-amber-200 font-semibold py-3 px-2">Priority</th>
                <th className="text-left text-amber-200 font-semibold py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((announcement) => (
                <tr key={announcement.id} className="border-b border-amber-700/20 hover:bg-amber-800/20">
                  <td className="py-3 px-2 text-amber-100 font-medium">{announcement.title}</td>
                  <td className="py-3 px-2 text-amber-200 max-w-xs truncate">
                    {announcement.content}
                  </td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getTypeColor(announcement.type)}`}>
                      {announcement.type}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                      announcement.active 
                        ? 'bg-green-500/20 text-green-400 border-green-500/50'
                        : 'bg-red-500/20 text-red-400 border-red-500/50'
                    }`}>
                      {announcement.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-amber-200">{announcement.priority}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingAnnouncement(announcement)}
                        className="p-2 rounded-lg hover:bg-amber-800/30 transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-amber-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Announcement Modal */}
      {(editingAnnouncement || showAddForm) && (
        <AnnouncementEditModal
          announcement={editingAnnouncement}
          onSave={handleSaveAnnouncement}
          onClose={() => {
            setEditingAnnouncement(null);
            setShowAddForm(false);
          }}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

// Announcement Edit Modal Component
interface AnnouncementEditModalProps {
  announcement: Announcement | null;
  onSave: (announcement: Partial<Announcement>) => void;
  onClose: () => void;
  isLoading: boolean;
}

const AnnouncementEditModal: React.FC<AnnouncementEditModalProps> = ({ 
  announcement, 
  onSave, 
  onClose, 
  isLoading 
}) => {
  const [formData, setFormData] = useState({
    title: announcement?.title || '',
    content: announcement?.content || '',
    type: (announcement?.type || 'info') as AnnouncementType,
    active: announcement?.active ?? true,
    priority: announcement?.priority || 0,
    expires_at: announcement?.expires_at || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      expires_at: formData.expires_at || null
    };
    
    onSave(submitData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border-2"
        style={{ backgroundColor: '#3D2914', borderColor: '#8B6F47' }}
      >
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-amber-700/30">
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 rounded-lg border"
              style={{ 
                backgroundColor: 'rgba(74, 55, 40, 0.6)',
                borderColor: '#8B6F47'
              }}
            >
              <Megaphone className="w-6 h-6 text-amber-200" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-amber-100">
              {announcement ? 'Edit Announcement' : 'Add New Announcement'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-amber-800/30 transition-colors"
          >
            <X className="w-6 h-6 text-amber-200" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          <div>
            <label className="block text-amber-200 text-sm font-medium mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border-2 text-amber-100 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              style={{ 
                backgroundColor: 'rgba(74, 55, 40, 0.3)', 
                borderColor: '#8B6F47'
              }}
              required
            />
          </div>

          <div>
            <label className="block text-amber-200 text-sm font-medium mb-2">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border-2 text-amber-100 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              style={{ 
                backgroundColor: 'rgba(74, 55, 40, 0.3)', 
                borderColor: '#8B6F47'
              }}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-amber-200 text-sm font-medium mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as AnnouncementType })}
                className="w-full px-4 py-3 rounded-lg border-2 text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                style={{ 
                  backgroundColor: 'rgba(74, 55, 40, 0.3)', 
                  borderColor: '#8B6F47'
                }}
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
              </select>
            </div>

            <div>
              <label className="block text-amber-200 text-sm font-medium mb-2">
                Priority
              </label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-lg border-2 text-amber-100 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                style={{ 
                  backgroundColor: 'rgba(74, 55, 40, 0.3)', 
                  borderColor: '#8B6F47'
                }}
                min="0"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                />
                <span className="text-amber-200 text-sm font-medium">Active</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-amber-200 text-sm font-medium mb-2">
              Expires At (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.expires_at}
              onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border-2 text-amber-100 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              style={{ 
                backgroundColor: 'rgba(74, 55, 40, 0.3)', 
                borderColor: '#8B6F47'
              }}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg text-amber-200 hover:bg-amber-800/30 transition-colors border"
              style={{ borderColor: '#8B6F47' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-amber-100 hover:text-white transition-all duration-200 hover:scale-105 font-medium border disabled:opacity-50"
              style={{ 
                backgroundColor: 'rgba(139, 111, 71, 0.8)',
                borderColor: '#8B6F47'
              }}
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : (announcement ? 'Update' : 'Create')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementsManager;
