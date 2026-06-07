import React from 'react';
import InformationSection from '../components/InformationSection';
import Sparkles from '../components/Sparkles';
import brokenBladeBanner from '../images/broken-blade-banner.png';

const Home: React.FC = () => {
  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="flex min-h-[420px] items-center justify-center pt-16 md:pt-20">
          <div className="relative w-full animate-fade-in">
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-red-500/70 to-transparent" />
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-lg border-2 shadow-2xl bb-hero-frame">
              <img
                src={brokenBladeBanner}
                alt="Broken Blade"
                className="h-full min-h-[250px] w-full object-cover object-center md:min-h-[360px]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-200">Broken Blade</p>
                <h1 className="mt-2 text-4xl font-black text-stone-50 md:text-6xl">Broken Blade</h1>
                <p className="mt-3 max-w-2xl text-sm text-stone-200 md:text-base">
                  Forged for the Broken Blade community, sharpened for the people keeping it alive.
                </p>
              </div>
              <Sparkles />
            </div>
          </div>
        </section>

        <InformationSection />
      </div>
    </main>
  );
};

export default Home;
