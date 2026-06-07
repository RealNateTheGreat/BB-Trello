import React, { useState } from 'react';
import { Save, Plus, Trash2, Edit3, X, Image, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ImageUpload from '../ImageUpload';

interface WebLogo {
  id: string;
  name: string;
  type: 'banner' | 'loading' | 'favicon' | 'logo';
  image_url: string;
  is_active: boolean;
  description?: string;
  created_at: string;
}

interface WebLogosManagerProps {
  webLogos: WebLogo[];
  onRefresh: () => void;
}

const WebLogosManager: React.FC<WebLogosManagerProps> = ({ 
  webLogos, 
  onRefresh 
}) => {
  const [editingLogo, setEditingLogo] = useState<WebLogo | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveLogo = async (logoData: Partial<WebLogo>) => {
    setIsLoading(true);
    try {
      if (editingLogo) {
        const { error } = await supabase
          .from('web_logos')
          .update(logoData)
          .eq('id', editingLogo.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('web_logos')
          .insert(logoData);
        
        if (error) throw error;
      }
      
      onRefresh();
      setEditingLogo(null);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving web logo:', error);
      alert('Failed to save web logo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLogo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this web logo?')) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('web_logos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error deleting web logo:', error);
      alert('Failed to delete web logo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (logo: WebLogo) => {
    setIsLoading(true);
    try {
      // If activating this logo, deactivate others of the same type
      if (!logo.is_active) {
        await supabase
          .from('web_logos')
          .update({ is_active: false })
          .eq('type', logo.type);
      }

      const { error } = await supabase
        .from('web_logos')
        .update({ is_active: !logo.is_active })
        .eq('id', logo.id);
      
      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error toggling logo status:', error);
      alert('Failed to update logo status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'banner':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'loading':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'favicon':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'logo':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div 
      className="rounded-xl p-4 md:p-6 shadow-xl border-2 mb-8"
      style={{ backgroundColor: '#3D2914', borderColor: '#8B6F47' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-amber-100">
          Manage Web Logos ({webLogos.length} total)
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200 border-2 shadow-lg disabled:opacity-50"
          style={{ backgroundColor: '#3D2914', borderColor: '#8B6F47' }}
        >
          <Plus className="w-4 h-4 text-amber-200" />
          <span className="text-amber-100 font-medium text-sm">Add Web Logo</span>
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Mobile Cards View */}
          <div className="block lg:hidden space-y-4">
            {webLogos.map((logo) => (
              <div 
                key={logo.id}
                className="rounded-lg p-4 border-2"
                style={{ 
                  backgroundColor: 'rgba(74, 55, 40, 0.3)',
                  borderColor: '#8B6F47'
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={logo.image_url} 
                      alt={logo.name}
                      className="w-12 h-12 rounded-lg object-cover border"
                      style={{ borderColor: '#8B6F47' }}
                    />
                    <div>
                      <h3 className="text-amber-100 font-medium text-lg">{logo.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold border ${getTypeColor(logo.type)}`}>
                        {logo.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(logo)}
                      className="p-2 rounded-lg hover:bg-amber-800/30 transition-colors"
                    >
                      {logo.is_active ? (
                        <Eye className="w-4 h-4 text-green-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingLogo(logo)}
                      className="p-2 rounded-lg hover:bg-amber-800/30 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-amber-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteLogo(logo.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                      logo.is_active 
                        ? 'bg-green-500/20 text-green-400 border-green-500/50'
                        : 'bg-red-500/20 text-red-400 border-red-500/50'
                    }`}>
                      {logo.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {logo.description && (
                    <div><span className="text-amber-300">Description:</span> <span className="text-amber-200">{logo.description}</span></div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <table className="hidden lg:table w-full">
            <thead>
              <tr className="border-b border-amber-700/30">
                <th className="text-left text-amber-200 font-semibold py-3 px-2">Preview</th>
                <th className="text-left text-amber-200 font-semibold py-3 px-2">Name</th>
                <th className="text-left text-amber-200 font-semibold py-3 px-2">Type</th>
                <th className="text-left text-amber-200 font-semibold py-3 px-2">Status</th>
                <th className="text-left text-amber-200 font-semibold py-3 px-2">Description</th>
                <th className="text-left text-amber-200 font-semibold py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {webLogos.map((logo) => (
                <tr key={logo.id} className="border-b border-amber-700/20 hover:bg-amber-800/20">
                  <td className="py-3 px-2">
                    <img 
                      src={logo.image_url} 
                      alt={logo.name}
                      className="w-12 h-12 rounded-lg object-cover border"
                      style={{ borderColor: '#8B6F47' }}
                    />
                  </td>
                  <td className="py-3 px-2 text-amber-100 font-medium">{logo.name}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getTypeColor(logo.type)}`}>
                      {logo.type}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                      logo.is_active 
                        ? 'bg-green-500/20 text-green-400 border-green-500/50'
                        : 'bg-red-500/20 text-red-400 border-red-500/50'
                    }`}>
                      {logo.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-amber-200 max-w-xs truncate">
                    {logo.description || 'No description'}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(logo)}
                        className="p-2 rounded-lg hover:bg-amber-800/30 transition-colors"
                        title={logo.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {logo.is_active ? (
                          <Eye className="w-4 h-4 text-green-400" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingLogo(logo)}
                        className="p-2 rounded-lg hover:bg-amber-800/30 transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-amber-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteLogo(logo.id)}
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

      {/* Edit/Add Logo Modal */}
      {(editingLogo || showAddForm) && (
        <LogoEditModal
          logo={editingLogo}
          onSave={handleSaveLogo}
          onClose={() => {
            setEditingLogo(null);
            setShowAddForm(false);
          }}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

// Logo Edit Modal Component
interface LogoEditModalProps {
  logo: WebLogo | null;
  onSave: (logo: Partial<WebLogo>) => void;
  onClose: () => void;
  isLoading: boolean;
}

const LogoEditModal: React.FC<LogoEditModalProps> = ({ 
  logo, 
  onSave, 
  onClose, 
  isLoading 
}) => {
  const [formData, setFormData] = useState({
    name: logo?.name || '',
    type: logo?.type || 'banner' as 'banner' | 'loading' | 'favicon' | 'logo',
    image_url: logo?.image_url || '',
    is_active: logo?.is_active ?? false,
    description: logo?.description || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleImageChange = (imageUrl: string) => {
    setFormData({ ...formData, image_url: imageUrl });
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
              <Image className="w-6 h-6 text-amber-200" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-amber-100">
              {logo ? 'Edit Web Logo' : 'Add New Web Logo'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-amber-200 text-sm font-medium mb-2">
                Logo Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 text-amber-100 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                style={{ 
                  backgroundColor: 'rgba(74, 55, 40, 0.3)', 
                  borderColor: '#8B6F47'
                }}
                required
                placeholder="e.g., Main Banner Logo"
              />
            </div>

            <div>
              <label className="block text-amber-200 text-sm font-medium mb-2">
                Logo Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-3 rounded-lg border-2 text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                style={{ 
                  backgroundColor: 'rgba(74, 55, 40, 0.3)', 
                  borderColor: '#8B6F47'
                }}
                required
              >
                <option value="banner">Banner</option>
                <option value="loading">Loading Screen</option>
                <option value="favicon">Favicon</option>
                <option value="logo">Logo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-amber-200 text-sm font-medium mb-3">
              Logo Image *
            </label>
            <ImageUpload
              currentImage={formData.image_url}
              onImageChange={handleImageChange}
              className="w-32 h-32"
            />
          </div>

          <div>
            <label className="block text-amber-200 text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border-2 text-amber-100 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              style={{ 
                backgroundColor: 'rgba(74, 55, 40, 0.3)', 
                borderColor: '#8B6F47'
              }}
              rows={3}
              placeholder="Optional description of the logo..."
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
              />
              <span className="text-amber-200 text-sm font-medium">Set as Active</span>
            </label>
            <p className="text-amber-300 text-xs ml-6">
              Note: Only one logo per type can be active at a time
            </p>
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
              disabled={isLoading || !formData.image_url}
              className="flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-amber-100 hover:text-white transition-all duration-200 hover:scale-105 font-medium border disabled:opacity-50"
              style={{ 
                backgroundColor: 'rgba(139, 111, 71, 0.8)',
                borderColor: '#8B6F47'
              }}
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : (logo ? 'Update' : 'Create')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WebLogosManager;