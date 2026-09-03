import { expect, test } from '../src/fixture/base';
import { ROUTES } from '../src/routes';
import { FEATURED_LISTING_COUNT } from '../src/pages/types';

test.describe('Main page', () => {
  test.beforeEach(async ({ home }) => {
    await home.openMainPage();
  });

  test('Validate visually main page layout', async ({ page }) => {
    await expect(page).toHaveScreenshot({
      animations: 'disabled',
      mask: [page.locator('[role="complementary"]')],
      // maxDiffPixelRatio: 0.02,
    });
  });

  const SEARCH_QUERIES = [
    { label: 'city name', query: 'Amsterdam' },
    { label: 'zip code', query: '1025VB' },
  ];

  for (const { label, query } of SEARCH_QUERIES) {
    test(`Searching by ${label} ${query} should open the search results`, async ({
      home,
      page,
    }) => {
      await home.searchByPlace(query);

      await expect(
        page,
        `Searching by ${label} ${query} should navigate to search results`,
      ).toHaveURL(/\/zoeken\//);
    });
  }

  test('By clicking the map search link should open the map search', async ({ page, home }) => {
    await home.openMapSearch();

    await expect(
      page,
      'Map search link should navigate to the map search',
    ).toHaveURL(/\/zoeken\/kaart\//);
  });

  test('By clicking the agent search link should open the agent search', async ({ page, home }) => {
    await home.openAgentSearch();

    await expect(
      page,
      'Agent search link should navigate to the agent search',
    ).toHaveURL(new RegExp(`${ROUTES.agentSearch}/?$`));
  });

  test('By clicking the business portal link should open the business portal in a new tab', async ({
    page,
    home,
  }) => {
    await home.openBusinessPortal();
    const buisnessPortal = await page.context().waitForEvent('page');

    await expect(
      buisnessPortal,
      'Business portal should be opened in new tab on fundainbusiness.nl',
    ).toHaveURL(/fundainbusiness/);
  });

  test.describe('Featured homes section', () => {
    test('Should show the section with a full carousel', async ({ home }) => {
      await expect(home.featuredSection, 'Featured homes section should be visible').toBeVisible();
      await expect(home.featuredHeading, 'Featured homes heading should be visible').toBeVisible();
      await expect(
        home.featuredListingCards,
        `Carousel should hold ${FEATURED_LISTING_COUNT} listing cards`,
      ).toHaveCount(FEATURED_LISTING_COUNT);
    });

    test('Should display a complete listing on each card', async ({ home }) => {
      const homeCardsList = await home.getFeaturedHomeContent();

      expect(
        homeCardsList,
        `Carousel should return ${FEATURED_LISTING_COUNT} listings`,
      ).toHaveLength(FEATURED_LISTING_COUNT);
      homeCardsList.forEach((item, index) => {
        const cardLabel = `Listing ${index + 1} "${item.street}"`;

        for (const [field, value] of Object.entries(item)) {
          expect(value, `${cardLabel} should have ${field} as a string`).toEqual(
            expect.any(String),
          );
          expect(value.trim(), `${cardLabel} should have a non-empty ${field}`).not.toBe('');
        }
      });
    });
  });
});
