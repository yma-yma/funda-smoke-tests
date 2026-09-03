import type { Locator, Page } from '@playwright/test';
import { AgentSection } from '../components/agentSection';
import { AgentContactForm } from '../components/agentContactForm';

export class AgentContactPage {
  private readonly page: Page;
  readonly heading: Locator;
  readonly listingSummary: Locator;
  readonly listingLink: Locator;
  readonly form: AgentContactForm;
  readonly agent: AgentSection;
  /* Provisional: the success state has never been observed, because submitting
     would put a real enquiry in an agent's inbox. */
  readonly confirmationMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = this.page.locator('#main-content').getByRole('heading', { level: 1 });
    this.listingSummary = this.page.getByTestId('listing-detail-card-container');
    this.listingLink = this.listingSummary.locator('a[href*="/detail/"]:has(span)');
    this.form = new AgentContactForm(this.page.locator('form'));
    this.agent = new AgentSection(this.page.getByTestId('contact-block-container'));
    this.confirmationMessage = this.page.getByText('Uw bericht is verzonden');
  }
}