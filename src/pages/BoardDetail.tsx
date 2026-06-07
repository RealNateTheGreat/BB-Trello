import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, FileText, FolderKanban } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface PageRecord {
  id: string;
  category_id: string;
  title: string;
  content?: string;
  image_url?: string;
  metadata: Record<string, unknown>;
  status: string;
}

const BoardDetail: React.FC = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBoard = useCallback(async () => {
    if (!slug) return;

    setLoading(true);
    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (categoryError) throw categoryError;

      if (!categoryData) {
        setCategory(null);
        setPages([]);
        return;
      }

      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('*')
        .eq('category_id', categoryData.id)
        .eq('status', 'published')
        .order('title');

      if (pageError) throw pageError;

      setCategory(categoryData as Category);
      setPages((pageData || []) as PageRecord[]);
    } catch (error) {
      console.error('Error fetching board:', error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-red-400" />
          <p className="text-red-100">Loading board...</p>
        </div>
      </main>
    );
  }

  if (!category) {
    return (
      <main className="min-h-screen px-4 py-8 md:px-8">
        <div className="mx-auto max-w-2xl pt-24 text-center">
          <div className="rounded-lg border-2 p-8 shadow-xl bb-panel">
            <FolderKanban className="mx-auto mb-4 h-10 w-10 text-red-200" />
            <h1 className="text-3xl font-black text-stone-50">Board Not Found</h1>
            <p className="mt-3 text-red-100">That board does not exist or is no longer available.</p>
            <Link
              to="/boards"
              className="mt-6 inline-flex items-center space-x-2 rounded-lg border px-5 py-3 font-semibold text-red-50 transition-all duration-200 hover:-translate-y-0.5"
              style={{ backgroundColor: 'rgba(185, 28, 28, 0.55)', borderColor: 'rgba(239, 68, 68, 0.55)' }}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Boards</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl pt-20 md:pt-24">
        <section className="mb-8 rounded-lg border-2 p-6 shadow-2xl bb-panel md:p-8">
          <Link to="/boards" className="mb-5 inline-flex items-center text-sm font-semibold text-red-100 hover:text-stone-50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Boards
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-200">Broken Blade Board</p>
          <h1 className="mt-2 text-4xl font-black text-stone-50 md:text-6xl">{category.name}</h1>
          {category.description && <p className="mt-4 max-w-3xl text-base leading-relaxed text-stone-200">{category.description}</p>}
        </section>

        {pages.length > 0 ? (
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {pages.map((page) => (
              <article key={page.id} className="rounded-lg border-2 p-5 shadow-xl bb-panel">
                <div className="flex flex-col gap-4 sm:flex-row">
                  {page.image_url && (
                    <img src={page.image_url} alt={page.title} className="h-28 w-full rounded-lg object-cover sm:w-32" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-red-100"
                        style={{ backgroundColor: 'rgba(127, 29, 29, 0.22)', borderColor: 'rgba(239, 68, 68, 0.42)' }}
                      >
                        <FileText className="h-5 w-5" />
                      </div>
                      <h2 className="text-2xl font-black text-stone-50">{page.title}</h2>
                    </div>
                    {page.content && <p className="leading-relaxed text-stone-200">{page.content}</p>}
                  </div>
                </div>

                {Object.keys(page.metadata || {}).length > 0 && (
                  <div className="mt-5 grid grid-cols-1 gap-2 border-t border-red-900/40 pt-4 sm:grid-cols-2">
                    {Object.entries(page.metadata).map(([key, value]) => (
                      <div key={key} className="rounded-lg border border-red-900/35 bg-black/20 px-3 py-2">
                        <span className="block text-xs uppercase tracking-[0.14em] text-red-200">{key.replace(/_/g, ' ')}</span>
                        <span className="mt-1 block text-sm font-semibold text-stone-100">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </section>
        ) : (
          <div className="rounded-lg border-2 p-8 text-center shadow-xl bb-panel">
            <FileText className="mx-auto mb-4 h-10 w-10 text-red-200" />
            <h2 className="text-2xl font-black text-stone-50">No Posts Yet</h2>
            <p className="mt-3 text-red-100">Published posts for this board will appear here.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default BoardDetail;
