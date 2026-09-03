import { expect, test } from '../src/fixture/base';
import { SEARCH_SCENARIOS } from '../src/pages/types';
import type { FeatureCategory } from '../src/pages/listingDetailPage';
import type { SearchResultsPage } from '../src/pages/searchResultsPage';
import { getPriceAmount } from '../src/utils';

const CORE_FEATURE_CATEGORIES: FeatureCategory[] = [
  'overdracht',
  'bouw',
  'afmetingen',
  'energie',
];

const MIN_DESCRIPTION_LENGTH = 100;

for (const { searchOption, place } of SEARCH_SCENARIOS) {
  test.describe(`Listing detail ${searchOption} / ${place}`, () => {
    let results: SearchResultsPage;

    test.beforeEach(async ({ searchResults }) => {
      results = searchResults(searchOption);
      await results.openSearchListResults(place);
    });

    test('Result card and open listing page should have the same data', async ({
      listingDetail,
    }) => {
      const card = await test.step('Read the first result card', async () =>
        (await results.getResultCardsContent())[1]);
      await results.openListingDetailPage(1);
      const cardPriceAmount = getPriceAmount(card.price);

      await expect(
        listingDetail.heading,
        'The page heading should contain the address shown on the result card',
      ).toContainText(card.street);
      await expect(
        listingDetail.heading,
        'Postal code and city should match the result card',
      ).toContainText(card.postalCodeAndCity);

      expect(cardPriceAmount, 'The result card should show a price amount').not.toBe('');
      expect(
        await listingDetail.getPriceAmount(),
        'The price on the listing page should match the price on the result card',
      ).toBe(cardPriceAmount);
    });

    test('Listing data is present and correctly formatted', async ({ listingDetail }) => {
      await results.openListingDetailPage(2);

      /* The searched area is a city name in one scenario and a postcode in the
         other, and Funda records them in different attributes. */
      const areaAttribute = /^\d/.test(place) ? 'postcode' : 'city';

      await expect(
        listingDetail.addressData,
        'The postal code should be a valid Dutch one',
      ).toHaveAttribute('postcode', /^\d{4}[A-Z]{2}$/);
      await expect(
        listingDetail.addressData,
        `The listing should be located in ${place}`,
      ).toHaveAttribute(areaAttribute, new RegExp(place, 'i'));
      await expect(
        listingDetail.addressData,
        'The house number should be present',
      ).toHaveAttribute('housenumber', /\S/);

      await expect(
        listingDetail.price,
        'The price should be an amount in euros',
      ).toHaveText(/^€\s?[\d.]+/);

      await expect(
        listingDetail.getListingBaseParameter('wonen'),
        'Living area should be given in square metres',
      ).toHaveText(/\d+\s?m²/);
      await expect(
        listingDetail.getListingBaseParameter('energielabel'),
        'An energy label is legally required when a home is offered, so every listing must show one',
      ).toHaveText(/[A-G]/);

      await expect(
        listingDetail.mapLink,
        'The link to the map view should be visible',
      ).toBeVisible();
    });

    test('Media gallery and listing description should be loaded', async ({ listingDetail }) => {
      await results.openListingDetailPage(3);

      await expect(listingDetail.getMediaLink('fotos')).toBeVisible();
      await expect(
        listingDetail.getMediaLink('fotos'),
        'The photos link should show how many photos there are',
      ).toContainText(/\d+/);
      await expect(listingDetail.descriptionText).toBeVisible();

      const description = await listingDetail.descriptionText.innerText();
      expect(
        description.trim().length,
        'The description should not be empty or truncated to a few characters',
      ).toBeGreaterThan(MIN_DESCRIPTION_LENGTH);
    });

    test('The features section should list the core categories and repeats the header price', async ({
      listingDetail,
    }) => {
      await results.openListingDetailPage(4);

      for (const category of CORE_FEATURE_CATEGORIES) {
        await expect(
          listingDetail.getFeatureCategory(category),
          `Features category "${category}" should be visible`,
        ).toBeVisible();
      }

      const amount = await listingDetail.getPriceAmount();
      await expect(
        listingDetail.getFeatureCategory('overdracht'),
        'The price listed under "Overdracht" should match the price in the header',
      ).toContainText(amount);
    });

    /**
     * Not covered yet.
     *
     * The "Vergelijkbaar in de buurt" block is loaded lazily on scroll and has
     * two valid states: a carousel of listing cards, or an empty state reading
     * "Er zijn geen vergelijkbare woningen in de buurt" when the property has no
     * comparable homes nearby. Both are correct behaviour.
     *
     * Which one appears depends on whichever listing is at this position in the
     * search results that day, so the assertion below only holds for one of the
     * two. Covering it properly means asserting the block resolves to either
     * state, which needs the empty state's markup — not inspected yet.
     *
     * Deliberately left as a skipped test rather than deleted, so the gap is
     * visible rather than silently missing.
     */
    test.skip('The comparable listings block should load', async ({ page, listingDetail }) => {
      await results.openListingDetailPage(5);

      await page.keyboard.press('End');

      await expect(
        listingDetail.similarListingsHeading,
        'The comparable listings block should be rendered after scrolling to it',
      ).toBeVisible();

      const cardCount = await listingDetail.similarListingCards.count();

      if (cardCount > 0) {
        await expect(
          listingDetail.similarListingCards.first(),
          'A comparable listing should link to its own detail page',
        ).toBeVisible();
        await expect(
          listingDetail.similarListingCards.first().locator('a[href*="/detail/"]').first(),
        ).toHaveAttribute('href', /\/detail\//);
      }
    });
  });
}
