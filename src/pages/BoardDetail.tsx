import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, FileText, FolderKanban, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import MarkdownContent from '../components/MarkdownContent';
import { isVideoUrl } from '../lib/media';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_url?: string;
}

interface PageRecord {
  id: string;
  category_id: string;
  title: string;
  content?: string;
  image_url?: string;
  media_urls?: string[];
  status: string;
}

const getPageMedia = (page: PageRecord) => {
  if (page.media_urls && page.media_urls.length > 0) return page.media_urls.filter(Boolean);
  return page.image_url ? [page.image_url] : [];
};

const BoardDetail: React.FC = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageRecord | null>(null);
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
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border text-red-100"
              style={{ backgroundColor: 'rgba(127, 29, 29, 0.25)', borderColor: 'rgba(239, 68, 68, 0.45)' }}
            >
              {category.icon_url ? (
                <img src={category.icon_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <FolderKanban className="h-8 w-8" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-200">Broken Blade Board</p>
              <h1 className="mt-2 text-4xl font-black text-stone-50 md:text-6xl">{category.name}</h1>
              {category.description && <p className="mt-4 max-w-3xl text-base leading-relaxed text-stone-200">{category.description}</p>}
            </div>
          </div>
        </section>

        {pages.length > 0 ? (
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {pages.map((page) => {
              const media = getPageMedia(page);
              const firstMedia = media[0];
              return (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => setSelectedPage(page)}
                  className="group rounded-lg border-2 p-0 text-left shadow-xl transition-all duration-200 hover:border-red-400/80 hover:bg-red-950/20 bb-panel"
                >
                  <div className="flex flex-col">
                    <div
                      className="flex h-40 w-full items-center justify-center overflow-hidden rounded-t-lg border-b text-red-100"
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.28)', borderColor: 'rgba(185, 28, 28, 0.35)' }}
                    >
                      {firstMedia ? (
                        isVideoUrl(firstMedia) ? (
                          <video src={firstMedia} className="h-full w-full object-cover" muted />
                        ) : (
                          <img src={firstMedia} alt={page.title} className="h-full w-full object-cover" />
                        )
                      ) : (
                        <FileText className="h-12 w-12" />
                      )}
                    </div>
                    <div className="p-5">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <h2 className="text-2xl font-black leading-tight text-stone-50">{page.title}</h2>
                        {media.length > 1 && (
                          <span className="shrink-0 rounded border border-red-900/50 bg-black/25 px-2 py-1 text-xs text-red-100">
                            {media.length}
                          </span>
                        )}
                      </div>
                      {page.content && (
                        <div className="max-h-28 overflow-hidden">
                          <MarkdownContent content={page.content} compact />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </section>
        ) : (
          <div className="rounded-lg border-2 p-8 text-center shadow-xl bb-panel">
            <FileText className="mx-auto mb-4 h-10 w-10 text-red-200" />
            <h2 className="text-2xl font-black text-stone-50">No Posts Yet</h2>
            <p className="mt-3 text-red-100">Published posts for this board will appear here.</p>
          </div>
        )}
      </div>

      <PostModal page={selectedPage} onClose={() => setSelectedPage(null)} />
    </main>
  );
};

interface PostModalProps {
  page: PageRecord | null;
  onClose: () => void;
}

const PostModal: React.FC<PostModalProps> = ({ page, onClose }) => {
  if (!page) return null;

  const media = getPageMedia(page);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border-2 p-5 shadow-2xl bb-panel animate-fade-in md:p-7">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg border border-red-900/45 bg-black/30 p-2 text-red-100 transition-colors hover:bg-red-950/40"
          aria-label="Close post"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="pr-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-200">Broken Blade Post</p>
          <h2 className="mt-2 text-3xl font-black text-stone-50 md:text-5xl">{page.title}</h2>
        </div>

        {media.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            {media.map((url) => (
              <div
                key={url}
                className="overflow-hidden rounded-lg border"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.26)', borderColor: 'rgba(185, 28, 28, 0.45)' }}
              >
                {isVideoUrl(url) ? (
                  <video src={url} className="max-h-[420px] w-full object-contain" controls />
                ) : (
                  <img src={url} alt="" className="max-h-[420px] w-full object-contain" />
                )}
              </div>
            ))}
          </div>
        )}

        {page.content && (
          <div className="mt-6 rounded-lg border border-red-900/40 bg-black/20 p-4 md:p-5">
            <MarkdownContent content={page.content} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardDetail;
