import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Sliders, Info, Cookie } from 'lucide-react';
import { useStore, CookieConsentPreferences } from '../contexts/StoreContext';

export function CookieConsent() {
  const { cookieConsent, saveCookieConsent } = useStore();
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  const [prefs, setPrefs] = useState({
    necessary: true,
    analytics: true,
    functional: true,
    marketing: false
  });

  useEffect(() => {
    if (!cookieConsent) {
      setShowBanner(true);
    }
  }, [cookieConsent]);

  useEffect(() => {
    const handleReopen = () => {
      setShowPreferences(true);
      if (cookieConsent) {
        setPrefs({
          necessary: true,
          analytics: cookieConsent.analytics,
          functional: cookieConsent.functional,
          marketing: cookieConsent.marketing
        });
      }
    };

    window.addEventListener('openCookieSettings', handleReopen);
    return () => window.removeEventListener('openCookieSettings', handleReopen);
  }, [cookieConsent]);

  if (!showBanner && !showPreferences) return null;

  const handleAcceptAll = () => {
    saveCookieConsent({
      necessary: true,
      analytics: true,
      functional: true,
      marketing: true
    });
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleRejectOptional = () => {
    saveCookieConsent({
      necessary: true,
      analytics: false,
      functional: false,
      marketing: false
    });
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleSavePreferences = () => {
    saveCookieConsent(prefs);
    setShowBanner(false);
    setShowPreferences(false);
  };

  return (
    <>
      {/* Main Banner */}
      {showBanner && !showPreferences && (
        <div className="fixed bottom-24 sm:bottom-20 inset-x-4 sm:inset-x-8 max-w-4xl mx-auto z-[90] bg-zinc-900/95 border border-zinc-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex-shrink-0 mt-0.5">
                <Cookie className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Privacy & Cookie Notice
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl">
                  NightRunna uses essential local storage to support core store features (audio playback, cart, and follow state) and internal analytics to improve our music catalog. You can manage your preferences or accept default settings.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end flex-shrink-0 pt-2 md:pt-0 border-t md:border-0 border-zinc-800">
              <button
                onClick={() => setShowPreferences(true)}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs rounded-full transition-colors min-h-[40px]"
              >
                Manage Preferences
              </button>
              <button
                onClick={handleRejectOptional}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs rounded-full transition-colors min-h-[40px]"
              >
                Reject Optional
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-full shadow-lg shadow-indigo-600/20 transition-colors min-h-[40px]"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6 my-8">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Sliders className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Cookie & Privacy Settings</h3>
              </div>
              <button
                onClick={() => setShowPreferences(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Necessary */}
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Essential & Necessary</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      ALWAYS ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Required for core store operation, cart persistence, audio player playback state, and producer follow tokens.
                  </p>
                </div>
                <input type="checkbox" checked disabled className="h-4 w-4 rounded border-zinc-700 text-indigo-600 focus:ring-0 opacity-60 mt-1" />
              </div>

              {/* Analytics */}
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-sm font-bold text-white">Internal Analytics</span>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Tracks storefront views and beat play counts internally to help us understand popular tracks and improve producer recommendations.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.analytics}
                  onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
                  className="h-5 w-5 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer"
                />
              </div>

              {/* Functional */}
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-sm font-bold text-white">Functional Preferences</span>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Saves your audio player volume, custom filter presets, and UI display settings across browser sessions.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.functional}
                  onChange={(e) => setPrefs({ ...prefs, functional: e.target.checked })}
                  className="h-5 w-5 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                onClick={handleRejectOptional}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs rounded-full min-h-[42px]"
              >
                Reject Optional
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-full shadow-lg shadow-indigo-600/20 min-h-[42px]"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
