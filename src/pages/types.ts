export type FeaturedListing = {
  detailHref: string;
  imageSrcset: string;
  price: string;
  street: string;
  city: string;
  agent: string;
};

export type SearchType = 'koop' | 'huur';

export const SEARCH_TAB_IDS = {
  Koop: 'buy',
  Huur: 'rent',
  Nieuwbouw: 'newlyBuilt',
  Recreatie: 'recreational',
  Europa: 'europe',
} as const;

export type searchTab = keyof typeof SEARCH_TAB_IDS;

export const FEATURED_LISTING_COUNT = 3;

export interface ListingCardContent {
  street: string;
  postalCodeAndCity: string;
  detailUrl: string;
  price: string;
  agent: string;
  agentUrl: string;
}

export const SEARCH_SCENARIOS: { searchOption: SearchType; place: string }[] = [
  { searchOption: 'koop', place: 'amsterdam' },
  { searchOption: 'huur', place: '1071' },
];

export type ListingSummary = {
  street: string;
  postalCodeAndCity: string;
  price: string;
  agent: string;
};

export const VIEWING_DAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr'] as const;
export const VIEWING_DAYPARTS = ["'s morgens", "'s middags"] as const;
export type ViewingPreference =
  | (typeof VIEWING_DAYS)[number]
  | (typeof VIEWING_DAYPARTS)[number];