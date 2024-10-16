import { getSponsors } from '../../scripts/esp-controller.js';
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

  reloadSeriesSponsors = async () => {
    const spResp = await getSponsors(this.seriesId);
    if (spResp) this.seriesSponsors = spResp.sponsors;
  };

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

  handlePartnerUpdate(updatedPartner, index) {
    this.partners = this.partners
      .map((partner, i) => (i === index ? updatedPartner : partner));
    this.reloadSeriesSponsors();
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

  handlePartnerSelect(partner, index) {
    const selectedParner = this.seriesSponsors.find((sponsor) => sponsor.sponsorId === partner.id);

    if (selectedParner.image) {
      selectedParner.photo = { ...selectedParner.image, url: selectedParner.image.imageUrl };
    }

    const updatedPartner = { ...selectedParner, hasUnsavedChanges: partner.hasUnsavedChanges };
    this.handlePartnerUpdate(updatedPartner, index);
  }

  getSeriesPartners() {
    const seriesPartners = this.seriesSponsors.filter((sponsor) => {
      if (this.partners.find((p) => p.sponsorId === sponsor.sponsorId) !== undefined) {
        return false;
      }
      return true;
    }).map((sponsor) => ({
      id: sponsor.sponsorId,
      value: sponsor.name,
      image: sponsor?.image?.imageUrl,
      displayValue: sponsor.name,
    }));

    return seriesPartners;
  }

  render() {
    const imageTag = this.fieldlabels.image;
    imageTag.setAttribute('slot', 'img-label');
    imageTag.classList.add('img-upload-text');

    return html`
      ${repeat(this.partners, (partner, index) => {
    const imgTag = imageTag.cloneNode(true);
    return html`
        <partner-selector .seriesPartners=${this.getSeriesPartners()} .seriesId=${this.seriesId} .fieldLabels=${this.fieldlabels} .partner=${partner}
          @update-partner=${(event) => this.handlePartnerUpdate(event.detail.partner, index)} @select-partner=${(event) => this.handlePartnerSelect(event.detail.partner, index)}>
          <div slot="delete-btn" class="delete-btn">
            ${this.hasOnlyOneUnsavedPartnerLeft() ? nothing : html`
              <img class="icon icon-remove-circle" src="${this.partners.length === 1 ? '/ecc/icons/delete.svg' : '/ecc/icons/remove-circle.svg'}" alt="remove-repeater" @click=${() => this.deletePartner(index)}></img>
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
