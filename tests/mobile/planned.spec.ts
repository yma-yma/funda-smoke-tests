import { test } from '../../src/fixture/base';

// Planned mobile coverage, not implemented.

test.describe('Planned mobile coverage', () => {
  test.fixme('Should open the navigation menu from the hamburger button', async () => {});
  test.fixme('Should close the navigation menu again', async () => {});
 
  test.describe('Search results', () => {
    test.describe('List view', () => {
      test.fixme('Should return a non-empty set of results', async () => {});
      test.fixme('Should offer the controls needed to refine the search', async () => {});
      test.fixme(
        'Should display proper address, price, and agent information on every card',
        async () => {},
      );
      test.fixme('Should render the "Toppositie" placement alongside results', async () => {});
      test.fixme('Should load a different set of results on the next page', async () => {});
      test.fixme('Should open a listing detail page when a result is clicked', async () => {});
    });

    test.describe('Map view', () => {
      test.fixme('Should render the map for the same search', async () => {});
    });
  });

  test.describe('Search result filters', () => {
    test.fixme('Should return only houses within the selected price range', async () => {});
  });

  test.describe('Agent contact form', () => {
    test.fixme('Should open for the listing being viewed', async () => {});
    test.fixme('Should describe the listing the enquiry is about', async () => {});
    test.fixme('Should present a complete enquiry form', async () => {});
    test.fixme(
      'Should offer viewing preferences only on the viewing request form',
      async () => {},
    );
    test.fixme('Should submit the form and confirm it was sent', async () => {});
  });
});
