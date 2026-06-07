import React, { useEffect, useState } from 'react';
import { Edit3, FolderPlus, Plus, Save, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { User } from '../../contexts/AuthContext';
import { hasPermission } from '../../lib/roles';
import ImageUpload from '../ImageUpload';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

interface Page {
  id: string;
  category_id: string;
  title: string;
  content?: string;
  image_url?: string;
  metadata: Record<string, unknown>;
  status: string;
  created_by?: string;
}

interface BoardsManagerProps {
  categories: Category[];
  pages: Page[];
  currentUser: User;
  onRefresh: () => void;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const BoardsManager: React.FC<BoardsManagerProps> = ({ categories, pages, currentUser, onRefresh }) => {
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [showPageForm, setShowPageForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const canManageContent = hasPermission(currentUser.permissions, 'manage_content');
  const canManageCategories = hasPermission(currentUser.permissions, 'manage_categories');
  const canDeleteContent = hasPermission(currentUser.permissions, 'delete_content');

  useEffect(() => {
    if (!activeCategoryId && categories.length > 0) {
      setActiveCategoryId(categories[0].id);
      return;
    }

    if (activeCategoryId && !categories.some((category) => category.id === activeCategoryId)) {
      setActiveCategoryId(categories[0]?.id || '');
    }
  }, [activeCategoryId, categories]);

  const activeCategory = categories.find((category) => category.id === activeCategoryId);
  const categoryPages = pages.filter((page) => page.category_id === activeCategoryId);

  const handleSaveCategory = async (categoryData: Partial<Category>) => {
    setIsLoading(true);
    try {
      const payload = {
        ...categoryData,
        slug: slugify(categoryData.slug || categoryData.name || '')
      };

      if (editingCategory) {
        const { error } = await supabase.from('categories').update(payload).eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert(payload);
        if (error) throw error;
      }

      onRefresh();
      setEditingCategory(null);
      setShowCategoryForm(false);
    } catch (error) {
      console.error('Error saving board:', error);
      alert('Failed to save board.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!canDeleteContent) return;
    if (!confirm(`Delete "${category.name}" and every post inside it?`)) return;

    setIsLoading(true);
    try {
      const { error: pagesError } = await supabase.from('pages').delete().eq('category_id', category.id);
      if (pagesError) throw pagesError;

      const { error } = await supabase.from('categories').delete().eq('id', category.id);
      if (error) throw error;

      onRefresh();
    } catch (error) {
      console.error('Error deleting board:', error);
      alert('Failed to delete board.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePage = async (pageData: Partial<Page>) => {
    if (!activeCategory) return;
    setIsLoading(true);

    try {
      if (editingPage) {
        const { error } = await supabase.from('pages').update(pageData).eq('id', editingPage.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('pages').insert({
          ...pageData,
          category_id: activeCategory.id,
          created_by: currentUser.id
        });
        if (error) throw error;
      }

      onRefresh();
      setEditingPage(null);
      setShowPageForm(false);
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePage = async (page: Page) => {
    if (!canDeleteContent) return;
    if (!confirm(`Delete "${page.title}"?`)) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from('pages').delete().eq('id', page.id);
      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-8 rounded-lg border-2 p-4 shadow-xl md:p-6 bb-panel">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black text-stone-50">Content Boards</h2>
          <p className="text-sm text-red-100/80">{categories.length} boards, {pages.length} posts</p>
        </div>
        {canManageCategories && (
          <button
            onClick={() => setShowCategoryForm(true)}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 rounded-lg border-2 px-4 py-2 text-sm font-semibold text-red-50 transition-all duration-200 hover:scale-105 disabled:opacity-50"
            style={{ backgroundColor: 'rgba(127, 29, 29, 0.35)', borderColor: 'rgba(239, 68, 68, 0.55)' }}
          >
            <FolderPlus className="h-4 w-4" />
            <span>Add Board</span>
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategoryId(category.id)}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-all duration-200 ${
              activeCategoryId === category.id
                ? 'border-red-400 bg-red-700/35 text-stone-50'
                : 'border-red-900/50 bg-black/20 text-red-100 hover:bg-red-950/35'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {activeCategory ? (
        <>
          <div className="mb-5 flex flex-col justify-between gap-4 rounded-lg border border-red-900/40 bg-black/20 p-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-bold text-stone-50">{activeCategory.name}</h3>
              {activeCategory.description && <p className="mt-1 text-sm text-red-100/80">{activeCategory.description}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {canManageCategories && (
                <button
                  onClick={() => setEditingCategory(activeCategory)}
                  className="rounded-lg border px-3 py-2 text-sm text-red-100 transition-colors hover:bg-red-950/30"
                  style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}
                >
                  Edit Board
                </button>
              )}
              {canDeleteContent && (
                <button
                  onClick={() => handleDeleteCategory(activeCategory)}
                  className="rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-200 transition-colors hover:bg-red-500/15"
                >
                  Delete Board
                </button>
              )}
              {canManageContent && (
                <button
                  onClick={() => setShowPageForm(true)}
                  className="flex items-center space-x-2 rounded-lg border px-3 py-2 text-sm font-semibold text-stone-50 transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: 'rgba(185, 28, 28, 0.45)', borderColor: 'rgba(239, 68, 68, 0.55)' }}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Post</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {categoryPages.map((page) => (
              <article
                key={page.id}
                className="rounded-lg border p-4 transition-all duration-200 hover:border-red-400/70 hover:bg-red-950/20"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.22)', borderColor: 'rgba(185, 28, 28, 0.35)' }}
              >
                <div className="flex gap-4">
                  {page.image_url && (
                    <img src={page.image_url} alt={page.title} className="h-20 w-20 shrink-0 rounded-lg object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="truncate text-lg font-bold text-stone-50">{page.title}</h4>
                        <span className="text-xs uppercase tracking-[0.14em] text-red-200">{page.status}</span>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        {canManageContent && (
                          <button
                            onClick={() => setEditingPage(page)}
                            className="rounded-lg p-2 text-red-100 transition-colors hover:bg-red-950/40"
                            aria-label={`Edit ${page.title}`}
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        )}
                        {canDeleteContent && (
                          <button
                            onClick={() => handleDeletePage(page)}
                            className="rounded-lg p-2 text-red-300 transition-colors hover:bg-red-500/15"
                            aria-label={`Delete ${page.title}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    {page.content && <p className="line-clamp-2 text-sm text-stone-200">{page.content}</p>}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {categoryPages.length === 0 && (
            <div className="rounded-lg border border-red-900/40 bg-black/20 p-8 text-center text-red-100">
              No posts yet.
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-red-900/40 bg-black/20 p-8 text-center text-red-100">
          No boards yet.
        </div>
      )}

      {(editingCategory || showCategoryForm) && (
        <CategoryModal
          category={editingCategory}
          onSave={handleSaveCategory}
          onClose={() => {
            setEditingCategory(null);
            setShowCategoryForm(false);
          }}
          isLoading={isLoading}
        />
      )}

      {(editingPage || showPageForm) && activeCategory && (
        <PageModal
          page={editingPage}
          categoryName={activeCategory.name}
          onSave={handleSavePage}
          onClose={() => {
            setEditingPage(null);
            setShowPageForm(false);
          }}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

interface CategoryModalProps {
  category: Category | null;
  onSave: (category: Partial<Category>) => void;
  onClose: () => void;
  isLoading: boolean;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ category, onSave, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    icon: category?.icon || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, slug: formData.slug || slugify(formData.name) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-lg border-2 p-6 shadow-2xl bb-panel animate-fade-in">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-2xl font-black text-stone-50">{category ? 'Edit Board' : 'Add Board'}</h3>
          <button onClick={onClose} className="rounded-lg p-2 text-red-100 hover:bg-red-950/40" aria-label="Close">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Board Name">
            <input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bb-input"
              required
            />
          </Field>
          <Field label="Slug">
            <input
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="bb-input"
              placeholder="auto-created if empty"
            />
          </Field>
          <Field label="Description">
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bb-input min-h-24"
            />
          </Field>
          <Field label="Icon Label">
            <input
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="bb-input"
              placeholder="Optional"
            />
          </Field>
          <ModalActions onClose={onClose} isLoading={isLoading} action={category ? 'Update Board' : 'Create Board'} />
        </form>
      </div>
    </div>
  );
};

interface PageModalProps {
  page: Page | null;
  categoryName: string;
  onSave: (page: Partial<Page>) => void;
  onClose: () => void;
  isLoading: boolean;
}

const PageModal: React.FC<PageModalProps> = ({ page, categoryName, onSave, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    title: page?.title || '',
    content: page?.content || '',
    image_url: page?.image_url || '',
    status: page?.status || 'published',
    metadata: page?.metadata || {}
  });
  const [newMetadataKey, setNewMetadataKey] = useState('');
  const [newMetadataValue, setNewMetadataValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addMetadata = () => {
    if (!newMetadataKey || !newMetadataValue) return;
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        [newMetadataKey]: newMetadataValue
      }
    });
    setNewMetadataKey('');
    setNewMetadataValue('');
  };

  const removeMetadata = (key: string) => {
    const metadata = { ...formData.metadata };
    delete metadata[key];
    setFormData({ ...formData, metadata });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border-2 p-6 shadow-2xl bb-panel animate-fade-in">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-stone-50">{page ? 'Edit Post' : 'Add Post'}</h3>
            <p className="text-sm text-red-100/80">{categoryName}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-red-100 hover:bg-red-950/40" aria-label="Close">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Title">
              <input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bb-input"
                required
              />
            </Field>
            <Field label="Status">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="bb-input"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
          </div>

          <Field label="Image">
            <ImageUpload
              currentImage={formData.image_url}
              onImageChange={(imageUrl) => setFormData({ ...formData, image_url: imageUrl })}
              className="h-28 w-28"
            />
          </Field>

          <Field label="Content">
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="bb-input min-h-28"
            />
          </Field>

          <Field label="Metadata">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]">
              <input
                value={newMetadataKey}
                onChange={(e) => setNewMetadataKey(e.target.value)}
                className="bb-input"
                placeholder="Key"
              />
              <input
                value={newMetadataValue}
                onChange={(e) => setNewMetadataValue(e.target.value)}
                className="bb-input"
                placeholder="Value"
              />
              <button
                type="button"
                onClick={addMetadata}
                className="rounded-lg border border-red-500/40 px-4 py-3 text-sm font-semibold text-red-100 hover:bg-red-950/30"
              >
                Add
              </button>
            </div>
            {Object.keys(formData.metadata).length > 0 && (
              <div className="mt-3 rounded-lg border border-red-900/40 bg-black/20 p-3">
                {Object.entries(formData.metadata).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-3 py-1 text-sm">
                    <span className="text-red-100">{key}: {String(value)}</span>
                    <button type="button" onClick={() => removeMetadata(key)} className="text-red-300 hover:text-red-100">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Field>

          <ModalActions onClose={onClose} isLoading={isLoading} action={page ? 'Update Post' : 'Create Post'} />
        </form>
      </div>
    </div>
  );
};

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, children }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-red-100">{label}</span>
    {children}
  </label>
);

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

export default BoardsManager;
