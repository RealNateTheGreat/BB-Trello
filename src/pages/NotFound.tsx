import React from 'react';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl text-center">
        <div className="mb-8 overflow-hidden rounded-lg border-2 p-8 shadow-2xl bb-panel">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-200">Broken Blade</p>
          <h1 className="mt-3 text-7xl font-black text-stone-50">404</h1>
          <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-red-500/70" />
        </div>

        <div className="rounded-lg border-2 p-8 shadow-xl bb-panel">
          <h2 className="mb-4 text-3xl font-black text-stone-50">Page Not Found</h2>
          <p className="mb-6 text-red-100">That page has been moved or removed.</p>

          <Link
            to="/"
            className="inline-flex items-center space-x-2 rounded-lg border px-6 py-3 font-semibold text-red-50 transition-all duration-200 hover:scale-105"
            style={{ backgroundColor: 'rgba(185, 28, 28, 0.55)', borderColor: 'rgba(239, 68, 68, 0.55)' }}
          >
            <Home className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
