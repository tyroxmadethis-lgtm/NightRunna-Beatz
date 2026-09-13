import React from 'react';
import { Copyright, ShieldAlert, Mail, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CopyrightPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
          <Copyright className="h-3.5 w-3.5" /> Intellectual Property Policy
        </div>
        <h1 className="text-3xl font-extrabold text-white">Copyright & DMCA Policy</h1>
        <p className="text-sm text-zinc-400">Last updated: September 2026</p>
      </div>

      {/* Notice Banner */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3 text-amber-300 text-xs leading-relaxed">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-400 mt-0.5" />
        <div>
          <span className="font-bold">Store Owner Note:</span> All music compositions, master recordings, cover artwork, and sound samples made available through NightRunna are owned by their respective creators or properly licensed under valid copyright agreements.
        </div>
      </div>

      <div className="space-y-6 text-zinc-300 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Ownership of Content</h2>
          <p>
            NightRunna respects intellectual property rights. All beats, instrumentals, samples, sound kits, logos, and artwork displayed on this website are protected under applicable copyright laws.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li>Original musical compositions and sound recordings uploaded by NightRunna remain the exclusive property of NightRunna or its affiliated sound designers unless exclusive rights are transferred via written contract.</li>
            <li>Customers purchasing non-exclusive licenses do not gain copyright ownership of the underlying beat composition, but rather receive defined exploitation rights under their chosen license agreement.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. Content Integrity & Upload Standards</h2>
          <p>
            All audio files and cover art uploaded to this platform must belong to the uploader or be properly authorized under written clearance agreements. Uploading unauthorized third-party audio, unlicensed sample packs, or copyrighted material is strictly prohibited.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Filing a DMCA / Copyright Complaint</h2>
          <p>
            If you are a copyright owner or an agent thereof and believe that any content hosted on NightRunna infringes upon your copyright, you may submit a formal notification pursuant to the Digital Millennium Copyright Act ("DMCA").
          </p>
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-indigo-400" /> Required Notice Details
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              To submit a valid notice of claimed infringement, please send a written communication containing:
            </p>
            <ol className="list-decimal pl-5 text-xs text-zinc-400 space-y-1">
              <li>A physical or electronic signature of the copyright owner or authorized representative.</li>
              <li>Identification of the copyrighted work claimed to have been infringed.</li>
              <li>Identification of the material claimed to be infringing and its specific location on the website.</li>
              <li>Your contact information (name, email address, and phone number).</li>
              <li>A statement that you have a good faith belief that use of the material is not authorized.</li>
            </ol>
            <div className="pt-2 border-t border-zinc-800/80">
              <span className="text-xs text-zinc-300 font-semibold">Submit Copyright Notices to:</span>
              <div className="mt-1">
                <Link to="/contact" className="text-indigo-400 hover:underline text-xs flex items-center gap-1.5 font-medium">
                  <Mail className="h-3.5 w-3.5" /> Submit via Official Contact Form
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
