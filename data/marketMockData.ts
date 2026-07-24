import { ImageSourcePropType } from 'react-native';

export type ListingType =
  | 'sale'
  | 'auction'
  | 'job'
  | 'service'
  | 'community';

export interface MarketListing {
  id: string;

  listingType: ListingType;

  title: string;
  description: string;

  price: number;
  currency: string;

  category: string;
  subcategory: string;

  sellerId: string;
  sellerName: string;
  sellerVerified: boolean;
  sellerGainScore: number;

  rating: number;
  reviewCount: number;

  location: string;
  distance: string;

  listedTime: string;

  favourite: boolean;

  image: ImageSourcePropType;
  imageCount: number;

  opportunityScore: number;

  auctionLabel?: string;
}

export const marketListings: MarketListing[] = [
  {
    id: 'listing-001',
    listingType: 'sale',

    title: 'Makita Impact Driver Kit',
    description:
      'Near-new Makita impact driver with two batteries, charger and hard carry case.',

    price: 180,
    currency: 'AUD',

    category: 'Tools',
    subcategory: 'Power Tools',

    sellerId: 'seller-001',
    sellerName: 'Jake Wilson',
    sellerVerified: true,
    sellerGainScore: 94,

    rating: 4.9,
    reviewCount: 128,

    location: 'Brisbane',
    distance: '3 km',

    listedTime: '15 min ago',

    favourite: false,

    image: require('../assets/icon.png'),
    imageCount: 4,

    opportunityScore: 96,
  },

  {
    id: 'listing-002',
    listingType: 'sale',

    title: '2018 Toyota Hilux SR5',
    description:
      'Well-maintained automatic Hilux with service history, canopy and tow bar.',

    price: 38900,
    currency: 'AUD',

    category: 'Vehicles',
    subcategory: 'Utes',

    sellerId: 'seller-002',
    sellerName: 'Daniel Cooper',
    sellerVerified: true,
    sellerGainScore: 91,

    rating: 4.8,
    reviewCount: 57,

    location: 'Logan',
    distance: '12 km',

    listedTime: '42 min ago',

    favourite: true,

    image: require('../assets/icon.png'),
    imageCount: 9,

    opportunityScore: 92,
  },

  {
    id: 'listing-003',
    listingType: 'auction',

    title: 'Restored 1974 Holden HQ',
    description:
      'Professionally restored classic Holden with matching numbers and full documentation.',

    price: 28500,
    currency: 'AUD',

    category: 'Auctions',
    subcategory: 'Classic Vehicles',

    sellerId: 'seller-003',
    sellerName: 'Michael Harris',
    sellerVerified: true,
    sellerGainScore: 97,

    rating: 5,
    reviewCount: 84,

    location: 'Ipswich',
    distance: '28 km',

    listedTime: '1 hr ago',

    favourite: false,

    image: require('../assets/icon.png'),
    imageCount: 12,

    opportunityScore: 95,

    auctionLabel: 'LIVE · 18 BIDS',
  },

  {
    id: 'listing-004',
    listingType: 'job',

    title: 'Landscape Labourer Needed',
    description:
      'Local landscaping business seeking a reliable labourer for ongoing residential work.',

    price: 35,
    currency: 'AUD',

    category: 'Jobs',
    subcategory: 'Landscaping',

    sellerId: 'business-001',
    sellerName: 'Greenline Landscapes',
    sellerVerified: true,
    sellerGainScore: 96,

    rating: 4.9,
    reviewCount: 76,

    location: 'North Lakes',
    distance: '18 km',

    listedTime: '2 hrs ago',

    favourite: false,

    image: require('../assets/icon.png'),
    imageCount: 3,

    opportunityScore: 98,
  },

  {
    id: 'listing-005',
    listingType: 'service',

    title: 'Professional Lawn and Garden Care',
    description:
      'Mowing, edging, hedging, garden clean-ups and regular property maintenance.',

    price: 60,
    currency: 'AUD',

    category: 'Services',
    subcategory: 'Garden Maintenance',

    sellerId: 'seller-005',
    sellerName: 'Luke Bennett',
    sellerVerified: true,
    sellerGainScore: 93,

    rating: 4.9,
    reviewCount: 143,

    location: 'Redcliffe',
    distance: '9 km',

    listedTime: '3 hrs ago',

    favourite: true,

    image: require('../assets/icon.png'),
    imageCount: 6,

    opportunityScore: 94,
  },

  {
    id: 'listing-006',
    listingType: 'sale',

    title: 'Apple MacBook Air M2',
    description:
      'Excellent condition MacBook Air with original charger, box and protective sleeve.',

    price: 1150,
    currency: 'AUD',

    category: 'Electronics',
    subcategory: 'Computers',

    sellerId: 'seller-006',
    sellerName: 'Emily Carter',
    sellerVerified: true,
    sellerGainScore: 89,

    rating: 4.7,
    reviewCount: 39,

    location: 'Chermside',
    distance: '7 km',

    listedTime: '4 hrs ago',

    favourite: false,

    image: require('../assets/icon.png'),
    imageCount: 5,

    opportunityScore: 90,
  },

  {
    id: 'listing-007',
    listingType: 'auction',

    title: 'Milwaukee Tool Collection',
    description:
      'Large Milwaukee cordless tool collection including batteries, chargers and cases.',

    price: 620,
    currency: 'AUD',

    category: 'Auctions',
    subcategory: 'Tools',

    sellerId: 'seller-007',
    sellerName: 'Aaron Mitchell',
    sellerVerified: true,
    sellerGainScore: 95,

    rating: 4.9,
    reviewCount: 101,

    location: 'Caboolture',
    distance: '31 km',

    listedTime: '5 hrs ago',

    favourite: false,

    image: require('../assets/icon.png'),
    imageCount: 10,

    opportunityScore: 93,

    auctionLabel: 'ENDING SOON · 11 BIDS',
  },

  {
    id: 'listing-008',
    listingType: 'sale',

    title: 'Dual-Axle Landscaping Trailer',
    description:
      'Heavy-duty tandem trailer with mower rack, tool storage and electric brakes.',

    price: 7200,
    currency: 'AUD',

    category: 'Vehicles',
    subcategory: 'Trailers',

    sellerId: 'seller-008',
    sellerName: 'Nathan Brooks',
    sellerVerified: false,
    sellerGainScore: 82,

    rating: 4.5,
    reviewCount: 24,

    location: 'Beenleigh',
    distance: '26 km',

    listedTime: 'Yesterday',

    favourite: true,

    image: require('../assets/icon.png'),
    imageCount: 8,

    opportunityScore: 89,
  },

  {
    id: 'listing-009',
    listingType: 'service',

    title: 'Qualified Electrician Available',
    description:
      'Licensed electrician available for residential repairs, installations and upgrades.',

    price: 95,
    currency: 'AUD',

    category: 'Services',
    subcategory: 'Electrical',

    sellerId: 'seller-009',
    sellerName: 'Bright Spark Electrical',
    sellerVerified: true,
    sellerGainScore: 98,

    rating: 5,
    reviewCount: 212,

    location: 'Brisbane',
    distance: '5 km',

    listedTime: 'Yesterday',

    favourite: false,

    image: require('../assets/icon.png'),
    imageCount: 7,

    opportunityScore: 97,
  },

  {
    id: 'listing-010',
    listingType: 'sale',

    title: 'Outdoor Timber Dining Setting',
    description:
      'Solid hardwood outdoor table with eight matching chairs in great condition.',

    price: 480,
    currency: 'AUD',

    category: 'Home',
    subcategory: 'Outdoor Furniture',

    sellerId: 'seller-010',
    sellerName: 'Sophie Reynolds',
    sellerVerified: false,
    sellerGainScore: 86,

    rating: 4.6,
    reviewCount: 31,

    location: 'Carindale',
    distance: '14 km',

    listedTime: '2 days ago',

    favourite: false,

    image: require('../assets/icon.png'),
    imageCount: 6,

    opportunityScore: 87,
  },

  {
    id: 'listing-011',
    listingType: 'job',

    title: 'Apprentice Carpenter Opportunity',
    description:
      'Growing building company looking for a motivated first or second-year apprentice.',

    price: 28,
    currency: 'AUD',

    category: 'Jobs',
    subcategory: 'Construction',

    sellerId: 'business-002',
    sellerName: 'Summit Build Co.',
    sellerVerified: true,
    sellerGainScore: 92,

    rating: 4.8,
    reviewCount: 64,

    location: 'Springfield',
    distance: '34 km',

    listedTime: '2 days ago',

    favourite: true,

    image: require('../assets/icon.png'),
    imageCount: 4,

    opportunityScore: 95,
  },

  {
    id: 'listing-012',
    listingType: 'community',

    title: 'Free Timber Offcuts',
    description:
      'Mixed hardwood and treated pine offcuts available for collection this weekend.',

    price: 0,
    currency: 'AUD',

    category: 'Community',
    subcategory: 'Free Items',

    sellerId: 'seller-012',
    sellerName: 'Olivia Martin',
    sellerVerified: true,
    sellerGainScore: 90,

    rating: 4.8,
    reviewCount: 46,

    location: 'Wynnum',
    distance: '16 km',

    listedTime: '3 days ago',

    favourite: false,

    image: require('../assets/icon.png'),
    imageCount: 3,

    opportunityScore: 91,
  },
];