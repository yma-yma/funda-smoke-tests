import { test, type Locator } from '@playwright/test';
import type { ViewingPreference } from '../pages/types';

export class AgentContactForm {
  private readonly root: Locator;
  readonly viewingRequestCheckbox: Locator;
  readonly viewingPreferenceCheckboxes: Locator;
  readonly messageInput: Locator;
  readonly emailInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly phoneInput: Locator;
  readonly postCodeInput: Locator;
  readonly houseNumberInput: Locator;
  readonly additionInput: Locator;
  readonly sellingCurrentHouse: Locator;
  readonly financialConsultation: Locator;
  readonly movingTimeframe: Locator;
  readonly mortgageAdvice: Locator;
  readonly submitButton: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.viewingRequestCheckbox = root.locator('#checkbox-viewingRequest');
    this.viewingPreferenceCheckboxes = root.locator('input[id^="checkbox-"]');
    this.messageInput = root.locator('#questionInput');
    this.emailInput = root.locator('#emailAddress');
    this.firstNameInput = root.locator('#firstName');
    this.lastNameInput = root.locator('#lastName');
    this.phoneInput = root.locator('#phoneNumber');
    this.postCodeInput = root.locator('#postCode');
    this.houseNumberInput = root.locator('#houseNumber');
    this.additionInput = root.locator('#addition');
    this.sellingCurrentHouse = root.locator('#sellingCurrentHouseItems');
    this.financialConsultation = root.locator('#financialConsultationItems');
    this.movingTimeframe = root.locator('#movingTimeframe');
    this.mortgageAdvice = root.locator('#mortgageAdviceRadio');
    this.submitButton = root.locator('button[type="submit"]');
  }

  /** Intentionally not implemented: submitting sends a real request to an
   *  estate agent. Throws error rather than doing nothing, so it can never pass
   *  silently. */
  async clickSubmit(): Promise<never> {
    return await test.step('Submit the enquiry form to the estate agent', async () => {
      // originally should be await this.submitButton.click();
      throw new Error('Not implemented on purpose — see the skipped test in agentContact.spec.ts.');
    });
  }

  getViewingPreference(label: ViewingPreference): Locator {
    return this.root.getByRole('checkbox', { name: label, exact: true });
  }

  async chooseViewingPreference(label: ViewingPreference): Promise<void> {
    await test.step(`Choose viewing preference ${label}`, async () => {
      await this.getViewingPreference(label).check();
    });
  }
}