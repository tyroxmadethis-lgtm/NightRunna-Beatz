import { Layout, Palette, Image as ImageIcon } from 'lucide-react';

export function ProPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Pro Page Customization</h2>
          <p className="text-sm text-zinc-400">Design your public storefront.</p>
        </div>
        <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors">
          Save Layout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Palette className="h-4 w-4" /> Theme</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Primary Color</label>
                <div className="flex gap-2">
                  {['#4f46e5', '#e11d48', '#10b981', '#f59e0b', '#3b82f6'].map(color => (
                    <button key={color} className="h-8 w-8 rounded-full border-2 border-zinc-900 focus:border-white transition-all" style={{ backgroundColor: color }}></button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Layout className="h-4 w-4" /> Sections</h3>
            <div className="space-y-2">
              {['Hero Banner', 'Featured Beats', 'Latest Releases', 'Beat Packs', 'Newsletter'].map(section => (
                <label key={section} className="flex items-center justify-between p-2 bg-zinc-950 border border-zinc-800 rounded cursor-pointer">
                  <span className="text-zinc-300 text-sm">{section}</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 bg-zinc-900 border-zinc-700 rounded" />
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <div className="col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl aspect-[16/10] overflow-hidden flex flex-col">
            {/* Mock Header */}
            <div className="h-12 border-b border-zinc-800 flex items-center px-4 bg-zinc-900/50">
              <div className="font-bold text-white">NightRunna</div>
            </div>
            {/* Mock Hero */}
            <div className="h-48 bg-zinc-900 relative flex items-center justify-center border-b border-zinc-800 group">
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                 <ImageIcon className="h-6 w-6 text-white mb-2" />
                 <span className="text-xs text-zinc-300 font-medium">Update Hero Background</span>
              </div>
              <h1 className="text-2xl font-bold text-white/50">HERO BANNER</h1>
            </div>
            {/* Mock Content */}
            <div className="flex-1 p-6 space-y-4 bg-zinc-950">
               <div className="h-6 w-32 bg-zinc-900 rounded"></div>
               <div className="h-16 w-full bg-zinc-900 rounded"></div>
               <div className="h-16 w-full bg-zinc-900 rounded"></div>
            </div>
          </div>
          <p className="text-center text-xs text-zinc-500 mt-3">Live Preview (Desktop)</p>
        </div>
      </div>
    </div>
  );
}
