import React from 'react';
import { Shield, Lock, Eye, AlertCircle } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
          <Shield className="h-3.5 w-3.5" /> Privacy & Data Policy
        </div>
        <h1 className="text-3xl font-extrabold text-white">Privacy Policy</h1>
        <p className="text-sm text-zinc-400">Last updated: September 2026</p>
      </div>

      {/* Template Notice Banner */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3 text-amber-300 text-xs leading-relaxed">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-400 mt-0.5" />
        <div>
          <span className="font-bold">Store Owner Note:</span> This Privacy Policy template describes default local storage usage and customer order processing on NightRunna. Please update this document if you connect external tracking pixels or third-party CRM systems.
        </div>
      </div>

      <div className="space-y-6 text-zinc-300 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
          <p>
            NightRunna values visitor privacy. We collect minimal personal information required to fulfill digital orders, process custom beat inquiries, and maintain storefront functionality:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li><strong className="text-zinc-200">Order Information:</strong> Name, email address, and payment confirmation details provided during checkout for delivery of licensed audio files.</li>
            <li><strong className="text-zinc-200">Custom Beat Requests:</strong> Contact information, artist name, budget parameters, and creative specifications submitted via custom inquiry forms.</li>
            <li><strong className="text-zinc-200">Local Browser Storage:</strong> Preference flags, shopping cart items, audio player volume settings, and follower tokens stored locally on your device.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. How We Use Your Information</h2>
          <p>
            Your information is used strictly to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li>Deliver digital audio licenses and download links for purchased beats.</li>
            <li>Respond to custom production inquiries and communicate regarding project scopes.</li>
            <li>Maintain internal storefront analytics (track play counts and beat view totals).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Third-Party Services & Payments</h2>
          <p>
            Payment processing for digital purchases is handled securely by third-party payment providers (e.g. PayPal). NightRunna does not store full credit card or sensitive financial credentials on our servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">4. Data Protection & Your Rights</h2>
          <p>
            You have the right to request access to or deletion of any personal contact information submitted through custom request forms or order records. You can also clear local browser storage at any time using your browser settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">5. Contact Us</h2>
          <p>
            If you have questions regarding this Privacy Policy, please reach out through our <a href="/contact" className="text-indigo-400 hover:underline">Contact Page</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
