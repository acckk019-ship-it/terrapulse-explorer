import { LocationPoint } from '../types';

export const EARTH_LOCATIONS: LocationPoint[] = [
  // Talaat Moustafa Group (TMG) - Major Residential & Mixed-Use Communities
  {
    id: 'madinaty',
    name: 'Madinaty',
    lat: 30.0967,
    lng: 31.6319,
    country: 'Egypt',
    category: 'tmg_community',
    description: 'Massive international-standard modern city in New Cairo covering 8,000 acres, designed by HHCP, SWA, and SASAKI.',
    population: '700,000+ Capacity',
    altitude: '280 m',
    funFact: 'Madinaty features a world-class 18-hole championship golf course and expansive central parks.'
  },
  {
    id: 'al_rehab_city',
    name: 'Al Rehab City',
    lat: 30.0561,
    lng: 31.4925,
    country: 'Egypt',
    category: 'tmg_community',
    description: "New Cairo's pioneer self-sustained community spanning 10 million square meters, featuring lush green belts and full civic amenities.",
    population: '300,000+ Residents',
    altitude: '250 m',
    funFact: "Al Rehab was Egypt's very first fully integrated private city developed by TMG in 1997."
  },
  {
    id: 'southmed',
    name: 'SouthMed Egypt',
    lat: 31.0650,
    lng: 28.4350,
    country: 'Egypt',
    category: 'tmg_resort',
    description: 'Expansive global luxury coastal destination and resort city located on the Mediterranean North Coast (Kilo 165 - Dabaa).',
    population: 'Global Coastal City',
    altitude: '10 m',
    funFact: 'SouthMed features pristine white-sand beaches, international marinas, and branded residential luxury.'
  },
  {
    id: 'noor_city',
    name: 'Noor City',
    lat: 30.1385,
    lng: 31.7580,
    country: 'Egypt',
    category: 'tmg_community',
    description: "TMG's futuristic smart-green city in front of the New Capital, spanning 5,000 feddans with advanced AI urban management.",
    population: '600,000+ Projected',
    altitude: '260 m',
    funFact: 'Noor City utilizes smart IoT sensors and sustainable green infrastructure to minimize energy consumption.'
  },
  {
    id: 'celia',
    name: 'Celia',
    lat: 30.0050,
    lng: 31.7050,
    country: 'Egypt',
    category: 'tmg_community',
    description: "Spanning over 500 feddans in the heart of the New Administrative Capital's desirable Green River zone.",
    population: '150,000+ Projected',
    altitude: '310 m',
    funFact: "Celia is the only residential project situated directly along the New Capital's iconic Green River."
  },
  {
    id: 'privado',
    name: 'Privado',
    lat: 30.0920,
    lng: 31.6480,
    country: 'Egypt',
    category: 'tmg_community',
    description: 'Exclusive gated luxury apartment community nestled inside Madinaty with private clubhouses and lagoons.',
    population: '9,900 Luxury Units',
    altitude: '285 m',
    funFact: 'Privado residents enjoy private waterfront views and exclusive subterranean parking hubs.'
  },
  {
    id: 'eden_al_rehab',
    name: 'Eden',
    lat: 30.0620,
    lng: 31.5050,
    country: 'Egypt',
    category: 'tmg_community',
    description: 'Modern residential apartment phase located within Al Rehab City, combining contemporary architecture with serene garden views.',
    population: 'Exclusive Phase',
    altitude: '255 m',
    funFact: "Eden represents TMG's latest evolutionary architectural design within the established Al Rehab ecosystem."
  },
  {
    id: 'al_rabwa',
    name: 'Al Rabwa',
    lat: 30.0380,
    lng: 30.9850,
    country: 'Egypt',
    category: 'tmg_community',
    description: 'Premium luxury villa compound situated in Sheikh Zayed City with panoramic views of golf courses and lakes.',
    population: '1,000+ Luxury Villas',
    altitude: '190 m',
    funFact: "Al Rabwa was one of the earliest high-end golf community developments in Greater Cairo's western suburbs."
  },
  {
    id: 'may_fair',
    name: 'May Fair',
    lat: 30.1450,
    lng: 31.6150,
    country: 'Egypt',
    category: 'tmg_community',
    description: 'Cozy residential development located in El Shorouk City, featuring elegant townhouses and private sporting clubs.',
    population: 'Gated Community',
    altitude: '240 m',
    funFact: 'May Fair is renowned for its tranquil tree-lined boulevards and family-centric community planning.'
  },
  {
    id: 'the_spine',
    name: 'The Spine',
    lat: 30.0120,
    lng: 31.7200,
    country: 'Egypt',
    category: 'tmg_community',
    description: 'Major commercial, business, and hospitality hub project in the New Administrative Capital.',
    population: 'Commercial Hub',
    altitude: '300 m',
    funFact: 'The Spine is engineered to be a vibrant 24/7 business and lifestyle artery connecting luxury residential sectors.'
  },
  // Talaat Moustafa Group (TMG) - Coastal & Resort Developments
  {
    id: 'virginia_beach',
    name: 'Virginia Beach Village',
    lat: 30.9850,
    lng: 28.8500,
    country: 'Egypt',
    category: 'tmg_resort',
    description: "Early summer resort and compound project on Egypt's North Coast, paving the way for luxury coastal living.",
    population: 'Resort Community',
    altitude: '5 m',
    funFact: "Virginia Beach was among TMG's pioneering steps in establishing the Mediterranean coast as a premier vacation destination."
  },
  {
    id: 'sharm_bay',
    name: 'Sharm Bay',
    lat: 27.9580,
    lng: 34.3950,
    country: 'Egypt',
    category: 'tmg_resort',
    description: 'Exceptional premium coastal resort project located on the crystal-clear waters of the Red Sea in Sharm El Sheikh.',
    population: 'Luxury Resort',
    altitude: '15 m',
    funFact: 'Sharm Bay offers world-renowned coral reef diving directly from its private coastline.'
  },
  // Talaat Moustafa Group (TMG) - Regional & International Projects
  {
    id: 'banan_city',
    name: 'Banan City',
    lat: 25.0450,
    lng: 46.8550,
    country: 'Saudi Arabia',
    category: 'tmg_community',
    description: 'Large-scale smart residential suburb across 10 million sq m in northeastern Riyadh, developed with NHC for 27,000 homes.',
    population: '120,000+ Projected',
    altitude: '620 m',
    funFact: "Banan City is TMG's landmark expansion into Saudi Arabia, bringing sustainable smart-city living to Riyadh."
  },
  {
    id: 'jood_muscat',
    name: 'Jood',
    lat: 23.6150,
    lng: 58.1850,
    country: 'Oman',
    category: 'tmg_community',
    description: 'Integrated smart community situated within Sultan Haitham City in Muscat, Oman, blending modern luxury with Omani heritage.',
    population: 'Smart Community',
    altitude: '45 m',
    funFact: "Jood represents TMG's pioneering venture into the Sultanate of Oman's urban transformation."
  },
  {
    id: 'yamal_muscat',
    name: 'Yamal',
    lat: 23.6680,
    lng: 58.1950,
    country: 'Oman',
    category: 'tmg_resort',
    description: 'High-end coastal destination located on the shores of Al Seeb in Muscat, where world-class living meets timeless leisure.',
    population: 'Coastal Destination',
    altitude: '8 m',
    funFact: 'Yamal offers breathtaking views of the Gulf of Oman alongside ultra-luxury marina promenades.'
  },
  // Talaat Moustafa Group (TMG) - Hospitality Portfolio
  {
    id: 'four_seasons_nile_plaza',
    name: 'Four Seasons Nile Plaza',
    lat: 30.0368,
    lng: 31.2311,
    country: 'Egypt',
    category: 'tmg_resort',
    description: 'Iconic 30-story luxury hotel tower located directly on the banks of the Nile River in Garden City, Cairo.',
    population: '365 Luxury Rooms',
    altitude: '25 m',
    funFact: 'Nile Plaza features an extensive private collection of modern Egyptian artwork displayed throughout the hotel.'
  },
  {
    id: 'four_seasons_sharm_el_sheikh',
    name: 'Four Seasons Sharm El Sheikh',
    lat: 27.9620,
    lng: 34.3920,
    country: 'Egypt',
    category: 'tmg_resort',
    description: 'World-class oasis resort nestled between desert mountains and the Red Sea coral reefs.',
    population: 'Luxury Suites & Villas',
    altitude: '20 m',
    funFact: 'The resort boasts private funicular trains transporting guests down cliffside gardens directly to the beach.'
  },
  {
    id: 'four_seasons_san_stefano',
    name: 'Four Seasons San Stefano',
    lat: 31.2455,
    lng: 29.9668,
    country: 'Egypt',
    category: 'tmg_resort',
    description: 'Architectural landmark directly overlooking the Mediterranean Sea in historic Alexandria.',
    population: 'Luxury Waterfront Plaza',
    altitude: '12 m',
    funFact: 'San Stefano features a private marina and promenade reminiscent of the French Riviera.'
  },
  {
    id: 'kempinski_nile_hotel',
    name: 'Kempinski Nile Hotel',
    lat: 30.0355,
    lng: 31.2315,
    country: 'Egypt',
    category: 'tmg_resort',
    description: "Boutique 5-star luxury hotel offering personalized butler service and panoramic rooftop views of Cairo's skyline.",
    population: '191 Boutique Rooms',
    altitude: '25 m',
    funFact: "The rooftop pool offers a stunning 360-degree view of Cairo's skyline and the Nile."
  }
];

