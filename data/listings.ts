import type {
  Listing,
  ListingSeller,
} from '../types/Listing';

const placeholderImage =
  require('../assets/icon.png');

function repeatImage(
  count: number,
) {
  return Array.from(
    {
      length: count,
    },
    () => placeholderImage,
  );
}

const liamSeller: ListingSeller = {
  id: '1a872aa4-69b9-4f59-8c08-f5a254a8179d',
  name: 'Liam Green',

  gainScore: 97,

  rating: 4.9,

  reviewCount: 263,

  responseTime:
    'Usually replies within 6 minutes',

  completedSales: 284,

  memberSince: 2022,

  verification: [
    'identity',
    'business',
    'community',
  ],
};

const jakeSeller: ListingSeller = {
  id: 'seller-002',

  name: 'Jake Wilson',

  gainScore: 94,

  rating: 4.9,

  reviewCount: 128,

  responseTime:
    'Usually replies within 12 minutes',

  completedSales: 116,

  memberSince: 2023,

  verification: [
    'identity',
    'community',
  ],
};

const emilySeller: ListingSeller = {
  id: 'seller-003',

  name: 'Emily Carter',

  gainScore: 89,

  rating: 4.7,

  reviewCount: 39,

  responseTime:
    'Usually replies within 20 minutes',

  completedSales: 42,

  memberSince: 2024,

  verification: [
    'identity',
  ],
};

const nathanSeller: ListingSeller = {
  id: 'seller-004',

  name: 'Nathan Brooks',

  gainScore: 82,

  rating: 4.5,

  reviewCount: 24,

  responseTime:
    'Usually replies within 30 minutes',

  completedSales: 28,

  memberSince: 2024,

  verification: [
    'identity',
  ],
};

const sophieSeller: ListingSeller = {
  id: 'seller-005',

  name: 'Sophie Reynolds',

  gainScore: 86,

  rating: 4.6,

  reviewCount: 31,

  responseTime:
    'Usually replies within 18 minutes',

  completedSales: 36,

  memberSince: 2024,

  verification: [
    'identity',
  ],
};

const michaelSeller: ListingSeller = {
  id: 'seller-006',

  name: 'Michael Harris',

  gainScore: 93,

  rating: 4.9,

  reviewCount: 84,

  responseTime:
    'Usually replies within 10 minutes',

  completedSales: 93,

  memberSince: 2022,

  verification: [
    'identity',
    'community',
  ],
};

const oliviaSeller: ListingSeller = {
  id: 'seller-007',

  name: 'Olivia Martin',

  gainScore: 90,

  rating: 4.8,

  reviewCount: 46,

  responseTime:
    'Usually replies within 15 minutes',

  completedSales: 51,

  memberSince: 2023,

  verification: [
    'identity',
    'community',
  ],
};

const danielSeller: ListingSeller = {
  id: 'seller-008',

  name: 'Daniel Cooper',

  gainScore: 91,

  rating: 4.8,

  reviewCount: 57,

  responseTime:
    'Usually replies within 9 minutes',

  completedSales: 64,

  memberSince: 2023,

  verification: [
    'identity',
    'business',
  ],
};

