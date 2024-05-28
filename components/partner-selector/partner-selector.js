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
    this.selectedPartner = null;
  }

  static styles = style;

  handleSelectChange(event) {
    const partnerName = event.target.value;
    this.selectedPartner = this.partners.find((partner) => partner.name === partnerName);
    this.requestUpdate();
  }

  render() {
    return html`
      <fieldset class="rsvp-field-wrapper">
        ${this.selectedPartner ? html`<img class="partner-img" src="${this.selectedPartner.imageUrl}" alt="${this.selectedPartner.name}">` : html`<img class="partner-img">`}  
        <sp-picker class="partner-select-input" label="Select a partner" @change="${this.handleSelectChange}">
          ${this.partners.map((partner) => html`<sp-menu-item value="${partner.name}">${partner.name}</sp-menu-item>`)}
        </sp-picker>
        ${this.selectedPartner ? html`<sp-checkbox class="checkbox-partner-link">Link to ${this.selectedPartner.name}</sp-checkbox>` : html`<sp-checkbox class="checkbox-partner-link">Link to [Partner name]</sp-checkbox>`}
      </fieldset>
    `;
  }
}
