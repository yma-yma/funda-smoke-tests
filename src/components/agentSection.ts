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

  constructor(root: Locator) {
    this.logoLink = root.locator('section a[href*="/makelaar/"]');
    this.logo = this.logoLink.locator('img');
    this.profileLink = root.locator('h3 > a[href*="/makelaar/"]');
    this.showPhoneNumberButton = root.getByText('Toon telefoonnummer');
    this.phoneLink = root.locator('a[href^="tel:"]:not([data-optimizely="contact-phone"])');
    this.contactLink = root.locator('a[data-optimizely="contact-email"]');
    this.requestViewingLink = root.locator('a[data-optimizely="contact-request-viewing"]');
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
