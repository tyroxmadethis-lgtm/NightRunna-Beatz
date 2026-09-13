import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, MessageSquare, Headphones, Sparkles } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { CustomBeatRequestCTA } from '../../components/CustomBeatRequestCTA';

export function ContactPage() {
  const { recordActivity } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    recordActivity('Contact Message', `Inquiry from ${formData.name} (${formData.email}): ${formData.subject}`);
    setSubmitted(true);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6 space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
          <Mail className="h-3.5 w-3.5" /> Support & Production Inquiries
        </div>
        <h1 className="text-3xl font-extrabold text-white">Contact NightRunna</h1>
        <p className="text-sm text-zinc-400">
          Have questions about licensing, custom orders, or audio engineering? Drop us a message below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Card */}
        <div className="space-y-6 md:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Headphones className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base">Producer Contact</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              For immediate questions regarding beat licenses, WAV stems, or custom collaborations, reach out directly.
            </p>
            <div className="pt-2 border-t border-zinc-800 space-y-2 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-indigo-400" />
                <span className="font-mono">support@nightrunna.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span>Response time: ~24 hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Message Sent Successfully</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Thank you for reaching out! Your message has been logged in NightRunna Studio. We will reply to <span className="text-zinc-200">{formData.email}</span> shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
                }}
                className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-full transition-colors min-h-[42px]"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{error}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Your Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Licensing & Rights">Licensing & Rights Question</option>
                  <option value="Custom Beat Inquiry">Custom Beat Inquiry</option>
                  <option value="Copyright Claim">Copyright / DMCA Notice</option>
                  <option value="Technical Support">Technical Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Message *</label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help you?"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Send className="h-4 w-4" /> Send Message
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Custom Beat Section */}
      <CustomBeatRequestCTA />
    </div>
  );
}
