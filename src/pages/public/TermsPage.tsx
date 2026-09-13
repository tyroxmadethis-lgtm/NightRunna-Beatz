import React from 'react';
import { FileText, Shield, AlertCircle } from 'lucide-react';

export function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
          <FileText className="h-3.5 w-3.5" /> Legal Document
        </div>
        <h1 className="text-3xl font-extrabold text-white">Terms of Service</h1>
        <p className="text-sm text-zinc-400">Last updated: September 2026</p>
      </div>

      {/* Template Notice Banner */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3 text-amber-300 text-xs leading-relaxed">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-400 mt-0.5" />
        <div>
          <span className="font-bold">Store Owner Note:</span> This Terms of Service document provides a standard operational template for music licensing, digital beat sales, and storefront usage. Please review and customize the placeholder brackets with your specific business details as required in your jurisdiction.
        </div>
      </div>

      <div className="space-y-6 text-zinc-300 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Overview & Agreement</h2>
          <p>
            Welcome to NightRunna ("Storefront", "We", "Us"). By accessing or purchasing music instrumentals, beat packs, or custom production services through this application, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you should discontinue use of the platform immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. Music Licensing & Usage Rights</h2>
          <p>
            All digital beats, tracks, and audio samples sold on NightRunna are licensed, not sold. Purchasing an instrumental grants you a non-exclusive or exclusive license according to the specific license tier selected at checkout (e.g., MP3 Lease, WAV Lease, Unlimited License, or Exclusive Rights).
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li>Non-exclusive licenses remain available for sale to other artists unless exclusive rights are purchased.</li>
            <li>All leased instrumentals require proper producer credit (e.g., "Prod. by NightRunna").</li>
            <li>Reselling, re-licensing, or redistributing standalone audio files is strictly prohibited.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Digital Downloads & Refund Policy</h2>
          <p>
            Due to the digital and instantly downloadable nature of audio files (WAV, MP3, ZIP Stems), all sales are final once digital files have been delivered or downloaded. If you experience technical difficulties with file delivery or corrupted downloads, please contact us immediately for assistance.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">4. Custom Beat Production</h2>
          <p>
            Custom beat requests submitted through the storefront constitute an inquiry for tailored music production. Turnaround time, pricing, royalty splits, and exclusive licensing terms for custom work will be mutually agreed upon in writing prior to project commencement.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">5. Limitation of Liability</h2>
          <p>
            NightRunna provides this application and its digital content on an "as is" and "as available" basis without warranties of any kind, express or implied. NightRunna shall not be liable for indirect, incidental, or consequential damages arising from the use of licensed music files.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">6. Contact Information</h2>
          <p>
            For inquiries regarding terms, licensing agreements, or custom contracts, please contact us via our official <a href="/contact" className="text-indigo-400 hover:underline">Contact Page</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
