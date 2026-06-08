import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Crown, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ROLE_DEFINITIONS } from '../lib/roles';

interface Credit {
  id: string;
  display_name: string;
  avatar_url?: string;
  role_name: string;
  title?: string;
  contribution?: string;
  sort_order?: number;
  featured?: boolean;
  is_visible?: boolean;
}

const fallbackCredits: Credit[] = [
  {
    id: 'owner-fallback',
    display_name: 'Perry',
    role_name: 'Web Owner',
    title: 'Site Owner',
    contribution: 'Broken Blade web management and direction.',
    featured: true,
    sort_order: 0
  }
];

const roleLevel = (roleName: string) => {
  return ROLE_DEFINITIONS.find((role) => role.role_name === roleName)?.role_level || 0;
};

const Credits: React.FC = () => {
  const [credits, setCredits] = useState<Credit[]>(fallbackCredits);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const { data, error } = await supabase
        .from('credits')
        .select('id, display_name, avatar_url, role_name, title, contribution, sort_order, featured, is_visible')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true })
        .order('display_name', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        setCredits(data as Credit[]);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedCredits = useMemo(() => {
    return [...credits].sort((a, b) => {
      if ((a.featured ? 1 : 0) !== (b.featured ? 1 : 0)) {
        return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      }

      const rankDelta = roleLevel(b.role_name) - roleLevel(a.role_name);
      if (rankDelta !== 0) return rankDelta;

      return (a.sort_order || 0) - (b.sort_order || 0);
    });
  }, [credits]);

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 mt-16 flex items-center md:mt-20">
          <Link
            to="/"
            className="mr-4 rounded-lg border-2 p-3 shadow-lg transition-all duration-200 hover:scale-110"
            style={{ backgroundColor: 'rgba(24, 18, 16, 0.9)', borderColor: 'rgba(239, 68, 68, 0.55)' }}
            aria-label="Back to home"
          >
            <ArrowLeft className="h-6 w-6 text-red-100" />
          </Link>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-200">Broken Blade</p>
            <h1 className="text-3xl font-black text-stone-50 md:text-5xl">Credits</h1>
          </div>
        </div>

        <section className="mb-10 rounded-lg border-2 p-6 shadow-2xl bb-panel md:p-8">
          <h2 className="text-3xl font-black text-stone-50 md:text-5xl">The Names Behind The Blade</h2>
          <p className="mt-4 max-w-3xl text-stone-200">
            A roll call for the people shaping Broken Blade
          </p>
        </section>

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-red-400" />
            <p className="text-red-100">Loading credits...</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sortedCredits.map((credit) => (
              <article
                key={credit.id}
                className={`rounded-lg border-2 p-5 shadow-xl ${
                  credit.featured ? 'md:col-span-2 xl:col-span-1' : ''
                }`}
                style={{
                  backgroundColor: credit.featured ? 'rgba(127, 29, 29, 0.25)' : 'rgba(24, 18, 16, 0.86)',
                  borderColor: credit.featured ? 'rgba(248, 113, 113, 0.7)' : 'rgba(185, 28, 28, 0.48)'
                }}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.32)', borderColor: 'rgba(239, 68, 68, 0.54)' }}
                  >
                    {credit.avatar_url ? (
                      <img
                        src={credit.avatar_url}
                        alt={credit.display_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-red-100">
                        {credit.featured ? <Crown className="h-8 w-8" /> : <Shield className="h-8 w-8" />}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-2xl font-black text-stone-50">{credit.display_name}</h3>
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-red-200">
                      {credit.role_name}
                    </p>
                  </div>
                </div>

                {credit.contribution && (
                  <p className="relative mt-5 border-t border-red-900/40 pt-4 leading-relaxed text-stone-200">
                    {credit.contribution}
                  </p>
                )}
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
};

export default Credits;
