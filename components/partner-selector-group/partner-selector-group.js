import { getLibs } from '../../scripts/utils.js';
import { isEmptyObject } from '../../utils/utils.js';
import { style } from './partner-selector-group.css.js';

const { LitElement, html, repeat, nothing } = await import(`${getLibs()}/deps/lit-all.min.js`);

const defaultSelectedPartners = [{
  showPartnerLink: false,
  name: '[Partner name]',
  imageUrl: '/icons/icon-placeholder.svg',
  isPlaceholder: true,
}];

export default class PartnerSelectorGroup extends LitElement {
  static properties = {
    selectedPartners: { type: Array },
    partners: { type: Array },
  };

  constructor() {
    super();
    // eslint-disable-next-line max-len
    this.selectedPartners = this.dataset.selectedPartners ? JSON.parse(this.dataset.selectedPartners) : defaultSelectedPartners;
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
    return this.selectedPartners.filter((p) => !p.isPlaceholder || !isEmptyObject(p));
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
