import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  Award,
  BarChart3, 
  Bell, 
  CreditCard, 
  Disc, 
  FileText, 
  Flame,
  HardDrive, 
  Headphones, 
  Home, 
  Image,
  LayoutDashboard, 
  ListMusic, 
  Megaphone, 
  Settings, 
  ShieldCheck, 
  ShoppingBag, 
  Sparkles,
  Store, 
  User,
  Video,
  LogOut,
  Upload
} from 'lucide-react';
import { UploadCenter } from '../components/studio/UploadCenter';
import { PlayerBar } from '../components/player/PlayerBar';

const sidebarGroups = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', path: '/studio', icon: LayoutDashboard, exact: true },
      { name: 'Stats', path: '/studio/stats', icon: BarChart3 },
    ]
  },
  {
    title: 'Content',
    items: [
      { name: 'Tracks', path: '/studio/tracks', icon: Disc },
      { name: 'Tracklists', path: '/studio/tracklists', icon: ListMusic },
      { name: 'Beat Packs', path: '/studio/beat-packs', icon: Store },
      { name: 'Videos', path: '/studio/videos', icon: Video },
      { name: 'Photos', path: '/studio/photos', icon: Image },
      { name: 'Storage', path: '/studio/storage', icon: HardDrive },
    ]
  },
  {
    title: 'Monetization & Requests',
    items: [
      { name: 'Sales', path: '/studio/sales', icon: ShoppingBag },
      { name: 'Custom Requests', path: '/studio/custom-requests', icon: Sparkles },
      { name: 'Services', path: '/studio/services', icon: Headphones },
      { name: 'Contracts', path: '/studio/contracts', icon: FileText },
      { name: 'Discounts', path: '/studio/discounts', icon: CreditCard },
      { name: 'Wallets', path: '/studio/wallets', icon: CreditCard },
    ]
  },
  {
    title: 'Marketing',
    items: [
      { name: 'Promote', path: '/studio/promote', icon: Megaphone },
      { name: 'Create Promotion', path: '/studio/create-promotion', icon: Megaphone },
      { name: 'Create Announcement / Flash Sale', path: '/studio/announcements', icon: Flame },
    ]
  },
  {
    title: 'Rights & Publishing',
    items: [
      { name: 'Creator Rights', path: '/studio/creator-rights', icon: ShieldCheck },
      { name: 'Record Plaques', path: '/studio/plaques', icon: Award },
      { name: 'Beat ID', path: '/studio/beat-id', icon: ShieldCheck },
      { name: 'Publishing', path: '/studio/publishing', icon: ShieldCheck },
      { name: 'AI Consent', path: '/studio/ai-consent', icon: ShieldCheck },
    ]
  },
  {
    title: 'Settings',
    items: [
      { name: 'Account Profile', path: '/studio/account-profile', icon: User },
      { name: 'Credentials', path: '/studio/credentials', icon: Settings },
      { name: 'Social Media', path: '/studio/social-media', icon: Settings },
      { name: 'Integrations', path: '/studio/integrations', icon: Settings },
      { name: 'Notifications', path: '/studio/notifications', icon: Bell },
      { name: 'Pro Page', path: '/studio/pro-page', icon: Store },
    ]
  }
];

export function StudioLayout() {
  const location = useLocation();
  const [isUploadCenterOpen, setIsUploadCenterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row">
      <UploadCenter isOpen={isUploadCenterOpen} onClose={() => setIsUploadCenterOpen(false)} />
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0 border-r border-zinc-800 bg-zinc-900/50 flex flex-col h-screen sticky top-0 overflow-hidden">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800 shrink-0">
          <Link to="/" className="flex items-center gap-2 text-zinc-100 hover:text-white transition-colors">
            <Home className="h-5 w-5" />
            <span className="font-bold tracking-tight">Return to Store</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-thin scrollbar-thumb-zinc-800">
          {sidebarGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = item.exact 
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path);
                    
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-600/10 text-indigo-400'
                          : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-zinc-800 shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 text-sm text-zinc-400">
            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
              <p className="font-medium text-zinc-200">Producer Name</p>
              <p className="text-xs">Pro Member</p>
            </div>
            <button className="text-zinc-500 hover:text-white p-1">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-zinc-100">Studio Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="text-zinc-400 hover:text-white relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-zinc-950"></span>
            </button>
            <button 
              onClick={() => setIsUploadCenterOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Upload className="h-4 w-4" /> Upload
            </button>
          </div>
        </header>
        <div className="flex-1 p-6 md:p-8 overflow-y-auto pb-24">
          <Outlet />
        </div>
      </main>
      <PlayerBar />
    </div>
  );
}
