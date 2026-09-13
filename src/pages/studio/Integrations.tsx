import React, { useState } from 'react';
import { Settings, CheckCircle2, Circle, Mail, Check } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';

export function Integrations() {
  const { paypalEmail, setPaypalEmail } = useStore();
  const [emailInput, setEmailInput] = useState(paypalEmail);
  const [saved, setSaved] = useState(false);

  const handleSavePaypal = (e: React.FormEvent) => {
    e.preventDefault();
    setPaypalEmail(emailInput);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-100">Integrations</h2>
        <p className="text-sm text-zinc-400">Connect payment services to your NightRunna store.</p>
      </div>

      {/* PayPal Email Configuration */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-zinc-100 text-lg">PayPal Seller Email</h3>
              {paypalEmail ? (
                <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Ready for Checkout
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold bg-amber-500/10 px-2.5 py-1 rounded-full">
                  <Circle className="h-3.5 w-3.5" /> Email Required
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Provide the PayPal email address associated with your personal or business account to receive payments from NightRunna sales directly.
            </p>
          </div>
        </div>

        <form onSubmit={handleSavePaypal} className="mt-4 flex flex-col sm:flex-row gap-3 max-w-xl">
          <div className="relative flex-1">
            <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input 
              type="email" 
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="your-paypal-email@example.com"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button 
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shrink-0"
          >
            {saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save Payment Email'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-zinc-100 text-lg">Stripe</h3>
              <p className="text-sm text-zinc-400 mt-1">Process credit card payments securely.</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium bg-emerald-500/10 px-2 py-1 rounded">
              <CheckCircle2 className="h-4 w-4" /> Connected
            </div>
          </div>
          <div className="mt-auto pt-6">
            <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors">
              Configure
            </button>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-zinc-100 text-lg">Mailchimp</h3>
              <p className="text-sm text-zinc-400 mt-1">Sync customer emails for marketing.</p>
            </div>
            <div className="flex items-center gap-1 text-zinc-500 text-sm font-medium bg-zinc-800 px-2 py-1 rounded">
              <Circle className="h-4 w-4" /> Not Connected
            </div>
          </div>
          <div className="mt-auto pt-6">
            <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
              Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
