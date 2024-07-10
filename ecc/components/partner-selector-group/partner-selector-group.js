import { LIBS } from '../../scripts/scripts.js';
import { style } from './partner-selector-group.css.js';

const { LitElement, html, repeat, nothing } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class PartnerSelectorGroup extends LitElement {
  static properties = {
    partners: { type: Array },
    fieldlabels: { type: Object },
    seriesId: { type: String },
  };

  constructor() {
    super();
    this.partners = this.partners || [[]];
  }

  static styles = style;

  addPartner() {
    this.partners = [...this.partners, {}];
  }

  deletePartner(index) {
    this.partners = this.partners.filter((_, i) => i !== index);
    this.requestUpdate();
  }

  handlePartnerUpdate(event, index) {
    const updatedPartner = event.detail.partner;
    this.partners = this.partners
      .map((partner, i) => (i === index ? updatedPartner : partner));
  }

  getSavedPartners() {
    return this.partners.filter((p) => p.sponsorId).map((partner) => {
      const { sponsorId, name, link } = partner;

      const data = {
        sponsorId,
        name,
        link,
        sponsorType: 'Partner',
      };

      return data;
    });
  }

  render() {
    const imageTag = this.fieldlabels.image;
    imageTag.setAttribute('slot', 'img-label');
    imageTag.classList.add('img-upload-text');

    return html`
      ${repeat(this.partners, (partner, index) => {
    const imgTag = imageTag.cloneNode(true);
    return html`
        <partner-selector .seriesId=${this.seriesId} .fieldLabels=${this.fieldlabels} .partner=${partner}
          @update-partner=${(event) => this.handlePartnerUpdate(event, index)}>
          <div slot="delete-btn" class="delete-btn">
            ${this.partners.length > 1 ? html`
              <img class="icon icon-remove-circle" src="/ecc/icons/remove-circle.svg" alt="remove-repeater" @click=${() => this.deletePartner(index)}></img>
            ` : nothing}
          </div>
          ${imgTag}
        </partner-selector>

      ${index < this.partners.length - 1 ? html`<sp-divider size='s'></sp-divider>` : nothing}
      `;
  })}
      <repeater-element text="Add partner" @repeat=${this.addPartner}></repeater-element>
    `;
  }
}
