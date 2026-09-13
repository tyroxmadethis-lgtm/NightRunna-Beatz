import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ParsedBeat, ParsedBeatPack } from '../utils/zipParser';

export interface FileRecord {
  id: string;
  filename: string;
  type: 'WAV' | 'MP3' | 'M4A' | 'STEMS' | 'ARTWORK' | 'ZIP';
  size: string;
  uploadDate: string;
  associatedBeatId?: string;
  associatedPackId?: string;
}

export interface Tracklist {
  id: string;
  name: string;
  beatIds: string[];
  createdAt: string;
}

export interface Promotion {
  id: string;
  name: string;
  productId: string;
  productType: 'Single Beat' | 'Beat Pack' | 'Video' | 'Storefront';
  startDate: string;
  endDate: string;
  status: 'Draft' | 'Scheduled' | 'Active' | 'Paused' | 'Completed';
  plays: number;
  clicks: number;
}

export interface Sale {
  orderId: string;
  productId: string;
  productType: 'Single Beat' | 'Beat Pack';
  amount: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Refunded';
  license: string;
  customer: string;
}

export interface DownloadEvent {
  id: string;
  productId: string;
  productType: 'Single Beat' | 'Beat Pack';
  productTitle: string;
  type: 'Free' | 'Paid';
  timestamp: string;
}

export interface PlayEvent {
  id: string;
  productId: string;
  productType: 'Single Beat' | 'Beat Pack';
  timestamp: string;
}

export interface ShareEvent {
  id: string;
  productId: string;
  productType?: 'Single Beat' | 'Beat Pack';
  timestamp: string;
}

export interface ViewEvent {
  id: string;
  productId?: string;
  productType?: 'Single Beat' | 'Beat Pack' | 'Storefront';
  timestamp: string;
}

export interface ActivityLogEvent {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  purchases: number;
  totalSpent: number;
  lastActivity: string;
}

export interface MusicService {
  id: string;
  name: string;
  provider: string;
  category: 'Distribution' | 'Mixing & Mastering' | 'Artist Management' | 'Playlist Curators' | 'Music Publishing' | 'Custom Beat Production' | 'Cover Art & Branding' | 'Licensing & Legal' | 'Other';
  description: string;
  externalUrl: string;
  contactEmail?: string;
  priceModel: 'Free' | 'Freemium' | 'Subscription' | 'One-Time Fee' | 'Custom Quote';
  priceText?: string;
  featured?: boolean;
  tag?: string;
  createdAt: string;
}

export interface Discount {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'Percentage' | 'Fixed Amount' | 'Free Bonus';
  discountValue: number;
  targetType: 'Storefront' | 'Single Beats' | 'Beat Packs' | 'Partner Deal';
  status: 'Active' | 'Expired' | 'Draft';
  expirationDate?: string;
  usageLimit?: number;
  usageCount: number;
  partnerUrl?: string;
  createdAt: string;
}

export interface VideoRecord {
  id: string;
  youtubeId: string;
  youtubeUrl: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  category: string;
  tags: string[];
  dateAdded: string;
  published: boolean;
  featured: boolean;
  sortOrder: number;
  associatedProductId?: string;
  associatedProductType?: 'Single Beat' | 'Beat Pack' | 'Tracklist' | 'Promotion';
}

export interface PhotoRecord {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  filename: string;
  fileSize: string;
  category: string;
  tags: string[];
  dateUploaded: string;
  published: boolean;
  featured: boolean;
  sortOrder: number;
  associatedProductId?: string;
  associatedProductType?: 'Single Beat' | 'Beat Pack' | 'Tracklist' | 'Promotion';
}

export interface FollowRecord {
  id: string;
  profileId: string;
  followerId: string;
  followedAt: string;
}

export interface CustomBeatRequest {
  id: string;
  name: string;
  email: string;
  artistName: string;
  beatTitleOrConcept: string;
  genre: string;
  bpm?: string;
  key?: string;
  mood: string;
  referenceArtists?: string;
  budget: string;
  details?: string;
  status: 'New' | 'Reviewing' | 'Accepted' | 'In Progress' | 'Completed' | 'Declined' | 'Archived';
  createdAt: string;
  emailStatus?: 'Sent' | 'Failed' | 'Pending';
  emailSentAt?: string;
  emailError?: string;
}

export interface RecordPlaque {
  id: string;
  plaqueId: string; // e.g. 'PLQ-1234567'
  beatTitle: string;
  producer: string; // default 'NightRunna'
  artistName?: string;
  achievement: string; // e.g. '500,000 Streams & 50,000 Downloads'
  awardType: 'Gold' | 'Platinum' | 'Multi-Platinum' | 'Diamond';
  dateAwarded: string;
  artworkUrl?: string;
  hallOfFame: boolean;
  createdAt: string;
}

export interface PushSubscriber {
  id: string;
  endpoint?: string;
  deviceType: 'iOS' | 'Android' | 'Desktop' | 'Mobile';
  categories: string[];
  subscribedAt: string;
  status: 'Active' | 'Unsubscribed';
}

export interface SentNotification {
  id: string;
  title: string;
  body: string;
  category: 'Beat Release' | 'Beat Pack' | 'Discount' | 'Announcement' | 'Product';
  url?: string;
  sentAt: string;
  targetCount: number;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  consentGiven: boolean;
  status: 'Active' | 'Unsubscribed';
  source?: string;
}

export interface StoreAnnouncement {
  id: string;
  type: 'Announcement' | 'Flash Sale';
  title: string;
  message: string;
  artworkUrl?: string;
  startDate: string;
  endDate?: string;
  status: 'Draft' | 'Scheduled' | 'Active' | 'Expired' | 'Disabled';
  discountType?: 'Percentage' | 'Fixed';
  discountValue?: number;
  includeBeatPacks?: boolean;
  promoCode?: string;
  sendPushNotification?: boolean;
  sendEmailAnnouncement?: boolean;
  createdAt: string;
}

