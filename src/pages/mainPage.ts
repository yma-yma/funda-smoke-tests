import { test, type Locator, type Page } from '@playwright/test';
import { ROUTES } from '../routes';
import { searchTab, SEARCH_TAB_IDS, FeaturedListing,  } from './types';

export class HomePage {
  private readonly page: Page;
  private readonly main: Locator;
  private readonly entryPointsSection: Locator;
  readonly searchInput: Locator;
  readonly mapSearchLink: Locator;
  readonly businessPortalLink: Locator;
  readonly agentSearchLink: Locator;
  readonly housingMarketInfoLink: Locator;
  readonly featuredSection: Locator;
  readonly featuredHeading: Locator;
  readonly featuredListingCards: Locator;
  readonly featuredListingLinks: Locator;

   constructor(page: Page) {
    this.page = page;
    this.main = this.page.locator('#main-content');
    this.searchInput = this.page.getByTestId('search-box');
    this.mapSearchLink = this.main.locator('a[href*="/zoeken/kaart/"]');
    this.entryPointsSection = this.main.locator('section').filter({ has: this.page.locator('a[href$="/makelaar-zoeken"]') });
    this.businessPortalLink = this.entryPointsSection.locator('a[href*="fundainbusiness"]');
    this.agentSearchLink = this.entryPointsSection.locator('a[href$="/makelaar-zoeken"]');
    this.housingMarketInfoLink = this.entryPointsSection.locator('a[href$="/meer-weten"]');
    this.featuredHeading = this.page.getByRole('heading', { name: 'Woning in beeld' });
    this.featuredSection = this.main.locator('section').filter({ has: this.featuredHeading });
    this.featuredListingCards = this.featuredSection.locator('swiper-slide');
    this.featuredListingLinks = this.featuredSection.locator('a[href*="/detail/"]');
  }

  searchTab(tab: searchTab): Locator {
    return this.main.locator(`[role="tab"][id$="-trigger-${SEARCH_TAB_IDS[tab]}"]`);
  }

  async openMainPage(): Promise<void> {
    await test.step('Open main page', async () => {
      await this.page.goto(ROUTES.main);
    });
  }

  async selectSearchTab(tab: searchTab): Promise<void> {
    await test.step(`Select search tab ${tab}`, async () => {
      await this.searchTab(tab).click();
    });
  }

  async searchByPlace(place: string): Promise<void> {
    await test.step(`Search by place ${place}`, async () => {
      await this.searchInput.fill(place);
      await this.searchInput.press('Enter');
    });
  }

  async openMapSearch(): Promise<void> {
    await test.step('Open map search', async () => {
      await this.mapSearchLink.click();
    });
  }

  async openAgentSearch(): Promise<void> {
    await test.step('Open agent search', async () => {
      await this.agentSearchLink.click();
    });
  }

  async openBusinessPortal(): Promise<void> {
    await test.step('Open business portal', async () => {
      await this.businessPortalLink.click();
    });
  }

  async getFeaturedHomeContent(): Promise<FeaturedListing[]> {
    return await test.step('Get featured home content', async () => {
      await this.featuredListingCards.first().waitFor();
      const homeCards = await this.featuredListingCards.all();

      return Promise.all(
        homeCards.map(async (card) => {
          const homeDetails = card.locator('a[href*="/detail/"]');
          const street = homeDetails.locator(':scope > div').last();
          const agent = card.locator('a:not([href*="/detail/"])');

          return {
            detailHref: (await homeDetails.getAttribute('href')) ?? '',
            imageSrcset: (await card.locator('img').getAttribute('srcset')) ?? '',
            price: (await card.getByText(/€\s?[\d.]+/).innerText()).trim(),
            street: (await street.innerText()).trim(),
            city: (await card.getByText(/\d{4}\s?[A-Z]{2}\b/).innerText()).trim(),
            agent: (await agent.innerText()).trim(),
          };
        }),
      );
    });
  }
}