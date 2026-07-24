export type RegionSummaryItem = {
  id: string;
  label: string;
  value: number;
  icon:
    | 'storefront-outline'
    | 'briefcase-outline'
    | 'hammer-outline'
    | 'business-outline';
};

export type DiscoverListing = {
  id: string;
  title: string;
  price: string;
  location: string;
  distance: string;
  sellerName: string;
  gainScore: number;
  category: string;
  postedAt: string;
  featured?: boolean;
};

export type DiscoverJob = {
  id: string;
  title: string;
  businessName: string;
  location: string;
  distance: string;
  pay: string;
  workType: string;
  gainScore: number;
  postedAt: string;
};

export type DiscoverAuction = {
  id: string;
  title: string;
  currentBid: string;
  bidCount: number;
  timeRemaining: string;
  sellerName: string;
  gainScore: number;
  location: string;
};

export const regionSummary: RegionSummaryItem[] = [
  {
    id: 'listings',
    label: 'Listings',
    value: 142,
    icon: 'storefront-outline',
  },
  {
    id: 'jobs',
    label: 'Jobs',
    value: 26,
    icon: 'briefcase-outline',
  },
  {
    id: 'auctions',
    label: 'Live Auctions',
    value: 7,
    icon: 'hammer-outline',
  },
  {
    id: 'businesses',
    label: 'Businesses',
    value: 14,
    icon: 'business-outline',
  },
];

export const trendingListings: DiscoverListing[] = [
  {
    id: 'listing-1',
    title: 'Makita 18V Brushless Drill Kit',
    price: '$220',
    location: 'Maroochydore',
    distance: '4.2 km',
    sellerName: 'Coastal Trade Supplies',
    gainScore: 94,
    category: 'Tools',
    postedAt: '12 min ago',
    featured: true,
  },
  {
    id: 'listing-2',
    title: 'Mountain Bike — Excellent Condition',
    price: '$480',
    location: 'Buderim',
    distance: '7.8 km',
    sellerName: 'Jordan M.',
    gainScore: 83,
    category: 'Sport',
    postedAt: '34 min ago',
  },
  {
    id: 'listing-3',
    title: 'Solid Timber Outdoor Setting',
    price: '$350',
    location: 'Caloundra',
    distance: '13 km',
    sellerName: 'Sarah L.',
    gainScore: 76,
    category: 'Home',
    postedAt: '1 hr ago',
  },
];

export const nearbyJobs: DiscoverJob[] = [
  {
    id: 'job-1',
    title: 'Qualified Carpenter',
    businessName: 'Coastline Building Group',
    location: 'Mooloolaba',
    distance: '6.1 km',
    pay: '$45–$55 per hour',
    workType: 'Full-time',
    gainScore: 91,
    postedAt: 'Today',
  },
  {
    id: 'job-2',
    title: 'Weekend Landscaping Assistant',
    businessName: 'Green Edge Landscapes',
    location: 'Nambour',
    distance: '11 km',
    pay: '$32 per hour',
    workType: 'Casual',
    gainScore: 79,
    postedAt: 'Today',
  },
];

export const liveAuctions: DiscoverAuction[] = [
  {
    id: 'auction-1',
    title: 'Vintage Honda Trail Bike',
    currentBid: '$2,850',
    bidCount: 18,
    timeRemaining: '18m 42s',
    sellerName: 'Sunshine Collectables',
    gainScore: 96,
    location: 'Noosa',
  },
  {
    id: 'auction-2',
    title: 'Trade Tool Clearance Bundle',
    currentBid: '$640',
    bidCount: 11,
    timeRemaining: '1h 08m',
    sellerName: 'BuildPro Warehouse',
    gainScore: 88,
    location: 'Kawana',
  },
];