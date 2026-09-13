/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PagePlaceholder } from './components/PagePlaceholder';
import { PublicLayout } from './layouts/PublicLayout';
import { StudioLayout } from './layouts/StudioLayout';
import { Home } from './pages/public/Home';
import { CollectionsPage } from './pages/public/CollectionsPage';
import { AudioPlayerPage } from './pages/public/AudioPlayerPage';
import { CheckoutPage } from './pages/public/CheckoutPage';
import { VideosPage } from './pages/public/VideosPage';
import { PhotosPage } from './pages/public/PhotosPage';
import { ProfilePage } from './pages/public/ProfilePage';
import { TermsPage } from './pages/public/TermsPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { CookiePolicyPage } from './pages/public/CookiePolicyPage';
import { CopyrightPage } from './pages/public/CopyrightPage';
import { ContactPage } from './pages/public/ContactPage';
import { Dashboard } from './pages/studio/Dashboard';
import { Tracks } from './pages/studio/Tracks';
import { BeatPacks } from './pages/studio/BeatPacks';
import { Storage } from './pages/studio/Storage';
import { Tracklists } from './pages/studio/Tracklists';
import { Promotions } from './pages/studio/Promotions';
import { CreatePromotion } from './pages/studio/CreatePromotion';
import { Sales } from './pages/studio/Sales';
import { CustomRequests } from './pages/studio/CustomRequests';
import { Stats } from './pages/studio/Stats';
import { Contracts } from './pages/studio/Contracts';
import { CreatorRights } from './pages/studio/CreatorRights';
import { BeatId } from './pages/studio/BeatId';
import { Publishing } from './pages/studio/Publishing';
import { Services } from './pages/studio/Services';
import { Discounts } from './pages/studio/Discounts';
import { Videos } from './pages/studio/Videos';
import { Photos } from './pages/studio/Photos';
import { Integrations } from './pages/studio/Integrations';
import { AccountProfile } from './pages/studio/AccountProfile';
import { SocialMedia } from './pages/studio/SocialMedia';
import { Notifications, AIConsent, Credentials } from './pages/studio/SettingsPages';
import { ProPage } from './pages/studio/ProPage';
import { NotFoundPage } from './pages/public/NotFoundPage';
import { HallOfFamePage } from './pages/public/HallOfFamePage';
import { UnsubscribePage } from './pages/public/UnsubscribePage';
import { PlaquesPage } from './pages/studio/PlaquesPage';
import { Announcements } from './pages/studio/Announcements';
import { PlayerProvider } from './contexts/PlayerContext';
import { StoreProvider } from './contexts/StoreContext';
import { 
  Music, Box, User, Video, Image, ShoppingCart, 
  FileText, Headphones, CreditCard 
} from 'lucide-react';

export default function App() {
  return (
    <StoreProvider>
      <PlayerProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="collections" element={<CollectionsPage />} />
              <Route path="audio-player" element={<AudioPlayerPage />} />
              <Route path="audio-player/:id" element={<AudioPlayerPage />} />
              <Route path="beats" element={<CollectionsPage />} />
              <Route path="beat-packs" element={<CollectionsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="videos" element={<VideosPage />} />
              <Route path="photos" element={<PhotosPage />} />
              <Route path="hall-of-fame" element={<HallOfFamePage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="licenses" element={<PagePlaceholder title="Licenses & Terms" icon={FileText} />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="cookie-policy" element={<CookiePolicyPage />} />
              <Route path="copyright" element={<CopyrightPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="unsubscribe" element={<UnsubscribePage />} />
              <Route path="404" element={<NotFoundPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Studio Routes */}
            <Route path="/studio" element={<StudioLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="storage" element={<Storage />} />
              <Route path="tracks" element={<Tracks />} />
              <Route path="tracklists" element={<Tracklists />} />
              <Route path="beat-packs" element={<BeatPacks />} />
              <Route path="videos" element={<Videos />} />
              <Route path="photos" element={<Photos />} />
              <Route path="services" element={<Services />} />
              <Route path="custom-requests" element={<CustomRequests />} />
              <Route path="contracts" element={<Contracts />} />
              <Route path="promote" element={<Promotions />} />
              <Route path="create-promotion" element={<CreatePromotion />} />
              <Route path="announcements" element={<Announcements />} />
              <Route path="discounts" element={<Discounts />} />
              <Route path="wallets" element={<PagePlaceholder title="Wallets" icon={CreditCard} />} />
              <Route path="sales" element={<Sales />} />
              <Route path="stats" element={<Stats />} />
              <Route path="creator-rights" element={<CreatorRights />} />
              <Route path="plaques" element={<PlaquesPage />} />
              <Route path="beat-id" element={<BeatId />} />
              <Route path="publishing" element={<Publishing />} />
              <Route path="integrations" element={<Integrations />} />
              <Route path="account-profile" element={<AccountProfile />} />
              <Route path="credentials" element={<Credentials />} />
              <Route path="social-media" element={<SocialMedia />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="ai-consent" element={<AIConsent />} />
              <Route path="pro-page" element={<ProPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PlayerProvider>
    </StoreProvider>
  );
}
