import { getLibs } from '../../scripts/utils.js';
import { style } from './partner-selector-group.css.js';

const { LitElement, html, repeat, nothing } = await import(`${getLibs()}/deps/lit-all.min.js`);

export default class PartnerSelectorGroup extends LitElement {
  static properties = {
    selectedPartners: { type: Array },
    partners: { type: Array },
  };

  constructor() {
    super();
    this.selectedPartners = this.selectedPartners || [{
      showPartnerLink: false,
      name: '[Partner name]',
      imageUrl: '/icons/icon-placeholder.svg',
    }];
    this.partners = JSON.parse(this.dataset.partners);
  }

  static styles = style;

  addPartner() {
    this.selectedPartners = [...this.selectedPartners, {}];
  }

  deletePartner(index) {
    this.selectedPartners = this.selectedPartners.filter((_, i) => i !== index);
    this.requestUpdate();
  }

  handlePartnerUpdate(event, index) {
    const updatedPartner = event.detail.partner;
    this.selectedPartners = this.selectedPartners
      .map((Partner, i) => (i === index ? updatedPartner : Partner));
  }

  getSelectedPartners() {
    return this.selectedPartners;
  }

  render() {
    return html`
      ${repeat(this.selectedPartners, (partner, index) => html`
        <partner-selector .selectedPartner=${partner} .partners=${this.partners}
          @update-partner=${(event) => this.handlePartnerUpdate(event, index)}>
          <div slot="delete-btn" class="delete-btn">
            ${this.selectedPartners.length > 1 ? html`
              <img class="icon icon-remove-circle" src="/icons/remove-circle.svg" alt="remove-repeater" @click=${() => this.deletePartner(index)}></img>
            ` : nothing}
          </div>
        </partner-selector>
      `)}
      <repeater-element text="Add partner" @repeat=${this.addPartner}></repeater-element>
    `;
  }
}
