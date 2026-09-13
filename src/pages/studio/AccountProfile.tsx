import { User, Camera } from 'lucide-react';

export function AccountProfile() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-zinc-100">Account Profile</h2>
        <p className="text-sm text-zinc-400">Manage your public producer identity.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 bg-zinc-800 rounded-full flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 relative overflow-hidden group">
            <User className="h-8 w-8 text-zinc-500 mb-1" />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-white mb-1">Profile Photo</h3>
            <p className="text-xs text-zinc-400 mb-3">Recommended 500x500px JPG or PNG.</p>
            <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-sm font-medium transition-colors">
              Upload New
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Producer Name (Identity)</label>
          <input type="text" defaultValue="NightRunna" disabled className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-500 opacity-70 cursor-not-allowed" />
          <p className="text-[10px] text-zinc-500 mt-1">Your core identity cannot be changed.</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Bio</label>
          <textarea rows={4} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="Tell the world about your sound..."></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Store URL</label>
          <div className="flex items-center">
            <span className="px-4 py-2 bg-zinc-800 border border-zinc-800 border-r-0 rounded-l-lg text-zinc-400 text-sm">nightrunna.com/</span>
            <input type="text" defaultValue="store" className="flex-1 bg-zinc-950 border border-zinc-800 rounded-r-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
