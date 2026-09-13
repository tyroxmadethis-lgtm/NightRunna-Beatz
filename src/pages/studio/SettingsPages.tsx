import React, { useState } from 'react';
import { Bell, ShieldCheck, Key, Send, Users, Mail, Plus, Trash2, Download, Check, AlertCircle, Smartphone, Monitor } from 'lucide-react';
import { useStore, SentNotification } from '../../contexts/StoreContext';

export function Notifications() {
  const { 
    pushSubscribers, 
    sentNotifications, 
    sendAdminNotification, 
    newsletterSubscribers, 
    deleteNewsletterSubscriber, 
    subscribeNewsletter,
    sendNewsletterBroadcast 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'push' | 'newsletter' | 'settings'>('push');

  // Push Compose Form State
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifCategory, setNotifCategory] = useState<SentNotification['category']>('Beat Release');
  const [notifUrl, setNotifUrl] = useState('');
  const [pushStatusMsg, setPushStatusMsg] = useState<string | null>(null);

  // Newsletter Form State
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterBody, setNewsletterBody] = useState('');
  const [newsletterStatusMsg, setNewsletterStatusMsg] = useState<string | null>(null);
  const [newSubEmail, setNewSubEmail] = useState('');

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifBody.trim()) return;

    const result = await sendAdminNotification({
      title: notifTitle,
      body: notifBody,
      category: notifCategory,
      url: notifUrl || undefined
    });

    setPushStatusMsg(`Broadcast sent to ${result.deliveredCount} subscriber(s)!`);
    setNotifTitle('');
    setNotifBody('');
    setNotifUrl('');
    setTimeout(() => setPushStatusMsg(null), 4000);
  };

  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterSubject.trim() || !newsletterBody.trim()) return;

    const res = await sendNewsletterBroadcast(newsletterSubject, newsletterBody);
    setNewsletterStatusMsg(res.message);
    setNewsletterSubject('');
    setNewsletterBody('');
    setTimeout(() => setNewsletterStatusMsg(null), 5000);
  };

  const handleAddSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubEmail.trim()) return;
    const res = subscribeNewsletter(newSubEmail, true);
    setNewsletterStatusMsg(res.message);
    if (res.success) setNewSubEmail('');
    setTimeout(() => setNewsletterStatusMsg(null), 4000);
  };

  const exportSubscribersCSV = () => {
    if (newsletterSubscribers.length === 0) return;
    const headers = 'ID,Email,SubscribedAt,Status,ConsentGiven,Source\n';
    const rows = newsletterSubscribers.map(s => 
      `"${s.id}","${s.email}","${s.subscribedAt}","${s.status}","${s.consentGiven}","${s.source || ''}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NightRunna_Newsletter_Subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const activePushCount = pushSubscribers.filter(s => s.status === 'Active').length;
  const activeEmailCount = newsletterSubscribers.filter(s => s.status === 'Active').length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-400" /> Notifications & Email Marketing
          </h2>
          <p className="text-sm text-zinc-400">Broadcast browser push alerts and manage store email list subscribers.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('push')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'push' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Push Broadcasts ({activePushCount})
          </button>
          <button
            onClick={() => setActiveTab('newsletter')}
            className={`px-3.5 py-1.5 rounded-md transition-all ${
              activeTab === 'newsletter' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Email List ({activeEmailCount})
          </button>
        </div>
      </div>

      {/* Push Broadcast Tab */}
      {activeTab === 'push' && (
        <div className="space-y-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs text-zinc-500 font-medium uppercase">Active Push Subscribers</p>
              <p className="text-2xl font-extrabold text-white mt-1">{activePushCount}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs text-zinc-500 font-medium uppercase">Sent Broadcasts</p>
              <p className="text-2xl font-extrabold text-indigo-400 mt-1">{sentNotifications.length}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs text-zinc-500 font-medium uppercase">Supported Devices</p>
              <p className="text-xs text-zinc-300 mt-2 font-mono flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> iOS / Android / Desktop
              </p>
            </div>
          </div>

          {/* Broadcast Composer */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-400" /> Send Push Notification
            </h3>

            <form onSubmit={handleSendPush} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Notification Category</label>
                  <select
                    value={notifCategory}
                    onChange={e => setNotifCategory(e.target.value as SentNotification['category'])}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-white"
                  >
                    <option value="Beat Release">New Beat Release</option>
                    <option value="Beat Pack">New Beat Pack</option>
                    <option value="Discount">Promotion / Discount</option>
                    <option value="Announcement">Store Announcement</option>
                    <option value="Product">New Merch / Product</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Target Action URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. /collections or /checkout"
                    value={notifUrl}
                    onChange={e => setNotifUrl(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Notification Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 🔥 New Beat Drop: Midnight Cyberpunk Instrumental!"
                  value={notifTitle}
                  onChange={e => setNotifTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Notification Message Body *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Enter the push notification text to broadcast to subscribers..."
                  value={notifBody}
                  onChange={e => setNotifBody(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {pushStatusMsg ? (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" /> {pushStatusMsg}
                  </span>
                ) : <span />}

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" /> Broadcast Push Notification
                </button>
              </div>
            </form>
          </div>

          {/* Sent Notifications History */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Broadcast History</h3>
            {sentNotifications.length > 0 ? (
              <div className="space-y-3">
                {sentNotifications.map(item => (
                  <div key={item.id} className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
                          {item.category}
                        </span>
                        <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">{item.body}</p>
                    </div>
                    <div className="text-right shrink-0 text-[11px] text-zinc-500 font-mono">
                      <div>Targets: {item.targetCount} recipient(s)</div>
                      <div>{new Date(item.sentAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 text-center py-6">No previous push broadcasts logged.</p>
            )}
          </div>
        </div>
      )}

      {/* Email List Tab */}
      {activeTab === 'newsletter' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div>
              <p className="text-xs text-zinc-400 font-mono">Total Subscribers: <strong className="text-indigo-400">{newsletterSubscribers.length}</strong></p>
              <p className="text-xs text-emerald-400 font-mono">Active: <strong>{activeEmailCount}</strong></p>
            </div>

            <button
              onClick={exportSubscribersCSV}
              disabled={newsletterSubscribers.length === 0}
              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" /> Export CSV
            </button>
          </div>

          {/* Quick Manual Add Subscriber */}
          <form onSubmit={handleAddSubscriber} className="flex gap-2 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <input
              type="email"
              required
              placeholder="Add email address manually..."
              value={newSubEmail}
              onChange={e => setNewSubEmail(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg"
            >
              Add Subscriber
            </button>
          </form>

          {/* Email Broadcast Form */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" /> Compose Email Newsletter
            </h3>

            <form onSubmit={handleSendNewsletter} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Subject Line *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NightRunna Catalog Update — New Beats & Exclusive Pack Deals"
                  value={newsletterSubject}
                  onChange={e => setNewsletterSubject(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Email Body Content *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Compose your newsletter announcement..."
                  value={newsletterBody}
                  onChange={e => setNewsletterBody(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {newsletterStatusMsg ? (
                  <span className="text-xs text-indigo-400 font-bold">{newsletterStatusMsg}</span>
                ) : <span />}

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" /> Queue Newsletter Broadcast
                </button>
              </div>
            </form>
          </div>

          {/* Subscribers Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Subscribers List</h3>
            {newsletterSubscribers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 uppercase font-mono">
                      <th className="pb-3">Email Address</th>
                      <th className="pb-3">Subscribed Date</th>
                      <th className="pb-3">Consent</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {newsletterSubscribers.map(sub => (
                      <tr key={sub.id} className="hover:bg-zinc-950/40">
                        <td className="py-3 font-medium text-zinc-200">{sub.email}</td>
                        <td className="py-3 text-zinc-500 font-mono">{new Date(sub.subscribedAt).toLocaleDateString()}</td>
                        <td className="py-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Verified Consent
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            sub.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => deleteNewsletterSubscriber(sub.id)}
                            className="p-1 text-zinc-500 hover:text-red-400 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 text-center py-6">No newsletter subscribers logged yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function AIConsent() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-zinc-100">AI Consent & Training</h2>
        <p className="text-sm text-zinc-400">Manage how AI features interact with your catalog.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
        <div className="flex items-start gap-4 p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
          <ShieldCheck className="h-6 w-6 text-indigo-400 shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-white mb-1">Catalog Analysis</h3>
            <p className="text-sm text-zinc-400 mb-3">Allow NightRunna AI to analyze your beats to automatically generate BPM, Key, and Genre tags during upload.</p>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 bg-zinc-900 border-zinc-700 rounded" />
              Enable Analysis
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Credentials() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-zinc-100">Security & Credentials</h2>
        <p className="text-sm text-zinc-400">Manage your account access securely.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-zinc-900 rounded-full flex items-center justify-center">
              <Key className="h-5 w-5 text-zinc-400" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Password</p>
              <p className="text-xs text-zinc-500">Last changed 3 months ago</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-sm font-medium transition-colors">
            Update
          </button>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-zinc-900 rounded-full flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Two-Factor Authentication</p>
              <p className="text-xs text-zinc-500">Currently enabled</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-sm font-medium transition-colors">
            Manage
          </button>
        </div>
      </div>
    </div>
  );
}
