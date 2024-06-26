import { getLibs } from '../../scripts/utils.js';
import { isEmptyObject } from '../../utils/utils.js';
import { style } from './partner-selector-group.css.js';

const { LitElement, html, repeat, nothing } = await import(`${getLibs()}/deps/lit-all.min.js`);

export default class PartnerSelectorGroup extends LitElement {
  static properties = {
    selectedPartners: { type: Array },
    fieldlabels: { type: Object },
  };

  constructor() {
    super();
    this.selectedPartners = this.selectedPartners || [[]];
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
    return this.selectedPartners.filter((p) => p.hasRequiredAttributes());
  }

  render() {
    const imageTag = this.fieldlabels.image;
    imageTag.setAttribute('slot', 'img-label');
    imageTag.classList.add('img-upload-text');

    return html`
      ${repeat(this.selectedPartners, (partner, index) => {
    const imgTag = imageTag.cloneNode(true);
    return html`
        <partner-selector .fieldLabels=${this.fieldlabels} .selectedPartner=${partner}
          @update-partner=${(event) => this.handlePartnerUpdate(event, index)}>
          <div slot="delete-btn" class="delete-btn">
            ${this.selectedPartners.length > 1 ? html`
              <img class="icon icon-remove-circle" src="/ecc/icons/remove-circle.svg" alt="remove-repeater" @click=${() => this.deletePartner(index)}></img>
            ` : nothing}
          </div>
          ${imgTag}
        </partner-selector>

      ${index < this.selectedPartners.length - 1 ? html`<sp-divider size='s'></sp-divider>` : nothing}
      `;
  })}
      <repeater-element text="Add partner" @repeat=${this.addPartner}></repeater-element>
    `;
  }
}