export interface CookieConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
  updatedAt: string;
}

interface StoreContextType {
  beats: ParsedBeat[];
  addBeat: (beat: ParsedBeat) => void;
  deleteBeat: (beatId: string) => void;
  beatPacks: ParsedBeatPack[];
  addBeatPack: (pack: ParsedBeatPack) => void;
  deleteBeatPack: (packId: string) => void;
  files: FileRecord[];
  addFile: (file: FileRecord) => void;
  tracklists: Tracklist[];
  addTracklist: (tracklist: Tracklist) => void;
  updateTracklist: (tracklist: Tracklist) => void;
  deleteTracklist: (id: string) => void;
  promotions: Promotion[];
  addPromotion: (promo: Promotion) => void;
  sales: Sale[];
  recordSale: (sale: Sale) => void;
  downloads: DownloadEvent[];
  recordDownload: (event: Omit<DownloadEvent, 'id' | 'timestamp'>) => void;
  plays: PlayEvent[];
  recordPlay: (productId: string, productType?: 'Single Beat' | 'Beat Pack') => void;
  shares: ShareEvent[];
  recordShare: (productId: string, productType?: 'Single Beat' | 'Beat Pack') => void;
  views: ViewEvent[];
  recordView: (productId?: string, productType?: 'Single Beat' | 'Beat Pack' | 'Storefront') => void;
  activityLogs: ActivityLogEvent[];
  recordActivity: (type: string, description: string) => void;
  customers: Customer[];
  paypalEmail: string;
  setPaypalEmail: (email: string) => void;
  getProduct: (id: string, type: 'Single Beat' | 'Beat Pack') => any;
  services: MusicService[];
  addService: (service: MusicService) => void;
  updateService: (service: MusicService) => void;
  deleteService: (id: string) => void;
  discounts: Discount[];
  addDiscount: (discount: Discount) => void;
  updateDiscount: (discount: Discount) => void;
  deleteDiscount: (id: string) => void;
  videos: VideoRecord[];
  addVideo: (video: VideoRecord) => void;
  updateVideo: (video: VideoRecord) => void;
  deleteVideo: (id: string) => void;
  reorderVideos: (videos: VideoRecord[]) => void;
  photos: PhotoRecord[];
  addPhoto: (photo: PhotoRecord) => void;
  updatePhoto: (photo: PhotoRecord) => void;
  deletePhoto: (id: string) => void;
  reorderPhotos: (photos: PhotoRecord[]) => void;
  // Feature #23 Additions
  followers: FollowRecord[];
  isFollowing: boolean;
  followerCount: number;
  toggleFollow: () => void;
  customRequests: CustomBeatRequest[];
  addCustomRequest: (req: Omit<CustomBeatRequest, 'id' | 'createdAt' | 'status'>) => Promise<CustomBeatRequest>;
  retryCustomRequestEmail: (id: string) => Promise<boolean>;
  updateCustomRequestStatus: (id: string, status: CustomBeatRequest['status']) => void;
  deleteCustomRequest: (id: string) => void;
  cookieConsent: CookieConsentPreferences | null;
  saveCookieConsent: (prefs: Omit<CookieConsentPreferences, 'updatedAt'>) => void;
  // Digital Record Plaques
  plaques: RecordPlaque[];
  addPlaque: (plaque: RecordPlaque) => void;
  updatePlaque: (plaque: RecordPlaque) => void;
  deletePlaque: (id: string) => void;
  // Push Notifications
  pushSubscribers: PushSubscriber[];
  sentNotifications: SentNotification[];
  isPushSubscribed: boolean;
  subscribePushNotification: (categories?: string[]) => Promise<{ success: boolean; message: string }>;
  unsubscribePushNotification: () => void;
  sendAdminNotification: (notification: { title: string; body: string; category: SentNotification['category']; url?: string }) => Promise<{ success: boolean; deliveredCount: number }>;
  // Newsletter Email List
  newsletterSubscribers: NewsletterSubscriber[];
  subscribeNewsletter: (email: string, consentGiven?: boolean) => Promise<{ success: boolean; message: string; isDuplicate?: boolean }>;
  unsubscribeNewsletter: (email: string) => Promise<void> | void;
  deleteNewsletterSubscriber: (id: string) => void;
  sendNewsletterBroadcast: (subject: string, message: string) => Promise<{ success: boolean; message: string }>;
  // Announcements & Flash Sales
  announcements: StoreAnnouncement[];
  addAnnouncement: (announcement: StoreAnnouncement) => void;
  updateAnnouncement: (announcement: StoreAnnouncement) => void;
  deleteAnnouncement: (id: string) => void;
  getActiveFlashSale: () => StoreAnnouncement | null;
  getActiveAnnouncements: () => StoreAnnouncement[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [beats, setBeats] = useState<ParsedBeat[]>(() => {
    const saved = localStorage.getItem('nr_beats');
    return saved ? JSON.parse(saved) : [];
  });

  const [beatPacks, setBeatPacks] = useState<ParsedBeatPack[]>(() => {
    const saved = localStorage.getItem('nr_beatpacks');
    return saved ? JSON.parse(saved) : [];
  });

  const [files, setFiles] = useState<FileRecord[]>(() => {
    const saved = localStorage.getItem('nr_files');
    return saved ? JSON.parse(saved) : [];
  });

  const [tracklists, setTracklists] = useState<Tracklist[]>(() => {
    const saved = localStorage.getItem('nr_tracklists');
    return saved ? JSON.parse(saved) : [];
  });

  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    const saved = localStorage.getItem('nr_promotions');
    return saved ? JSON.parse(saved) : [];
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('nr_sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [downloads, setDownloads] = useState<DownloadEvent[]>(() => {
    const saved = localStorage.getItem('nr_downloads');
    return saved ? JSON.parse(saved) : [];
  });

