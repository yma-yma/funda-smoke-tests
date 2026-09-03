import { expect, test } from '../../src/fixture/base';
import { SEARCH_SCENARIOS, type ListingCardContent } from '../../src/pages/types';
import { agentProfileId } from '../../src/utils';

for (const { searchOption, place } of SEARCH_SCENARIOS) {
  test.describe(`Estate agent section ${searchOption}`, () => {
    let card: ListingCardContent;

    test.beforeEach(async ({ searchResults }) => {
      const results = searchResults(searchOption);
      await results.openSearchListResults(place);
      card = (await results.getResultCardsContent())[1];
      await results.openListingDetailPage(1);
    });

    test('Should show the same estate agent as the result card it was opened from', async ({
      listingDetail,
    }) => {
      await expect(
        listingDetail.agent.profileLink,
        'Agency name should match the one shown on the result card',
      ).toHaveText(card.agent);

      const cardAgentId = agentProfileId(card.agentUrl);
      expect(cardAgentId, 'Result card should link to an agent profile').not.toBeNull();
      expect(
        await listingDetail.agent.getProfileId(),
        'Listing page should link to the same agent profile as the result card',
      ).toBe(cardAgentId);
    });

    test('Should render the agency branding and both profile links', async ({ listingDetail }) => {
      await expect(listingDetail.agent.logo, 'Agency logo should be visible').toBeVisible();
      await expect(
        listingDetail.agent.logo,
        'Agency logo should have a source',
      ).toHaveAttribute('src', /\S/);

      const profileId = await listingDetail.agent.getProfileId();
      expect(profileId, 'Agency name should link to an agent profile').not.toBeNull();
      await expect(
        listingDetail.agent.logoLink,
        'Logo should link to the same profile as the agency name',
      ).toHaveAttribute('href', new RegExp(`/makelaar/${profileId}$`));

      await expect(
        listingDetail.agent.profileLink,
        'Agency name should be rendered',
      ).toHaveText(/\S/);
    });

    test('Should reveal the agent phone number on request', async ({ listingDetail }) => {
      await expect(
        listingDetail.agent.showPhoneNumberButton,
        'Phone number should start hidden behind a reveal control',
      ).toBeVisible();
      await expect(listingDetail.agent.phoneLink).toBeHidden();

      await listingDetail.agent.revealPhoneNumber();

      await expect(
        listingDetail.agent.phoneLink,
        'Phone number should become visible after revealing it',
      ).toBeVisible();
      await expect(
        listingDetail.agent.phoneLink,
        'The phone link should contain a dialable number',
      ).toHaveAttribute('href', /^tel:[\d\s()+-]+$/);
    });

    test('Should offer a viewing request call for this listing', async ({ listingDetail }) => {
      const globalId = await listingDetail.getGlobalId();
      expect(globalId, 'Listing should carry a global id').not.toBeNull();

      await expect(
        listingDetail.agent.requestViewingLink,
        'Viewing request call to action should be visible',
      ).toBeVisible();
      await expect(
        listingDetail.agent.requestViewingLink,
        'Viewing request call to action should have a label',
      ).toHaveText(/\S/);
      await expect(
        listingDetail.agent.requestViewingLink,
        'Viewing request should reference the listing being viewed and open the viewing flow',
      ).toHaveAttribute(
        'href',
        `https://www.funda.nl/makelaar-contact/?listingId=${globalId}&viewingRequest=true`,
      );

      // Asserted, never clicked.
    });
  });
}
