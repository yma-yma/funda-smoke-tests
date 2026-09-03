import { expect, test } from '../../src/fixture/base';

test.describe('Main page on mobile', () => {
  test('Validate visually main page for layout', async ({ page, home }) => {
    await home.openMainPage();

    await expect(page).toHaveScreenshot({
      animations: 'disabled',
      mask: [page.locator('[role="complementary"]')],
    });
  });
});