import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, FolderKanban, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

interface PageRecord {
  id: string;
  category_id: string;
  status: string;
}

const Boards: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    setLoading(true);
    try {
      const [categoriesResult, pagesResult] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('pages').select('id, category_id, status').eq('status', 'published')
      ]);

      if (categoriesResult.error) throw categoriesResult.error;
      if (pagesResult.error) throw pagesResult.error;

      setCategories((categoriesResult.data || []) as Category[]);
      setPages((pagesResult.data || []) as PageRecord[]);
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const postCounts = useMemo(() => {
    return pages.reduce<Record<string, number>>((counts, page) => {
      counts[page.category_id] = (counts[page.category_id] || 0) + 1;
      return counts;
    }, {});
  }, [pages]);

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl pt-20 md:pt-24">
        <section className="mb-8 rounded-lg border-2 p-6 shadow-2xl bb-panel md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-200">Broken Blade</p>
          <h1 className="mt-2 text-4xl font-black text-stone-50 md:text-6xl">Boards</h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-stone-200">
            Browse admin-created boards and the posts attached to each one.
          </p>
        </section>

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-red-400" />
            <p className="text-red-100">Loading boards...</p>
          </div>
        ) : categories.length > 0 ? (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/boards/${category.slug}`}
                className="group rounded-lg border-2 p-5 shadow-xl transition-all duration-200 hover:-translate-y-1 hover:border-red-400/80"
                style={{ backgroundColor: 'rgba(24, 18, 16, 0.88)', borderColor: 'rgba(185, 28, 28, 0.5)' }}
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg border text-red-100"
                    style={{ backgroundColor: 'rgba(127, 29, 29, 0.25)', borderColor: 'rgba(239, 68, 68, 0.45)' }}
                  >
                    <FolderKanban className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-red-200 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
                <h2 className="text-2xl font-black text-stone-50">{category.name}</h2>
                {category.description && (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-stone-200">{category.description}</p>
                )}
                <div className="mt-5 inline-flex items-center rounded-lg border border-red-900/50 bg-black/20 px-3 py-2 text-sm text-red-100">
                  <Layers className="mr-2 h-4 w-4" />
                  {postCounts[category.id] || 0} posts
                </div>
              </Link>
            ))}
          </section>
        ) : (
          <div className="rounded-lg border-2 p-8 text-center shadow-xl bb-panel">
            <FolderKanban className="mx-auto mb-4 h-10 w-10 text-red-200" />
            <h2 className="text-2xl font-black text-stone-50">No Boards Yet</h2>
            <p className="mt-3 text-red-100">Boards created by admins will appear here.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Boards;
