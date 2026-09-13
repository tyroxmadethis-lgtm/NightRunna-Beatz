import React from 'react';
import { Cookie, Sliders, AlertCircle } from 'lucide-react';

export function CookiePolicyPage() {
  const openSettings = () => {
    window.dispatchEvent(new Event('openCookieSettings'));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
          <Cookie className="h-3.5 w-3.5" /> Browser Storage
        </div>
        <h1 className="text-3xl font-extrabold text-white">Cookie & Local Storage Policy</h1>
        <p className="text-sm text-zinc-400">Last updated: September 2026</p>
      </div>

      {/* Notice Banner */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3 text-amber-300 text-xs leading-relaxed">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-400 mt-0.5" />
        <div>
          <span className="font-bold">Store Owner Note:</span> NightRunna uses standard client-side LocalStorage to persist user preferences (such as audio player state, active cart items, and producer follow tokens) without relying on invasive third-party ad tracking.
        </div>
      </div>

      <div className="space-y-6 text-zinc-300 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. What Technologies Are Used?</h2>
          <p>
            This application uses browser LocalStorage and essential session cookies to deliver a smooth music browsing and purchasing experience.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. Categories of Storage</h2>
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
              <h3 className="font-bold text-white text-sm">Essential & Functional Storage</h3>
              <p className="text-xs text-zinc-400">
                Required for core website operations, including persistent shopping cart items during checkout, continuous audio playback state, and producer follow status.
              </p>
            </div>

            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
              <h3 className="font-bold text-white text-sm">Internal Store Analytics</h3>
              <p className="text-xs text-zinc-400">
                Maintains internal counts of beat plays, video views, and storefront visits to help us evaluate track popularity and optimize our beat catalog.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Managing Your Preferences</h2>
          <p>
            You can change your consent settings or adjust preference categories at any time using our built-in settings controller.
          </p>
          <div className="pt-2">
            <button
              onClick={openSettings}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-full transition-colors flex items-center gap-2 min-h-[44px]"
            >
              <Sliders className="h-4 w-4" /> Open Cookie & Storage Settings
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
