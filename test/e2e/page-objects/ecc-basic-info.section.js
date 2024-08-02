import { Section } from '@amwp/platform-ui-automation/lib/common/page-objects/section';

export class ECCBasicInfoSection extends Section {
  constructor() {
    super();
    this.buildProps({
      eventFormatCard: '//h2[contains(text(),"Event format")]',
      eventInformationCard: '//h2[contains(text(),"Event information")]',
      eventTitle: '#info-field-event-title input',
      eventDescription: '#info-field-event-description textarea',
      agendaDetails: 'sp-textfield input[aria-label="Add Agenda details"]',
      venueName: '#venue-info-venue-name input'
    });
  }

  async selectDropdownOption(label, option, shadowRoot = false) {
    const dropdown = `.select-input[label="${label}"]`;
    const dropdownOption = `//sp-menu-item[contains(text(),"${option}")] >> visible=true`;

    await this.native.waitForTimeout(1000);
    await this.native.locator(dropdown).waitFor({ timeout: 3000 });
    await this.native.locator(dropdown).click();
    await this.native.locator(dropdownOption).waitFor({timeout: 2000 });
    await this.native.locator(dropdownOption).click();
  }

  async selectFutureDate() {
    let datePicker = '.date-picker input';
    let calendarContainer = '.calendar-container';
    let calendarDay = `.calendar-grid .calendar-day:not(.disabled):not(.empty)`;

    await this.native.locator(datePicker).click({ force: true });
    await this.native.locator(calendarContainer).waitFor({ timeout: 1000 });
    await this.native.locator(calendarDay).first().click({ force: true });
  }

  async selectTime(label, option) {
    const dropdown = `//label[contains(text(),"${label}")]/following-sibling::sp-picker`;
    const dropdownOption = `//sp-menu-item[./text()="${option}"] >> visible=true`;

    await this.native.waitForTimeout(1000);
    await this.native.locator(dropdown).waitFor({ timeout: 3000 });
    await this.native.locator(dropdown).click();
    await this.native.locator(dropdownOption).waitFor({timeout: 2000 });
    await this.native.locator(dropdownOption).click();
  }

  async selectAgendaTime(option) {
    const dropdown = `.agenda-input-fields-row button`;
    // const dropdownOption = `//div[contains(@class, 'agenda-input-fields-row')]//sp-menu-item[contains(text(),"${option}")]`;
    const dropdownOption = `.agenda-input-fields-row sp-menu-item`;

    await this.native.waitForTimeout(1000);
    await this.native.locator(dropdown).waitFor({ timeout: 3000 });
    await this.native.locator(dropdown).click();

    let timeOptions = await this.native.locator(dropdownOption).all();
    let menuItem;

    for (const time of timeOptions) {
      const text = await time.innerText();
      if (text === option) {
        menuItem = time;
        break;
      }
    }

    await this.native.waitForTimeout(1000);
    await menuItem.click();
  }
}
