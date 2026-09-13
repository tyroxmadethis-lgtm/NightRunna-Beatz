import { Link2 } from 'lucide-react';

export function SocialMedia() {
  const platforms = ['Instagram', 'YouTube', 'TikTok', 'X (Twitter)', 'SoundCloud'];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-zinc-100">Social Media</h2>
        <p className="text-sm text-zinc-400">Connect your profiles to display them on your store.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        {platforms.map(platform => (
          <div key={platform}>
            <label className="block text-sm font-medium text-zinc-400 mb-1">{platform}</label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder={`https://${platform.toLowerCase().replace(' (twitter)', '')}.com/username`}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-white focus:outline-none focus:border-indigo-500" 
              />
            </div>
          </div>
        ))}

        <div className="pt-4 flex justify-end">
          <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors">
            Save Links
          </button>
        </div>
      </div>
    </div>
  );
}
