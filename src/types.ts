export interface UmrahPackage {
  id: string;
  title: string;
  duration: string;
  price: number;
  hotelMakkah: string;
  hotelMadinah: string;
  hotelStars: number;
  flights: string;
  departureDate: string;
  facilities: string[];
  description: string;
  imageUrl: string;
  active: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  seoFocusKeyword: string;
  seoMetaTitle: string;
  seoMetaDesc: string;
  city: string; // e.g. "Mataram", "Praya", "Selong", etc.
  date: string;
  views: number;
  readTimeMin: number;
  tags: string[];
  seoScore?: number; // 0 to 100
  seoFeedback?: {
    keywordDensity: number;
    keywordInTitle: boolean;
    keywordInMetaDesc: boolean;
    contentLengthOk: boolean;
    suggestions: string[];
  };
  imageUrl?: string;
}

export interface HeaderConfig {
  logoText: string;
  logoSub: string;
  tagline: string;
  phone: string; // WhatsApp number
  phoneDisplay: string; // Formatting
  menus: { label: string; href: string }[];
  logoImageUrl?: string;
}

export interface FooterConfig {
  aboutText: string;
  address: string;
  phone: string;
  email: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  copyrightText: string;
}

export interface Booking {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  packageId: string;
  packageName: string;
  passengersCount: number;
  notes?: string;
  date: string;
  status: 'Pending' | 'Dihubungi' | 'Selesai';
}

export interface StatsData {
  totalViews: number;
  viewsByPage: Record<string, number>;
  viewsByCity: Record<string, number>; // Mataram, Lombok Barat etc
  whatsappClicks: number;
  bookingSubmissions: number;
  bookings: Booking[];
  dailyStats: {
    date: string; // YYYY-MM-DD
    views: number;
    whatsapp: number;
    bookings: number;
  }[];
}

export interface EmailReport {
  id: string;
  period: string; // e.g., "Mei 2026" or "Juni 2026"
  dateGenerated: string;
  totalViews: number;
  totalBookings: number;
  totalWhatsapp: number;
  conversionRate: string;
  topPerformingContent: string;
  aiSeoInsights: string;
  recipientEmail: string;
  status: 'Sent' | 'Scheduled';
}
