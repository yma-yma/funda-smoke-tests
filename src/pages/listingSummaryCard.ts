import type { Locator } from '@playwright/test';
import { ListingSummary } from './types';

export class ListingSummaryCard {
  readonly detailLink: Locator;
  readonly street: Locator;
  readonly postalCodeAndCity: Locator;
  readonly price: Locator;
  readonly agentName: Locator;
  readonly agentLink: Locator;

  constructor(root: Locator) {
    this.detailLink = root.locator('a[href*="/detail/"]:has(span.truncate)');
    this.street = this.detailLink.locator('span.truncate');
    this.postalCodeAndCity = this.detailLink.locator('div.truncate');
    this.price = root.locator('.font-semibold > div.truncate');
    this.agentLink = root.locator('a[href*="/makelaar/"]');
    this.agentName = this.agentLink.or(root.locator('p.truncate > span'));
  }

  async getSummary(): Promise<ListingSummary> {
    return {
      street: (await this.street.innerText()).trim(),
      postalCodeAndCity: (await this.postalCodeAndCity.innerText()).trim(),
      price: (await this.price.innerText()).trim(),
      agent: (await this.agentName.innerText()).trim(),
    };
  }
}
