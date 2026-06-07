import React from 'react';
import brokenBladeBanner from '../images/broken-blade-banner.png';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="absolute inset-0">
        <img src={brokenBladeBanner} alt="Broken Blade loading" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="relative flex w-full max-w-xl flex-col items-center px-6 text-center animate-fade-in">
        <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-red-950">
          <div className="h-full w-1/2 animate-blade-sweep bg-gradient-to-r from-transparent via-red-400 to-transparent" />
        </div>
        <h1 className="text-4xl font-black text-stone-50 md:text-6xl">Broken Blade</h1>
        <p className="mt-3 text-lg font-semibold text-red-100 animate-pulse">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
