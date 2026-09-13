import { Link, Outlet, useLocation } from 'react-router-dom';
import { Headphones, Menu, Search, User, X } from 'lucide-react';
import { useState } from 'react';
import { PlayerBar } from '../components/player/PlayerBar';
import { Footer } from '../components/Footer';
import { CookieConsent } from '../components/CookieConsent';
import { AnnouncementBanner } from '../components/AnnouncementBanner';

const navLinks = [
  { name: 'Collections', path: '/collections' },
  { name: 'Beats', path: '/beats' },
  { name: 'Beat Packs', path: '/beat-packs' },
  { name: 'Hall of Fame', path: '/hall-of-fame' },
  { name: 'Videos', path: '/videos' },
  { name: 'Photos', path: '/photos' },
  { name: 'Licenses', path: '/licenses' },
];

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      {/* Storefront Active Announcement & Flash Sale Banner */}
      <AnnouncementBanner />

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-indigo-600 flex items-center justify-center">
                  <Headphones className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">NightRunna</span>
              </Link>
              
              <nav className="hidden md:flex ml-10 space-x-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search beats..."
                  className="bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm rounded-full focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2 placeholder-zinc-500"
                />
              </div>
              
              <Link to="/checkout" className="text-zinc-400 hover:text-white px-3 py-2 text-sm font-medium">
                Cart
              </Link>
              
              <Link to="/studio" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                Studio
              </Link>
              
              <Link to="/profile" className="text-zinc-400 hover:text-white">
                <User className="h-6 w-6" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-4">
              <Link to="/studio" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                Studio
              </Link>
              <button
                type="button"
                className="text-zinc-400 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800 bg-zinc-900">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === link.path
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <Link to="/checkout" className="block px-3 py-2 text-base font-medium text-zinc-400 hover:text-white">Cart</Link>
                <Link to="/profile" className="block px-3 py-2 text-base font-medium text-zinc-400 hover:text-white">Profile</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      
      {/* Footer */}
      <Footer />
      <CookieConsent />
      <PlayerBar />
    </div>
  );
}