export const listings: Listing[] = [
  {
    id: 'listing-001',

    title:
      'Makita Impact Driver Kit',

    description:
      'Near-new Makita impact driver with two batteries, charger and hard carry case. Everything works perfectly and the kit has only had light residential use.',

    price: 180,

    currency: 'AUD',

    images: repeatImage(4),

    category: 'Tools',

    subcategory:
      'Power Tools',

    condition: 'Like new',

    location: {
      suburb: 'Mackay',
      state: 'QLD',
      distanceKm: 3,
    },

    seller: jakeSeller,

    createdAt:
      '15 min ago',

    isFavourite: false,

    allowsOffers: true,

    deliveryAvailable: false,

    pickupAvailable: true,
  },

  {
    id: 'listing-002',

    title:
      '2018 Toyota Hilux SR5',

    description:
      'Well-maintained Toyota Hilux SR5 with full service history. Clean inside and out, mechanically strong and set up for touring and everyday use. Includes canopy, bull bar, tow bar and a range of useful 4x4 upgrades.',

    price: 38900,

    currency: 'AUD',

    images: repeatImage(9),

    category: 'Vehicles',

    subcategory: 'Utes',

    condition: 'Excellent',

    location: {
      suburb: 'Mackay',
      state: 'QLD',
      distanceKm: 12,
    },

    seller: liamSeller,

    createdAt:
      '42 min ago',

    isFavourite: true,

    allowsOffers: true,

    deliveryAvailable: false,

    pickupAvailable: true,

    vehicleDetails: {
      year: 2018,

      make: 'Toyota',

      model: 'Hilux',

      variant: 'SR5',

      bodyType:
        'Dual Cab Ute',

      kilometres: 118500,

      transmission:
        '6-speed automatic',

      fuelType: 'Diesel',

      drivetrain: '4x4',

      engine:
        '2.8L Turbo Diesel',

      colour: 'White',

      registration:
        'QLD registration',

      modifications: [
        'Bull bar',
        'Canopy',
        'Tow bar',
        'Snorkel',
        '2-inch suspension lift',
        'All-terrain tyres',
        'Driving lights',
        'UHF radio',
      ],
    },
  },

  {
    id: 'listing-003',

    title:
      'Apple MacBook Air M2',

    description:
      'Excellent condition MacBook Air M2 with original charger, box and protective sleeve. Battery health is strong and the laptop has been well looked after.',

    price: 1150,

    currency: 'AUD',

    images: repeatImage(5),

    category: 'Electronics',

    subcategory: 'Computers',

    condition: 'Excellent',

    location: {
      suburb: 'Mackay',
      state: 'QLD',
      distanceKm: 7,
    },

    seller: emilySeller,

    createdAt: '4 hrs ago',

    isFavourite: false,

    allowsOffers: true,

    deliveryAvailable: true,

    pickupAvailable: true,
  },

  {
    id: 'listing-004',

    title:
      'Dual-Axle Landscaping Trailer',

    description:
      'Heavy-duty tandem landscaping trailer with mower rack, lockable tool storage and electric brakes. Built for daily trade use.',

    price: 7200,

    currency: 'AUD',

    images: repeatImage(8),

    category: 'Vehicles',

    subcategory: 'Trailers',

    condition: 'Good',

    location: {
      suburb: 'Mackay',
      state: 'QLD',
      distanceKm: 26,
    },

    seller: nathanSeller,

    createdAt: 'Yesterday',

    isFavourite: true,

    allowsOffers: true,

    deliveryAvailable: false,

    pickupAvailable: true,
  },

  {
    id: 'listing-005',

    title:
      'Outdoor Timber Dining Setting',

    description:
      'Solid hardwood outdoor dining table with eight matching chairs. Structurally excellent with normal cosmetic wear from outdoor use.',

    price: 480,

    currency: 'AUD',

    images: repeatImage(6),

    category: 'Furniture',

    subcategory:
      'Outdoor Furniture',

    condition: 'Good',

    location: {
      suburb: 'Mackay',
      state: 'QLD',
      distanceKm: 14,
    },

    seller: sophieSeller,

    createdAt: '2 days ago',

    isFavourite: false,

    allowsOffers: true,

    deliveryAvailable: true,

    pickupAvailable: true,
  },

  {
    id: 'listing-006',

    title:
      'Vintage Timber Tool Chest',

    description:
      'Original timber tradesman tool chest with aged brass hardware. Great display piece with plenty of usable storage.',

    price: 340,

    currency: 'AUD',

    images: repeatImage(7),

    category: 'Antiques',

    subcategory:
      'Workshop Antiques',

    condition: 'Good',

    location: {
      suburb: 'Mackay',
      state: 'QLD',
      distanceKm: 18,
    },

    seller: michaelSeller,

    createdAt: '2 days ago',

    isFavourite: false,

    allowsOffers: true,

    deliveryAvailable: false,

    pickupAvailable: true,
  },

  {
    id: 'listing-007',

    title:
      'Limited Edition AFL Memorabilia',

    description:
      'Framed limited-edition AFL memorabilia in excellent condition with certificate documentation included.',

    price: 620,

    currency: 'AUD',

    images: repeatImage(5),

    category: 'Collectables',

    subcategory:
      'Sports Memorabilia',

    condition: 'Excellent',

    location: {
      suburb: 'Mackay',
      state: 'QLD',
      distanceKm: 16,
    },

    seller: oliviaSeller,

    createdAt: '3 days ago',

    isFavourite: false,

    allowsOffers: true,

    deliveryAvailable: true,

    pickupAvailable: true,
  },

  {
    id: 'listing-008',

    title:
      'Beachside Storage Unit',

    description:
      'Secure storage unit close to central Mackay with easy vehicle access. Suitable for equipment, furniture or business storage.',

    price: 22000,

    currency: 'AUD',

    images: repeatImage(8),

    category: 'Property',

    subcategory: 'Storage',

    condition: 'Excellent',

    location: {
      suburb: 'Mackay',
      state: 'QLD',
      distanceKm: 9,
    },

    seller: danielSeller,

    createdAt: '4 days ago',

    isFavourite: false,

    allowsOffers: true,

    deliveryAvailable: false,

    pickupAvailable: false,
  },
];

export function getListingById(
  listingId: string,
): Listing | undefined {
  return listings.find(
    listing =>
      listing.id === listingId,
  );
}