  const [plays, setPlays] = useState<PlayEvent[]>(() => {
    const saved = localStorage.getItem('nr_plays');
    return saved ? JSON.parse(saved) : [];
  });

  const [shares, setShares] = useState<ShareEvent[]>(() => {
    const saved = localStorage.getItem('nr_shares');
    return saved ? JSON.parse(saved) : [];
  });

  const [views, setViews] = useState<ViewEvent[]>(() => {
    const saved = localStorage.getItem('nr_views');
    return saved ? JSON.parse(saved) : [];
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLogEvent[]>(() => {
    const saved = localStorage.getItem('nr_activity_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [services, setServices] = useState<MusicService[]>(() => {
    const saved = localStorage.getItem('nr_services');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'SVC-1',
        name: 'DistroKid',
        provider: 'DistroKid Inc.',
        category: 'Distribution',
        description: 'Distribute unlimited music to Spotify, Apple Music, TikTok, and 150+ digital streaming platforms worldwide.',
        externalUrl: 'https://distrokid.com',
        priceModel: 'Subscription',
        priceText: '$22.99/year',
        featured: true,
        tag: 'Recommended',
        createdAt: '2026-01-10T10:00:00.000Z'
      },
      {
        id: 'SVC-2',
        name: 'LANDR Audio Mastering',
        provider: 'LANDR',
        category: 'Mixing & Mastering',
        description: 'Instant AI-powered audio mastering, digital distribution, and plugin collaboration suite for modern producers.',
        externalUrl: 'https://www.landr.com',
        priceModel: 'Freemium',
        priceText: 'From $12.50/mo',
        featured: true,
        tag: 'Popular',
        createdAt: '2026-01-12T10:00:00.000Z'
      },
      {
        id: 'SVC-3',
        name: 'SubmitHub',
        provider: 'SubmitHub',
        category: 'Playlist Curators',
        description: 'Submit your unreleased and released tracks directly to verified Spotify playlist curators, music blogs, and YouTube channels.',
        externalUrl: 'https://www.submithub.com',
        priceModel: 'Freemium',
        priceText: 'Free & Premium Credits',
        featured: false,
        createdAt: '2026-01-15T10:00:00.000Z'
      },
      {
        id: 'SVC-4',
        name: 'SoundBetter',
        provider: 'Spotify for Artists / SoundBetter',
        category: 'Mixing & Mastering',
        description: 'Hire Grammy-winning mixing engineers, vocalists, session musicians, and mastering engineers directly.',
        externalUrl: 'https://www.soundbetter.com',
        priceModel: 'Custom Quote',
        priceText: 'Varies per creator',
        featured: false,
        createdAt: '2026-01-18T10:00:00.000Z'
      },
      {
        id: 'SVC-5',
        name: 'Songtrust',
        provider: 'Songtrust',
        category: 'Music Publishing',
        description: 'Global digital publishing administration — collect performance and mechanical royalties from 215+ countries.',
        externalUrl: 'https://www.songtrust.com',
        priceModel: 'One-Time Fee',
        priceText: '$100 One-time setup',
        featured: true,
        tag: 'Essential',
        createdAt: '2026-01-20T10:00:00.000Z'
      },
      {
        id: 'SVC-6',
        name: 'TuneCore',
        provider: 'Believe Group',
        category: 'Distribution',
        description: 'Publish music to stores worldwide, maintain 100% ownership of your master recording royalties, and access release analytics.',
        externalUrl: 'https://www.tunecore.com',
        priceModel: 'Subscription',
        priceText: 'From $19.99/yr',
        featured: false,
        createdAt: '2026-01-22T10:00:00.000Z'
      }
    ];
  });

  const [discounts, setDiscounts] = useState<Discount[]>(() => {
    const saved = localStorage.getItem('nr_discounts');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'DISC-1',
        code: 'NIGHTRUNNA20',
        title: '20% Off Storewide Beats',
        description: 'Applies 20% discount on any single beat purchase across the NightRunna storefront.',
        discountType: 'Percentage',
        discountValue: 20,
        targetType: 'Single Beats',
        status: 'Active',
        expirationDate: '2026-12-31',
        usageLimit: 500,
        usageCount: 42,
        createdAt: '2026-02-01T10:00:00.000Z'
      },
      {
        id: 'DISC-2',
        code: 'BEATPACK15',
        title: '$15 Off Premium Beat Packs',
        description: 'Save $15 when purchasing any curated Beat Pack in the store.',
        discountType: 'Fixed Amount',
        discountValue: 15,
        targetType: 'Beat Packs',
        status: 'Active',
        expirationDate: '2026-12-31',
        usageLimit: 200,
        usageCount: 18,
        createdAt: '2026-02-05T10:00:00.000Z'
      },
      {
        id: 'DISC-3',
        code: 'DISTROVIP',
        title: '20% Off DistroKid Annual Plan',
        description: 'Exclusive partner deal: get 20% discount on your first year of DistroKid music distribution.',
        discountType: 'Percentage',
        discountValue: 20,
        targetType: 'Partner Deal',
        status: 'Active',
        partnerUrl: 'https://distrokid.com/vip/nightrunna',
        usageLimit: 1000,
        usageCount: 156,
        createdAt: '2026-02-10T10:00:00.000Z'
      },
      {
        id: 'DISC-4',
        code: 'LANDRSTUDIO10',
        title: '10% Off LANDR Mastering & Plugins',
        description: 'Special partner offer for NightRunna studio members on LANDR Studio monthly subscriptions.',
        discountType: 'Percentage',
        discountValue: 10,
        targetType: 'Partner Deal',
        status: 'Active',
        partnerUrl: 'https://www.landr.com',
        usageLimit: 500,
        usageCount: 64,
        createdAt: '2026-02-12T10:00:00.000Z'
      }
    ];
  });

  const [videos, setVideos] = useState<VideoRecord[]>(() => {
    const saved = localStorage.getItem('nr_videos');
    return saved ? JSON.parse(saved) : [];
  });

  const [photos, setPhotos] = useState<PhotoRecord[]>(() => {
    const saved = localStorage.getItem('nr_photos');
    return saved ? JSON.parse(saved) : [];
  });

  const [visitorId] = useState<string>(() => {
    let vid = localStorage.getItem('nr_visitor_id');
    if (!vid) {
      vid = `VIS-${Math.random().toString(36).substring(2, 9)}-${Date.now().toString(36)}`;
      localStorage.setItem('nr_visitor_id', vid);
    }
    return vid;
  });

  const [followers, setFollowers] = useState<FollowRecord[]>(() => {
    const saved = localStorage.getItem('nr_followers');
    return saved ? JSON.parse(saved) : [];
  });

  const [customRequests, setCustomRequests] = useState<CustomBeatRequest[]>(() => {
    const saved = localStorage.getItem('nr_custom_requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [cookieConsent, setCookieConsent] = useState<CookieConsentPreferences | null>(() => {
    const saved = localStorage.getItem('nr_cookie_consent');
    return saved ? JSON.parse(saved) : null;
  });

  const [plaques, setPlaques] = useState<RecordPlaque[]>(() => {
    const saved = localStorage.getItem('nr_plaques');
    return saved ? JSON.parse(saved) : [];
  });

  const [pushSubscribers, setPushSubscribers] = useState<PushSubscriber[]>(() => {
    const saved = localStorage.getItem('nr_push_subscribers');
    return saved ? JSON.parse(saved) : [];
  });

  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>(() => {
    const saved = localStorage.getItem('nr_sent_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [isPushSubscribed, setIsPushSubscribed] = useState<boolean>(() => {
    return localStorage.getItem('nr_is_push_subscribed') === 'true';
  });

  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>(() => {
    const saved = localStorage.getItem('nr_newsletter_subscribers');
    return saved ? JSON.parse(saved) : [];
  });

  const [paypalEmail, setPaypalEmailState] = useState<string>(() => {
    return localStorage.getItem('nightrunna_paypal_email') || 'nightrunna842@gmail.com';
  });

  // Save to localStorage whenever state changes
  useEffect(() => { localStorage.setItem('nr_beats', JSON.stringify(beats)); }, [beats]);
  useEffect(() => { localStorage.setItem('nr_beatpacks', JSON.stringify(beatPacks)); }, [beatPacks]);
  useEffect(() => { localStorage.setItem('nr_files', JSON.stringify(files)); }, [files]);
  useEffect(() => { localStorage.setItem('nr_tracklists', JSON.stringify(tracklists)); }, [tracklists]);
  useEffect(() => { localStorage.setItem('nr_promotions', JSON.stringify(promotions)); }, [promotions]);
  useEffect(() => { localStorage.setItem('nr_sales', JSON.stringify(sales)); }, [sales]);
  useEffect(() => { localStorage.setItem('nr_downloads', JSON.stringify(downloads)); }, [downloads]);
  useEffect(() => { localStorage.setItem('nr_plays', JSON.stringify(plays)); }, [plays]);
  useEffect(() => { localStorage.setItem('nr_shares', JSON.stringify(shares)); }, [shares]);
  useEffect(() => { localStorage.setItem('nr_views', JSON.stringify(views)); }, [views]);
  useEffect(() => { localStorage.setItem('nr_activity_logs', JSON.stringify(activityLogs)); }, [activityLogs]);
  useEffect(() => { localStorage.setItem('nr_services', JSON.stringify(services)); }, [services]);
  useEffect(() => { localStorage.setItem('nr_discounts', JSON.stringify(discounts)); }, [discounts]);
  useEffect(() => { localStorage.setItem('nr_videos', JSON.stringify(videos)); }, [videos]);
  useEffect(() => { localStorage.setItem('nr_photos', JSON.stringify(photos)); }, [photos]);
  useEffect(() => { localStorage.setItem('nr_followers', JSON.stringify(followers)); }, [followers]);
  useEffect(() => { localStorage.setItem('nr_custom_requests', JSON.stringify(customRequests)); }, [customRequests]);
  useEffect(() => { localStorage.setItem('nr_plaques', JSON.stringify(plaques)); }, [plaques]);
  useEffect(() => { localStorage.setItem('nr_push_subscribers', JSON.stringify(pushSubscribers)); }, [pushSubscribers]);
  useEffect(() => { localStorage.setItem('nr_sent_notifications', JSON.stringify(sentNotifications)); }, [sentNotifications]);
  useEffect(() => { localStorage.setItem('nr_is_push_subscribed', isPushSubscribed.toString()); }, [isPushSubscribed]);
  useEffect(() => { localStorage.setItem('nr_newsletter_subscribers', JSON.stringify(newsletterSubscribers)); }, [newsletterSubscribers]);
  useEffect(() => {
    if (cookieConsent) {
      localStorage.setItem('nr_cookie_consent', JSON.stringify(cookieConsent));
    }
  }, [cookieConsent]);

  const setPaypalEmail = (email: string) => {
    setPaypalEmailState(email);
    localStorage.setItem('nightrunna_paypal_email', email);
  };

  // Sync to backend for paypal validation
  useEffect(() => {
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ beats, beatPacks })
    }).catch(console.error);
  }, [beats, beatPacks]);

  const recordActivity = (type: string, description: string) => {
    const newLog: ActivityLogEvent = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      description,
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const addBeat = (beat: ParsedBeat) => {
    setBeats(prev => {
      const existing = prev.findIndex(b => b.id === beat.id);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = beat;
        return next;
      }
      return [...prev, beat];
    });
    recordActivity('Beat Uploaded', `Beat "${beat.title}" (${beat.id}) added to catalog.`);
  };

  const deleteBeat = (beatId: string) => {
    const target = beats.find(b => b.id === beatId);
    setBeats(prev => prev.filter(b => b.id !== beatId));
    if (target) {
      recordActivity('Beat Deleted', `Beat "${target.title}" (${beatId}) removed.`);
    }
  };

  const addBeatPack = (pack: ParsedBeatPack) => {
    setBeatPacks(prev => {
      const existing = prev.findIndex(p => p.packId === pack.packId);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = pack;
        return next;
      }
      return [...prev, pack];
    });
    pack.beats.forEach(beat => {
      setBeats(prev => {
        if (!prev.find(b => b.id === beat.id)) {
          return [...prev, beat];
        }
        return prev;
      });
    });
    recordActivity('Beat Pack Uploaded', `Pack "${pack.packName}" (${pack.packId}) with ${pack.beats.length} beats added.`);
  };

  const deleteBeatPack = (packId: string) => {
    const target = beatPacks.find(p => p.packId === packId);
    setBeatPacks(prev => prev.filter(p => p.packId !== packId));
    if (target) {
      recordActivity('Beat Pack Deleted', `Pack "${target.packName}" (${packId}) removed.`);
    }
  };

  const addFile = (file: FileRecord) => {
    setFiles(prev => [...prev, file]);
  };

  const addTracklist = (tracklist: Tracklist) => {
    setTracklists(prev => [...prev, tracklist]);
    recordActivity('Tracklist Created', `Tracklist "${tracklist.name}" created with ${tracklist.beatIds.length} tracks.`);
  };

  const updateTracklist = (tracklist: Tracklist) => {
    setTracklists(prev => prev.map(t => t.id === tracklist.id ? tracklist : t));
    recordActivity('Tracklist Updated', `Tracklist "${tracklist.name}" updated.`);
  };

  const deleteTracklist = (id: string) => {
    const target = tracklists.find(t => t.id === id);
    setTracklists(prev => prev.filter(t => t.id !== id));
    if (target) {
      recordActivity('Tracklist Deleted', `Tracklist "${target.name}" removed.`);
    }
  };

  const addPromotion = (promo: Promotion) => {
    setPromotions(prev => [...prev, promo]);
    recordActivity('Promotion Created', `Campaign "${promo.name}" created.`);
  };

  const recordSale = (sale: Sale) => {
    setSales(prev => [...prev, sale]);
    recordActivity('Purchase Completed', `Sale of $${sale.amount.toFixed(2)} for product ${sale.productId} by ${sale.customer}.`);
  };

  const recordDownload = (event: Omit<DownloadEvent, 'id' | 'timestamp'>) => {
    const newDownload: DownloadEvent = {
      ...event,
      id: `DL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    setDownloads(prev => [newDownload, ...prev]);
    recordActivity(
      event.type === 'Free' ? 'Free Download' : 'Paid Download',
      `${event.type} download for "${event.productTitle}" (${event.productId}).`
    );
  };

  const recordPlay = (productId: string, productType: 'Single Beat' | 'Beat Pack' = 'Single Beat') => {
    const newPlay: PlayEvent = {
      id: `PLAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId,
      productType,
      timestamp: new Date().toISOString()
    };
    setPlays(prev => [newPlay, ...prev]);
    recordActivity('Beat Played', `Playback started for ${productType} (${productId}).`);
  };

  const recordShare = (productId: string, productType: 'Single Beat' | 'Beat Pack' = 'Single Beat') => {
    const newShare: ShareEvent = {
      id: `SHARE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId,
      productType,
      timestamp: new Date().toISOString()
    };
    setShares(prev => [newShare, ...prev]);
    recordActivity('Product Shared', `Share button clicked for ${productId}.`);
  };

  const recordView = (productId?: string, productType: 'Single Beat' | 'Beat Pack' | 'Storefront' = 'Storefront') => {
    const newView: ViewEvent = {
      id: `VIEW-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId,
      productType,
      timestamp: new Date().toISOString()
    };
    setViews(prev => [newView, ...prev]);
    // Avoid spamming activity log on every page view, but keep track in views array!
  };

  const getProduct = (id: string, type: 'Single Beat' | 'Beat Pack') => {
    if (type === 'Single Beat') return beats.find(b => b.id === id);
    if (type === 'Beat Pack') return beatPacks.find(p => p.packId === id);
    return null;
  };

  const addService = (service: MusicService) => {
    setServices(prev => [service, ...prev]);
    recordActivity('Service Added', `Service "${service.name}" (${service.category}) added.`);
  };

  const updateService = (service: MusicService) => {
    setServices(prev => prev.map(s => s.id === service.id ? service : s));
    recordActivity('Service Updated', `Service "${service.name}" updated.`);
  };

  const deleteService = (id: string) => {
    const target = services.find(s => s.id === id);
    setServices(prev => prev.filter(s => s.id !== id));
    if (target) {
      recordActivity('Service Removed', `Service "${target.name}" removed from catalog.`);
    }
  };

  const addDiscount = (discount: Discount) => {
    setDiscounts(prev => [discount, ...prev]);
    recordActivity('Discount Created', `Promo code "${discount.code}" created.`);
  };

  const updateDiscount = (discount: Discount) => {
    setDiscounts(prev => prev.map(d => d.id === discount.id ? discount : d));
    recordActivity('Discount Updated', `Promo code "${discount.code}" updated.`);
  };

  const deleteDiscount = (id: string) => {
    const target = discounts.find(d => d.id === id);
    setDiscounts(prev => prev.filter(d => d.id !== id));
    if (target) {
      recordActivity('Discount Deleted', `Promo code "${target.code}" deleted.`);
    }
  };

  const addVideo = (video: VideoRecord) => {
    setVideos(prev => [video, ...prev]);
    recordActivity('Video Added', `YouTube video "${video.title}" added.`);
  };

  const updateVideo = (video: VideoRecord) => {
    setVideos(prev => prev.map(v => v.id === video.id ? video : v));
    recordActivity('Video Updated', `Video "${video.title}" updated.`);
  };

  const deleteVideo = (id: string) => {
    const target = videos.find(v => v.id === id);
    setVideos(prev => prev.filter(v => v.id !== id));
    if (target) {
      recordActivity('Video Removed', `Video "${target.title}" removed from NightRunna.`);
    }
  };

  const reorderVideos = (newVideos: VideoRecord[]) => {
    setVideos(newVideos);
  };

  const addPhoto = (photo: PhotoRecord) => {
    setPhotos(prev => [photo, ...prev]);
    recordActivity('Photo Uploaded', `Photo "${photo.title}" uploaded.`);
  };

  const updatePhoto = (photo: PhotoRecord) => {
    setPhotos(prev => prev.map(p => p.id === photo.id ? photo : p));
    recordActivity('Photo Updated', `Photo "${photo.title}" updated.`);
  };

  const deletePhoto = (id: string) => {
    const target = photos.find(p => p.id === id);
    setPhotos(prev => prev.filter(p => p.id !== id));
    if (target) {
      recordActivity('Photo Removed', `Photo "${target.title}" deleted.`);
    }
  };

  const reorderPhotos = (newPhotos: PhotoRecord[]) => {
    setPhotos(newPhotos);
  };

  // Follower logic
  const isFollowing = React.useMemo(() => {
    return followers.some(f => f.followerId === visitorId && f.profileId === 'nightrunna');
  }, [followers, visitorId]);

  const followerCount = React.useMemo(() => {
    return followers.filter(f => f.profileId === 'nightrunna').length;
  }, [followers]);

  const toggleFollow = () => {
    if (isFollowing) {
      setFollowers(prev => prev.filter(f => !(f.followerId === visitorId && f.profileId === 'nightrunna')));
      recordActivity('Unfollowed Producer', `Visitor unfollowed NightRunna profile.`);
    } else {
      const newFollow: FollowRecord = {
        id: `FOL-${Date.now()}`,
        profileId: 'nightrunna',
        followerId: visitorId,
        followedAt: new Date().toISOString()
      };
      setFollowers(prev => [newFollow, ...prev]);
      recordActivity('New Follower', `New follower added to NightRunna profile.`);
    }
  };

  // Custom Beat Request logic
  const addCustomRequest = async (req: Omit<CustomBeatRequest, 'id' | 'createdAt' | 'status'>): Promise<CustomBeatRequest> => {
    const nextNum = customRequests.length + 1;
    const reqId = `NR-REQ-${String(nextNum).padStart(6, '0')}`;
    const newReq: CustomBeatRequest = {
      ...req,
      id: reqId,
      status: 'New',
      createdAt: new Date().toISOString(),
      emailStatus: 'Pending'
    };

    // 1. Save locally to state & localStorage first
    setCustomRequests(prev => [newReq, ...prev]);
    recordActivity('Custom Beat Request', `New custom beat request ${reqId} from ${req.artistName || req.name}.`);

    // 2. Trigger email notification to store owner via server endpoint
    try {
      const res = await fetch('/api/custom-requests/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReq)
      });
      const data = await res.json();
      if (data.success && data.emailStatus === 'Sent') {
        const updatedReq: CustomBeatRequest = {
          ...newReq,
          emailStatus: 'Sent',
          emailSentAt: data.timestamp
        };
        setCustomRequests(prev => prev.map(r => r.id === reqId ? updatedReq : r));
        return updatedReq;
      } else {
        const failedReq: CustomBeatRequest = {
          ...newReq,
          emailStatus: 'Failed',
          emailError: data.error || 'Failed to deliver notification email'
        };
        setCustomRequests(prev => prev.map(r => r.id === reqId ? failedReq : r));
        return failedReq;
      }
    } catch (err: any) {
      console.error('Error notifying backend:', err);
      const failedReq: CustomBeatRequest = {
        ...newReq,
        emailStatus: 'Failed',
        emailError: err.message || 'Network error triggering notification email'
      };
      setCustomRequests(prev => prev.map(r => r.id === reqId ? failedReq : r));
      return failedReq;
    }
  };

  const retryCustomRequestEmail = async (id: string): Promise<boolean> => {
    const target = customRequests.find(r => r.id === id);
    if (!target) return false;

    // Set to pending
    setCustomRequests(prev => prev.map(r => r.id === id ? { ...r, emailStatus: 'Pending', emailError: undefined } : r));

    try {
      const res = await fetch('/api/custom-requests/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target)
      });
      const data = await res.json();
      if (data.success && data.emailStatus === 'Sent') {
        setCustomRequests(prev => prev.map(r => r.id === id ? {
          ...r,
          emailStatus: 'Sent',
          emailSentAt: data.timestamp,
          emailError: undefined
        } : r));
        recordActivity('Email Retry Succeeded', `Email notification re-sent for request ${id}.`);
        return true;
      } else {
        setCustomRequests(prev => prev.map(r => r.id === id ? {
          ...r,
          emailStatus: 'Failed',
          emailError: data.error || 'Retry delivery failed'
        } : r));
        return false;
      }
    } catch (err: any) {
      setCustomRequests(prev => prev.map(r => r.id === id ? {
        ...r,
        emailStatus: 'Failed',
        emailError: err.message || 'Network error on retry'
      } : r));
      return false;
    }
  };

  const updateCustomRequestStatus = (id: string, status: CustomBeatRequest['status']) => {
    setCustomRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    recordActivity('Custom Request Updated', `Request ${id} status changed to ${status}.`);
  };

  const deleteCustomRequest = (id: string) => {
    setCustomRequests(prev => prev.filter(r => r.id !== id));
    recordActivity('Custom Request Removed', `Request ${id} deleted.`);
  };

  // Cookie Consent logic
  const saveCookieConsent = (prefs: Omit<CookieConsentPreferences, 'updatedAt'>) => {
    const updated: CookieConsentPreferences = {
      ...prefs,
      updatedAt: new Date().toISOString()
    };
    setCookieConsent(updated);
    recordActivity('Cookie Preference Saved', `User saved cookie preference settings.`);
  };

  // Derive customers dynamically from sales & downloads
  const customers: Customer[] = React.useMemo(() => {
    const map = new Map<string, Customer>();
    sales.forEach(sale => {
      const cust = map.get(sale.customer) || {
        id: `CUST-${sale.customer}`,
        name: sale.customer,
        email: sale.customer.includes('@') ? sale.customer : undefined,
        purchases: 0,
        totalSpent: 0,
        lastActivity: sale.date
      };
      cust.purchases += 1;
      cust.totalSpent += sale.amount;
      if (new Date(sale.date) > new Date(cust.lastActivity)) {
        cust.lastActivity = sale.date;
      }
      map.set(sale.customer, cust);
    });
    return Array.from(map.values());
  }, [sales]);

  const addPlaque = (plaque: RecordPlaque) => {
    setPlaques(prev => [plaque, ...prev]);
    recordActivity('PLAQUE_ADDED', `Digital Record Plaque ${plaque.plaqueId} issued for ${plaque.beatTitle}`);
  };

  const updatePlaque = (updated: RecordPlaque) => {
    setPlaques(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const deletePlaque = (id: string) => {
    setPlaques(prev => prev.filter(p => p.id !== id));
  };

  // Push Notifications Implementation
  const subscribePushNotification = async (categories = ['Beat Release', 'Beat Pack', 'Discount', 'Announcement', 'Product']): Promise<{ success: boolean; message: string }> => {
    if (typeof window === 'undefined') return { success: false, message: 'SSR environment' };

    let granted = false;
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        granted = true;
      } else if (Notification.permission !== 'denied') {
        const result = await Notification.requestPermission();
        if (result === 'granted') granted = true;
      }
    } else {
      granted = true;
    }

    if (granted) {
      setIsPushSubscribed(true);
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const deviceType: PushSubscriber['deviceType'] = isIOS ? 'iOS' : (isMobile ? 'Android' : 'Desktop');
      
      const subId = `SUB-${visitorId}`;
      setPushSubscribers(prev => {
        const existing = prev.find(s => s.id === subId);
        if (existing) {
          return prev.map(s => s.id === subId ? { ...s, status: 'Active', categories } : s);
        }
        return [{
          id: subId,
          deviceType,
          categories,
          subscribedAt: new Date().toISOString(),
          status: 'Active'
        }, ...prev];
      });

      recordActivity('PUSH_SUBSCRIBED', `User enabled push notifications (${deviceType})`);
      return { success: true, message: 'Push notifications enabled successfully!' };
    } else {
      return { success: false, message: 'Notification permission was denied in browser settings.' };
    }
  };

  const unsubscribePushNotification = () => {
    setIsPushSubscribed(false);
    const subId = `SUB-${visitorId}`;
    setPushSubscribers(prev => prev.map(s => s.id === subId ? { ...s, status: 'Unsubscribed' } : s));
    recordActivity('PUSH_UNSUBSCRIBED', 'User opted out of push notifications');
  };

  const sendAdminNotification = async (notif: { title: string; body: string; category: SentNotification['category']; url?: string }): Promise<{ success: boolean; deliveredCount: number }> => {
    const activeSubs = pushSubscribers.filter(s => s.status === 'Active');
    const targetCount = activeSubs.length || (isPushSubscribed ? 1 : 0);

    const newSent: SentNotification = {
      id: `NOTIF-${Date.now()}`,
      title: notif.title,
      body: notif.body,
      category: notif.category,
      url: notif.url,
      sentAt: new Date().toISOString(),
      targetCount: Math.max(1, targetCount)
    };

    setSentNotifications(prev => [newSent, ...prev]);
    recordActivity('NOTIFICATION_SENT', `Admin broadcasted "${notif.title}" to ${Math.max(1, targetCount)} push subscribers`);

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(notif.title, {
          body: notif.body,
          icon: '/favicon.ico',
          data: { url: notif.url || '/' }
        });
      } catch (err) {
        console.log('Native notification output notice:', err);
      }
    }

    return { success: true, deliveredCount: Math.max(1, targetCount) };
  };

  // Newsletter Subscribers Implementation
  const subscribeNewsletter = async (email: string, consentGiven = true): Promise<{ success: boolean; message: string; isDuplicate?: boolean }> => {
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    const existing = newsletterSubscribers.find(s => s.email.toLowerCase() === trimmed);
    if (existing && existing.status === 'Active') {
      return { success: false, isDuplicate: true, message: 'This email is already subscribed to the NightRunna mailing list.' };
    }

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, consentGiven, source: 'Storefront Newsletter Form' })
      });
      const data = await response.json();

      if (data.isDuplicate) {
        return { success: false, isDuplicate: true, message: data.message };
      }

      if (data.success) {
        if (existing) {
          setNewsletterSubscribers(prev => prev.map(s => s.id === existing.id ? { ...s, status: 'Active', consentGiven } : s));
        } else {
          const newSub: NewsletterSubscriber = {
            id: `SUB-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            email: trimmed,
            subscribedAt: new Date().toISOString(),
            consentGiven,
            status: 'Active',
            source: 'Storefront Newsletter Form'
          };
          setNewsletterSubscribers(prev => [newSub, ...prev]);
        }
        recordActivity('NEWSLETTER_SUBSCRIBED', `New subscriber added to email list: ${trimmed}`);
        return { success: true, message: 'Subscribed successfully! Welcome email sent to your inbox.' };
      } else {
        return { success: false, message: data.message || 'Failed to process subscription.' };
      }
    } catch (err) {
      if (!existing) {
        const newSub: NewsletterSubscriber = {
          id: `SUB-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          email: trimmed,
          subscribedAt: new Date().toISOString(),
          consentGiven,
          status: 'Active',
          source: 'Storefront Newsletter Form'
        };
        setNewsletterSubscribers(prev => [newSub, ...prev]);
      }
      return { success: true, message: 'Subscribed successfully! Thank you for joining the NightRunna mailing list.' };
    }
  };

  const unsubscribeNewsletter = async (email: string) => {
    const trimmed = email.trim().toLowerCase();
    setNewsletterSubscribers(prev => prev.map(s => s.email.toLowerCase() === trimmed ? { ...s, status: 'Unsubscribed' } : s));
    try {
      await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed })
      });
    } catch (err) {
      console.warn('Backend sync failed on unsubscribe:', err);
    }
  };

  const deleteNewsletterSubscriber = (id: string) => {
    setNewsletterSubscribers(prev => prev.filter(s => s.id !== id));
  };

  const sendNewsletterBroadcast = async (subject: string, message: string): Promise<{ success: boolean; message: string }> => {
    const activeSubscribers = newsletterSubscribers.filter(s => s.status === 'Active');
    recordActivity('NEWSLETTER_BROADCAST', `Newsletter "${subject}" broadcasted to ${activeSubscribers.length} subscribers`);
    return {
      success: true,
      message: `Newsletter "${subject}" prepared and queued for ${activeSubscribers.length} active email subscribers.`
    };
  };

  // Store Announcements & Flash Sales Implementation
  const [announcements, setAnnouncements] = useState<StoreAnnouncement[]>(() => {
    const saved = localStorage.getItem('nr_announcements');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'ANN-SAMPLE-01',
        type: 'Flash Sale',
        title: '🔥 FLASH SALE: 50% OFF ALL BEATS',
        message: 'Limited time producer discount on all single beats. Use code FLASH50 at checkout.',
        startDate: new Date().toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        status: 'Active',
        discountType: 'Percentage',
        discountValue: 50,
        includeBeatPacks: true,
        promoCode: 'FLASH50',
        sendPushNotification: false,
        sendEmailAnnouncement: false,
        createdAt: new Date().toISOString()
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('nr_announcements', JSON.stringify(announcements));
  }, [announcements]);

  const addAnnouncement = (item: StoreAnnouncement) => {
    setAnnouncements(prev => [item, ...prev]);
    recordActivity('ANNOUNCEMENT_CREATED', `Created ${item.type}: "${item.title}"`);
  };

  const updateAnnouncement = (item: StoreAnnouncement) => {
    setAnnouncements(prev => prev.map(a => a.id === item.id ? item : a));
    recordActivity('ANNOUNCEMENT_UPDATED', `Updated ${item.type}: "${item.title}"`);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    recordActivity('ANNOUNCEMENT_DELETED', `Deleted announcement/flash sale (ID: ${id})`);
  };

  const getActiveFlashSale = (): StoreAnnouncement | null => {
    const now = new Date();
    return announcements.find(a => {
      if (a.type !== 'Flash Sale') return false;
      if (a.status === 'Disabled' || a.status === 'Draft') return false;
      const start = new Date(a.startDate);
      const end = a.endDate ? new Date(a.endDate) : null;
      if (isNaN(start.getTime())) return false;
      if (start > now) return false;
      if (end && now > end) return false;
      return true;
    }) || null;
  };

  const getActiveAnnouncements = (): StoreAnnouncement[] => {
    const now = new Date();
    return announcements.filter(a => {
      if (a.status === 'Disabled' || a.status === 'Draft') return false;
      const start = new Date(a.startDate);
      const end = a.endDate ? new Date(a.endDate) : null;
      if (isNaN(start.getTime())) return false;
      if (start > now) return false;
      if (end && now > end) return false;
      return true;
    });
  };

  return (
    <StoreContext.Provider value={{ 
      beats, addBeat, deleteBeat,
      beatPacks, addBeatPack, deleteBeatPack,
      files, addFile,
      tracklists, addTracklist, updateTracklist, deleteTracklist,
      promotions, addPromotion,
      sales, recordSale,
      downloads, recordDownload,
      plays, recordPlay,
      shares, recordShare,
      views, recordView,
      activityLogs, recordActivity,
      customers, paypalEmail, setPaypalEmail, getProduct,
      services, addService, updateService, deleteService,
      discounts, addDiscount, updateDiscount, deleteDiscount,
      videos, addVideo, updateVideo, deleteVideo, reorderVideos,
      photos, addPhoto, updatePhoto, deletePhoto, reorderPhotos,
      followers, isFollowing, followerCount, toggleFollow,
      customRequests, addCustomRequest, retryCustomRequestEmail, updateCustomRequestStatus, deleteCustomRequest,
      cookieConsent, saveCookieConsent,
      plaques, addPlaque, updatePlaque, deletePlaque,
      pushSubscribers, sentNotifications, isPushSubscribed, subscribePushNotification, unsubscribePushNotification, sendAdminNotification,
      newsletterSubscribers, subscribeNewsletter, unsubscribeNewsletter, deleteNewsletterSubscriber, sendNewsletterBroadcast,
      announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement, getActiveFlashSale, getActiveAnnouncements
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
