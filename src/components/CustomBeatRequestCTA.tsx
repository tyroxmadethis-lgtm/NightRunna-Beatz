import React, { useState } from 'react';
import { Sparkles, ArrowRight, Music, Sliders, ShieldCheck } from 'lucide-react';
import { CustomBeatRequestModal } from './CustomBeatRequestModal';

export function CustomBeatRequestCTA() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="relative my-12 rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-950 via-zinc-900 to-purple-950 border border-indigo-500/20 p-8 sm:p-10 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="h-3.5 w-3.5" /> Custom Sound Production
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Need a Custom Beat?
            </h2>
            
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Have a specific sound, arrangement, or vision in mind? Request an exclusive or tailored instrumental directly from NightRunna.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-zinc-400 pt-1">
              <span className="flex items-center gap-1.5"><Sliders className="h-4 w-4 text-indigo-400" /> Tailored Arrangement</span>
              <span className="flex items-center gap-1.5"><Music className="h-4 w-4 text-indigo-400" /> Full Stems & WAV</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-indigo-400" /> Commercial Rights</span>
            </div>
          </div>

          <div className="flex-shrink-0 w-full md:w-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base rounded-full shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 min-h-[48px]"
            >
              <span>Request a Custom Beat</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <CustomBeatRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
