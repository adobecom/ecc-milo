import { getLibs } from '../../scripts/utils.js';
import { style } from './partner-selector.css.js';

const { LitElement, html } = await import(`${getLibs()}/deps/lit-all.min.js`);

export default class PartnerSelector extends LitElement {
  static properties = {
    partners: { type: Array },
    selectedPartner: { type: Object },
  };

  static styles = style;

  handleSelectChange(event) {
    const partnerName = event.target.value;
    this.selectedPartner = {
      ...this.selectedPartner,
      ...this.partners.find((partner) => partner.name === partnerName),
    };

    this.dispatchEvent(new CustomEvent('update-partner', {
      detail: { partner: this.selectedPartner },
      bubbles: true,
      composed: true,
    }));

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

  render() {
    return html`
      <fieldset class="rsvp-field-wrapper">
        ${html`<img class="partner-img" src="${this.selectedPartner.imageUrl || '/icons/icon-placeholder.svg'}" alt="${this.selectedPartner.name}">`}  
        <sp-picker value=${this.selectedPartner.name} class="partner-select-input" label="Select a partner" @change="${this.handleSelectChange}">
          ${this.partners.map((partner) => html`<sp-menu-item value="${partner.name}">${partner.name}</sp-menu-item>`)}
        </sp-picker>
        ${html`<sp-checkbox class="checkbox-partner-link" @change="${this.handleCheckChange}">Link to ${this.selectedPartner.name || '[Partner name]'}</sp-checkbox>`}
        <slot name="delete-btn"></slot>
      </fieldset>
    `;
  }
}
