import { expect, test } from '../src/fixture/base';
import { parsePriceAmount } from '../src/utils';

const SEARCH_TYPE = 'koop';
const SEARCH_AREA = 'amsterdam';
const MAX_PRICE = 500_000;

test.describe('Search result filters', () => {
  test('Should return only houses within the selected price range', async ({
    page,
    searchResults,
  }) => {
    const results = searchResults(SEARCH_TYPE);
    await results.openSearchListResults(SEARCH_AREA);
    await results.openFilters();
    const promisedBeforeFiltering = await results.filters.applyButton.innerText();

    await results.filters.getObjectType('house').check();
    await results.filters.priceTo.fill(String(MAX_PRICE));
    await results.filters.priceTo.press('Enter');

    await expect(results.filters.applyButton).not.toHaveText(promisedBeforeFiltering);

    const promisedCount = await results.filters.getPromisedResultCount();
    expect(promisedCount, 'The filter should still leave results').toBeGreaterThan(0);
    await results.filters.clickApply();

    await expect(page, 'The price filter should be in the URL').toHaveURL(
      new RegExp(`price=[^&]*${MAX_PRICE}`),
    );
    await expect(page, 'The object type filter should be in the URL').toHaveURL(
      /object_type=[^&]*house/,
    );

    expect(
      await results.getResultCount(),
      'The results page should show as many listings as the filter panel promised',
    ).toBe(promisedCount);

    const cards = await results.getResultCardsContent();

    expect(cards.length, 'Should be filtered listings to check').toBeGreaterThan(0);
    for (const card of cards) {
      expect(
        parsePriceAmount(card.price),
        `${card.street} is priced above the ${MAX_PRICE} filter`,
      ).toBeLessThanOrEqual(MAX_PRICE);
    }
  });
});