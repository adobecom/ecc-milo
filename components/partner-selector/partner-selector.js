import { getLibs } from '../../scripts/utils.js';
import { style } from './partner-selector.css.js';

const { LitElement, html } = await import(`${getLibs()}/deps/lit-all.min.js`);

export default class PartnerSelector extends LitElement {
  static properties = {
    partners: { type: Array },
    selectedPartner: { type: Object },
  };

  constructor() {
    super();
    this.partners = JSON.parse(this.dataset.partners);
    this.selectedPartner = {
      showPartnerLink: false,
      name: '[Partner name]',
      imageUrl: '/icons/partner-icon-placeholder.svg',
    };
  }

  static styles = style;

  handleSelectChange(event) {
    const partnerName = event.target.value;
    this.selectedPartner = {
      ...this.selectedPartner,
      ...this.partners.find((partner) => partner.name === partnerName),
    };
    this.requestUpdate();
  }

  handleCheckChange(event) {
    const showPartnerLink = event.target.checked;
    this.selectedPartner = {
      ...this.selectedPartner,
      showPartnerLink,
    };
    this.requestUpdate();
  }

  getSelectedPartner() {
    return this.selectedPartner;
  }

  render() {
    return html`
      <fieldset class="rsvp-field-wrapper">
        ${html`<img class="partner-img" src="${this.selectedPartner.imageUrl}" alt="${this.selectedPartner.name}">`}  
        <sp-picker class="partner-select-input" label="Select a partner" @change="${this.handleSelectChange}">
          ${this.partners.map((partner) => html`<sp-menu-item value="${partner.name}">${partner.name}</sp-menu-item>`)}
        </sp-picker>
        ${html`<sp-checkbox class="checkbox-partner-link" @change="${this.handleCheckChange}">Link to ${this.selectedPartner.name}</sp-checkbox>`}
      </fieldset>
    `;
  }
}
