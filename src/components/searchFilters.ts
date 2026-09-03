import { test, type Locator, type Page } from '@playwright/test';

export class SearchFilters {
  readonly panel: Locator;
  readonly priceFrom: Locator;
  readonly priceTo: Locator;
  readonly floorAreaFrom: Locator;
  readonly floorAreaTo: Locator;
  readonly applyButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.panel = page.getByRole('dialog');
    this.priceFrom = this.panel.locator('#price_from');
    this.priceTo = this.panel.locator('#price_to');
    this.floorAreaFrom = this.panel.locator('#floor_area_from');
    this.floorAreaTo = this.panel.locator('#floor_area_to');
    this.applyButton = this.panel.getByTestId('FilterPanelFooterButton');
    this.closeButton = this.panel.getByRole('button', { name: 'Sluiten' });
  }

  getObjectType(type: string): Locator {
    return this.panel.locator(`#checkbox-object_type-${type}`);
  }

  async getPromisedResultCount(): Promise<number> {
    return await test.step('Get the result count promised on the apply button', async () => {
      const text = await this.applyButton.innerText();
      return Number(text.match(/[\d.]+/)?.[0].replace(/\./g, '') ?? '0');
    });
  }

  async clickApply(): Promise<void> {
    await test.step('Apply the selected filters', async () => {
      await this.applyButton.click();
    });
  }
}
