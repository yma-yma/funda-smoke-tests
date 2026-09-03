import type { Locator, Page } from '@playwright/test';
import { AgentSection } from '../components/agentSection';
import { getPriceAmount } from '../utils';

export const FEATURE_CATEGORIES = [
  'overdracht',
  'bouw',
  'afmetingen',
  'indeling',
  'energie',
  'cadastral',
  'buitenruimte',
  'parkeergelegenheid',
  'vvechecklist',
] as const;
export type FeatureCategory = (typeof FEATURE_CATEGORIES)[number];
export const MEDIA_KINDS = ['fotos', 'plattegronden', '360-fotos', 'videos'] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export class ListingDetailPage {
  private readonly page: Page;
  readonly about: Locator;
  readonly heading: Locator;
  readonly addressData: Locator;
  readonly price: Locator;
  readonly listingBaseInfo: Locator;
  readonly mapLink: Locator;
  readonly media: Locator;
  readonly mediaNav: Locator;
  readonly description: Locator;
  readonly descriptionText: Locator;
  readonly features: Locator;
  readonly similarListingsHeading: Locator;
  readonly similarListingCards: Locator;
  readonly similarListingsCarousel: Locator;
  readonly agent: AgentSection;

  constructor(page: Page) {
    this.page = page;
    this.about = this.page.locator('#about');
    this.heading = this.about.locator('h1[data-global-id]');
    this.addressData = this.about.locator('div[postcode][city][housenumber]');
    this.price = this.about.getByText(/^€/);
    this.listingBaseInfo = this.about.locator('ul');
    this.mapLink = this.about.locator('a[href$="/kaart"]');
    this.media = this.page.locator('#media');
    this.mediaNav = this.media.locator('ul').filter({ has: this.page.getByTestId('photos') });
    this.description = this.page.locator('section:has([data-testid="expandable-panel-header"]):not(#features)');
    this.descriptionText = this.description.getByTestId('expandable-panel-header');
    this.features = this.page.locator('#features');
    this.similarListingsHeading = this.page.getByRole('heading', { name: 'Vergelijkbaar in de buurt' });
    this.similarListingsCarousel = this.page.locator('swiper-container').filter({ has: this.page.getByTestId('listing-card') });
    this.similarListingCards = this.similarListingsCarousel.getByTestId('listing-card');
    this.agent = new AgentSection(this.page.locator('div:has(> section):has(> div > div > h3 > a[href*="/makelaar/"])'));
  }

  getListingBaseParameter(label: string): Locator {
    return this.listingBaseInfo.locator('li').filter({ hasText: label });
  }

  getMediaLink(kind: MediaKind): Locator {
    return this.mediaNav.locator(`a[href$="/media/${kind}"]`);
  }

  getFeatureCategory(category: FeatureCategory): Locator {
    return this.features.getByTestId(`category-${category}`);
  }

  async getPriceAmount(): Promise<string> {
    return getPriceAmount((await this.price.innerText()).trim());
  }

  async getGlobalId(): Promise<string | null> {
    return this.heading.getAttribute('data-global-id');
  }
}