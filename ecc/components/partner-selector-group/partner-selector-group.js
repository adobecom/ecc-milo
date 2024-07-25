import { LIBS } from '../../scripts/scripts.js';
import { style } from './partner-selector-group.css.js';

const { LitElement, html, repeat, nothing } = await import(`${LIBS}/deps/lit-all.min.js`);

const defaultPartner = {};

export default class PartnerSelectorGroup extends LitElement {
  static properties = {
    seriesSponsors: { type: Array },
    partners: { type: Array },
    fieldlabels: { type: Object },
    seriesId: { type: String },
  };

  constructor() {
    super();
    this.seriesSponsors = this.seriesSponsors || [];
    this.partners = this.partners || [defaultPartner];
  }

  static styles = style;

  addPartner() {
    this.partners = [...this.partners, {}];
  }

  deletePartner(index) {
    this.partners = this.partners.filter((_, i) => i !== index);
    if (this.partners.length === 0) {
      this.partners = [defaultPartner];
    }
    this.requestUpdate();
  }

  handlePartnerUpdate(event, index) {
    const updatedPartner = event.detail.partner;
    this.partners = this.partners
      .map((partner, i) => (i === index ? updatedPartner : partner));

    this.requestUpdate();
  }

  getSavedPartners() {
    return this.partners.filter((p) => p.sponsorId).map((partner) => {
      const { sponsorId, name, link, hasUnsavedChanges } = partner;

      const data = {
        hasUnsavedChanges,
        sponsorId,
        name,
        link,
        sponsorType: 'Partner',
      };

      return data;
    });
  }

  hasOnlyOneUnsavedPartnerLeft() {
    const hasOnePartner = this.partners.length === 1;
    const isUnsaved = !this.partners[0].sponsorId;
    return hasOnePartner && isUnsaved;
  }

  render() {
    const imageTag = this.fieldlabels.image;
    imageTag.setAttribute('slot', 'img-label');
    imageTag.classList.add('img-upload-text');

    return html`
      ${repeat(this.partners, (partner, index) => {
    const imgTag = imageTag.cloneNode(true);
    return html`
        <partner-selector .seriesPartners=${this.seriesSponsors} .seriesId=${this.seriesId} .fieldLabels=${this.fieldlabels} .partner=${partner}
          @update-partner=${(event) => this.handlePartnerUpdate(event, index)}>
          <div slot="delete-btn" class="delete-btn">
            ${this.hasOnlyOneUnsavedPartnerLeft() ? nothing : html`
              <img class="icon icon-remove-circle" src="/ecc/icons/remove-circle.svg" alt="remove-repeater" @click=${() => this.deletePartner(index)}></img>
            `}
          </div>
          ${imgTag}
        </partner-selector>

      ${index < this.partners.length - 1 ? html`<sp-divider size='s'></sp-divider>` : nothing}
      `;
  })}
      ${this.partners.every((partner) => !partner.hasUnsavedChanges && partner.sponsorId) ? html`<repeater-element text="Add partner" @repeat=${this.addPartner}></repeater-element>` : nothing}
    `;
  }
}
