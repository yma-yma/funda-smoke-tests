import { expect, test, type Locator, type Page } from '@playwright/test';
import { ROUTES } from '../routes';
import type { ListingCardContent, SearchType } from './types';
import { SearchFilters } from '../components/searchFilters';

const RESULT_ADDRESS_TEST_ID = 'listingDetailsAddress';
const AGENT_LINK_SELECTOR = 'a.link[href^="/makelaar/"]';
const PRICE_SUFFIX: Record<SearchType, RegExp> = {
  koop: /k\.k\.|v\.o\.n\./,
  huur: /p\.m\.|per maand/,
};

export class SearchResultsPage {
  private readonly page: Page;
  private readonly searchOption: SearchType;
  private readonly results: Locator;

  readonly pageHeader: Locator;
  readonly searchInput: Locator;
  readonly filtersButton: Locator;
  readonly sortButton: Locator;
  readonly mapViewLink: Locator;
  readonly pagination: Locator;
  readonly nextPageLink: Locator;

  readonly topPositionSection: Locator;
  readonly topPositionCards: Locator;
  readonly resultCount: Locator;
  readonly resultCards: Locator;
  readonly resultAddresses: Locator;
  readonly agentCards: Locator;
  readonly filters: SearchFilters;

  constructor(page: Page, searchOption: SearchType) {
    this.page = page;
    this.searchOption = searchOption;
    this.results = this.page.locator('#PageListings');
    this.pageHeader = this.results.getByTestId('pageHeader');
    this.searchInput = this.results.getByTestId('search-box');
    this.filtersButton = this.results
      .getByTestId('QuickFiltersFilterButton')
      .getByTestId('ButtonBarFilterButton');
    this.sortButton = this.results.getByRole('combobox', { name: 'Sorteer' });
    this.mapViewLink = this.results.locator(`a[href^="/zoeken/kaart/${searchOption}"]`).first();
    this.pagination = this.results.getByTestId('pagination');
    this.nextPageLink = this.pagination.getByRole('link', { name: 'Volgende' });
    this.topPositionSection = this.results.getByTestId('top-position-wrapper');
    this.topPositionCards = this.results.getByTestId('top-position-listing');
    this.resultCount = this.pageHeader.locator('div').first();
    this.resultCards = this.results.locator(
      `div:has(> h2 > a[data-testid="${RESULT_ADDRESS_TEST_ID}"])`,
    );
    this.resultAddresses = this.results.getByTestId(RESULT_ADDRESS_TEST_ID);
    this.agentCards = this.results.getByTestId('agent-card');
    this.filters = new SearchFilters(this.page);
  }

  async openSearchListResults(place: string): Promise<void> {
    await test.step(`Open ${this.searchOption} search results for ${place}`, async () => {
      await this.page.goto(ROUTES.search(this.searchOption, place));
    });
  }

  async openSearchResultsMap(place: string): Promise<void> {
    await test.step(`Open ${this.searchOption} map results for ${place}`, async () => {
      await this.page.goto(ROUTES.searchMap(this.searchOption, place));
    });
  }

  async getResultCount(): Promise<number | null> {
    return await test.step(`Get the number of ${this.searchOption} results`, async () => {
      const text = await this.resultCount.textContent();
      const match = text?.match(/[\d.]+/);
      return match ? Number(match[0].replace(/\./g, '')) : null;
    });
  }

  async getResultCardsContent(): Promise<ListingCardContent[]> {
    const cards = await this.resultCards.all();

    return Promise.all(
      cards.map(async (card) => {
        const address = card.getByTestId(RESULT_ADDRESS_TEST_ID);
        const agentLink = card.locator(AGENT_LINK_SELECTOR);
        const prices = await card.getByText(/€/).allInnerTexts();
        const price =
          prices.find((value) => PRICE_SUFFIX[this.searchOption].test(value)) ?? prices[0] ?? '';

        return {
          street: (await address.locator('span.truncate').innerText()).trim(),
          postalCodeAndCity: (await address.locator('div.truncate').innerText()).trim(),
          detailUrl: (await address.getAttribute('href')) ?? '',
          price: price.trim(),
          agent: (await agentLink.innerText()).trim(),
          agentUrl: (await agentLink.getAttribute('href')) ?? '',
        };
      }),
    );
  }

  async openNextPage(): Promise<void> {
    await test.step('Open the next page of results', async () => {
      const firstAddressBefore = await this.resultAddresses.first().innerText();
      await this.nextPageLink.click();

      await expect(this.resultAddresses.first()).not.toHaveText(firstAddressBefore);
    });
  }

  async getResultAddresses(): Promise<string[]> {
    return await test.step(`Get the addresses of the ${this.searchOption} results`, async () => {
      await this.resultCards.first().waitFor();
      const addresses = await this.resultAddresses.allInnerTexts();
      return addresses.map((address) => address.trim());
    });
  }

  async openListingDetailPage(index = 0): Promise<void> {
    await test.step(`Open the listing at position ${index}`, async () => {
      await this.resultCards.nth(index).getByTestId(RESULT_ADDRESS_TEST_ID).click();
      await this.page.waitForURL(/\/detail\//);
    });
  }

  async openFilters(): Promise<void> {
    await test.step('Open the filter panel', async () => {
      await this.filtersButton.click();
      await this.filters.panel.waitFor();
    });
  }
}
