import { expect, test } from '../src/fixture/base';
import { SEARCH_SCENARIOS } from '../src/pages/types';

const COMBINED_LISTING_SEGMENT = 'koophuur';

for (const { searchOption, place } of SEARCH_SCENARIOS) {
  test.describe(`Search results ${searchOption} in ${place}`, () => {
    test.describe('List view', () => {
      test('Should return a non-empty set of results', async ({ searchResults }) => {
        const results = searchResults(searchOption);
        await results.openSearchListResults(place);

        const count = await results.getResultCount();

        expect(count, 'Result count should be present and parseable').not.toBeNull();
        expect(
          count,
          `Searching ${place} should return at least one ${searchOption} listing`,
        ).toBeGreaterThan(0);
        await expect(results.resultAddresses.first(), 'Listing cards should render').toBeVisible();

        await expect(
          results.pageHeader,
          `Results should be filtered to ${place}, not to the whole of Funda`,
        ).toContainText(new RegExp(place, 'i'));

        const addresses = await results.resultAddresses.allInnerTexts();
        for (const address of addresses) {
          expect(
            address.toLowerCase(),
            `Every result should be in the searched area (${place})`,
          ).toContain(place.toLowerCase());
        }
      });

      test('Should offer the controls needed to refine the search', async ({ searchResults }) => {
        const results = searchResults(searchOption);
        await results.openSearchListResults(place);

        await expect(results.filtersButton, 'Filters button should be visible').toBeVisible();
        await expect(results.sortButton, 'Sort control should be visible').toBeVisible();
        await expect(results.mapViewLink, 'Map view link should be visible').toBeVisible();
      });

      test('Should display proper address, price, and agent information on every card', async ({
        searchResults,
      }) => {
        const results = searchResults(searchOption);
        await results.openSearchListResults(place);

        const content = await results.getResultCardsContent();

        expect(content.length, 'Should be cards listing to check').toBeGreaterThan(0);
        content.forEach((card, index) => {
          expect(card.street, `Listing ${index + 1} should have a non-empty street`).toBeTruthy();
          expect(
            card.postalCodeAndCity,
            `Listing ${index + 1} should show a postal code and a city`,
          ).toMatch(/^\d{4}\s?[A-Z]{2}\s+\S/);
          expect(
            card.postalCodeAndCity.toLowerCase(),
            `Listing ${index + 1} should be located in ${place}`,
          ).toContain(place);
          expect(
            card.detailUrl,
            `Listing ${index + 1} should link to its ${searchOption} detail page`,
          ).toMatch(new RegExp(`^/detail/(${searchOption}|${COMBINED_LISTING_SEGMENT})/`));
          expect(card.price, `Listing ${index + 1} should show a price in euros`).toMatch(
            /€\s?[\d.]+/,
          );
          expect(card.agent, `Listing ${index + 1} should have a non-empty agent`).toBeTruthy();
          expect(
            card.agentUrl,
            `Listing ${index + 1} should link to the agent's funda page`,
          ).toMatch(/^\/makelaar\/\S+/);
        });
      });

      test('Should render the "Toppositie" placement alongside results', async ({
        searchResults,
      }) => {
        const results = searchResults(searchOption);
        await results.openSearchListResults(place);

        await expect(
          results.topPositionSection,
          'Toppositie section should be visible',
        ).toBeVisible();
        expect(
          await results.topPositionCards.count(),
          'Toppositie section should contain at least one listing',
        ).toBeGreaterThan(0);
        await expect(
          results.resultAddresses.first(),
          'Toppositie results should still render alongside the paid placement',
        ).toBeVisible();
      });

      test('Should load a different set of results on the next page', async ({ searchResults }) => {
        const results = searchResults(searchOption);
        await results.openSearchListResults(place);

        await expect(results.pagination, 'Pagination should be visible').toBeVisible();

        const firstPageOfResults = await results.getResultAddresses();
        await results.openNextPage();
        const secondPageOfResults = await results.getResultAddresses();

        expect(
          secondPageOfResults.length,
          'The second page should also show results',
        ).toBeGreaterThan(0);
        expect(
          secondPageOfResults,
          'The second page should not repeat the first page',
        ).not.toEqual(firstPageOfResults);
      });

      test('Should open a listing detail page when a result is clicked', async ({
        searchResults,
        page,
      }) => {
        const results = searchResults(searchOption);
        await results.openSearchListResults(place);

        await results.resultAddresses.first().click();

        await expect(
          page,
          'Clicking a result should navigate to its detail page',
        ).toHaveURL(new RegExp(`/detail/${searchOption}/`));
      });
    });

    test.describe('Map view', () => {
      test('Should render the map for the same search', async ({ searchResults, page }) => {
        const results = searchResults(searchOption);
        await results.openSearchResultsMap(place);

        await expect(
          page,
          'Map view should keep the searched area in the URL',
        ).toHaveURL(new RegExp(`/zoeken/kaart/${searchOption}`));
        await expect(
          page.getByRole('region', { name: /map/i }),
          'Map region should be visible',
        ).toBeVisible();
      });
    });
  });
}
