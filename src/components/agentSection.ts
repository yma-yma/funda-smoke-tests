import type { Locator } from '@playwright/test';
import { agentProfileId } from '../utils';

export class AgentSection {
  readonly logoLink: Locator;
  readonly logo: Locator;
  readonly profileLink: Locator;
  readonly showPhoneNumberButton: Locator;
  readonly phoneLink: Locator;
  readonly contactLink: Locator;
  readonly requestViewingLink: Locator;

  constructor(locator: Locator) {
    this.logoLink = locator.locator('section a[href*="/makelaar/"]');
    this.logo = this.logoLink.locator('img');
    this.profileLink = locator.locator('h3 > a[href*="/makelaar/"]');
    this.showPhoneNumberButton = locator.getByText('Toon telefoonnummer');
    this.phoneLink = locator.locator('a[href^="tel:"]:not([data-optimizely="contact-phone"])');
    this.contactLink = locator.locator('a[data-optimizely="contact-email"]');
    this.requestViewingLink = locator.locator('a[data-optimizely="contact-request-viewing"]');
  }

  async revealPhoneNumber(): Promise<void> {
    await this.showPhoneNumberButton.click();
  }

  async getProfileId(): Promise<string | null> {
    return agentProfileId(await this.profileLink.getAttribute('href'));
  }

  async getProfileName(): Promise<string> {
    const title = await this.profileLink.getAttribute('title');
    return (title ?? (await this.profileLink.innerText())).trim();
  }
}