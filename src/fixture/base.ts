// src/fixture/base.ts
import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/mainPage';
import { SearchType } from '../routes';
import { SearchResultsPage } from '../pages/searchResultsPage';
import { ListingDetailPage } from '../pages/listingDetailPage';
import { AgentContactPage } from '../pages/agentContactPage';

export const test = base.extend<{
  home: HomePage;
  searchResults: (searchOption: SearchType) => SearchResultsPage;
  listingDetail: ListingDetailPage;
  agentContact: AgentContactPage;
}>({
  page: async ({ page }, use) => {
    const consentBanner = page.getByTestId('notice');
    await page.addLocatorHandler(consentBanner, async () => {
      await consentBanner.locator('#didomi-notice-disagree-button').click();
    });

    const surveyDeclineButton = page.getByRole('button', { name: /nee dankje/i });
    await page.addLocatorHandler(surveyDeclineButton, async () => {
      await surveyDeclineButton.click();
    });

    await use(page);
  },

  home: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  searchResults: async ({ page }, use) => {
    await use((searchOption: SearchType) => new SearchResultsPage(page, searchOption));
  },

  listingDetail: async ({ page }, use) => {
  await use(new ListingDetailPage(page));
},

agentContact: async ({ page }, use) => {
  await use(new AgentContactPage(page));
},

});

export { expect };