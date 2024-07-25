import { LIBS } from '../../scripts/scripts.js';
import { style } from './partner-selector.css.js';
import { createSponsor, deleteImage, updateSponsor, uploadImage } from '../../scripts/esp-controller.js';
import { LINK_REGEX } from '../../constants/constants.js';

const { LitElement, html } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class PartnerSelector extends LitElement {
  static properties = {
    seriesPartners: { type: Array },
    partner: { type: Object },
    fieldLabels: { type: Object },
    seriesId: { type: String },
  };

  constructor() {
    super();
    this.partner = this.partner || {
      name: '',
      link: '',
      photo: null,
      hasUnsavedChanges: false,
    };
  }

  static styles = style;

  getRequiredProps() {
    const nameFieldData = {
      value: this.partner.name,
      placeholder: 'Enter partner name',
    };

    const searchMap = [{ searchKey: 'name', renderKey: 'name' }];
    return { searchMap, nameFieldData };
  }

  firstUpdated() {
    const saveButton = this.shadowRoot.querySelector('.save-partner-button');
    this.imageDropzone = this.shadowRoot.querySelector('image-dropzone');
    this.imageDropzone.addEventListener('image-change', (e) => {
      this.partner.hasUnsavedChanges = true;
      this.partner.photo = e.detail.file;
      if (saveButton) saveButton.textContent = 'Save partner';
      this.requestUpdate();
    });
    this.checkValidity();
  }

  updatePartner(newData) {
    this.partner.hasUnsavedChanges = true;
    const saveButton = this.shadowRoot.querySelector('.save-partner-button');
    if (saveButton) saveButton.textContent = 'Save Partner';

    this.partner = { ...this.partner, ...newData };

    this.dispatchEvent(new CustomEvent('update-partner', {
      detail: { partner: this.partner },
      bubbles: true,
      composed: true,
    }));
  }

  selectSeriesPartner(partner) {
    this.partner.hasUnsavedChanges = false;
    const saveButton = this.shadowRoot.querySelector('.save-partner-button');
    if (saveButton) saveButton.textContent = 'Saved';

    this.partner = partner;
    if (partner.image) this.partner.photo = { ...partner.image, url: partner.image.imageUrl };

    this.dispatchEvent(new CustomEvent('update-partner', {
      detail: { partner: this.partner },
      bubbles: true,
      composed: true,
    }));
  }

  isSaved() {
    return this.partner.sponsorId && !this.partner.hasUnsavedChanges;
  }

  checkValidity() {
    return this.partner.name?.length >= 3 && this.partner.link?.match(LINK_REGEX);
  }

  filterSeriesPartners(name) {
    const lcn = name.toLowerCase();
    this.seriesPartners = this.seriesPartners.filter((partner) => {
      const lcp = partner.name.toLowerCase();
      return lcp.includes(lcn) && lcp !== lcn;
    });
  }

  async savePartner(e) {
    const saveButton = e.target;
    let respJson;

    saveButton.pending = true;

    const payload = {
      name: this.partner.name,
      link: this.partner.link,
      sponsorId: this.partner.sponsorId,
      modificationTime: this.partner.modificationTime,
    };

    if (!this.partner.sponsorId) {
      respJson = await createSponsor(payload, this.seriesId);
    } else {
      respJson = await updateSponsor(payload, this.partner.sponsorId, this.seriesId);
    }

    if (respJson.sponsorId) {
      this.partner.sponsorId = respJson.sponsorId;
      this.partner.modificationTime = respJson.modificationTime;
      const file = this.imageDropzone?.getFile();

      if (file && (file instanceof File)) {
        const sponsorData = await uploadImage(file, {
          targetUrl: `/v1/series/${this.seriesId}/sponsors/${this.partner.sponsorId}/images`,
          type: 'sponsor-image',
          altText: `${this.partner.name} image`,
        }, null, respJson.image?.imageId);

        if (sponsorData) {
          this.partner.modificationTime = sponsorData.modificationTime;
        }
      } else if (!file && respJson.image?.imageId) {
        try {
          const resp = await deleteImage({ targetUrl: `/v1/series/${this.seriesId}/sponsors/${this.partner.sponsorId}/images` }, respJson.image?.imageId);
          if (resp.errors || resp.message) {
            this.dispatchEvent(new CustomEvent('show-error-toast', { detail: { message: 'Failed to delete the image. Please try again later.' }, bubbles: true, composed: true }));
          } else {
            this.partner.hasUnsavedChanges = false;
          }
        } catch (error) {
          this.dispatchEvent(new CustomEvent('show-error-toast', { detail: { message: 'Failed to delete the image. Please try again later.' }, bubbles: true, composed: true }));
        }
      }

      this.partner.hasUnsavedChanges = false;
      this.requestUpdate();
    }

    saveButton.pending = false;
  }

  handleAutocomplete(e) {
    const partner = { ...e.detail.data };
    this.selectSeriesPartner(partner);
  }

  render() {
    const { nameFieldData, searchMap } = this.getRequiredProps();
    return html`
      <fieldset class="partner-field-wrapper">
      <div>
        <div class="partner-input-wrapper">
          <image-dropzone .file=${this.partner.photo}>
        <slot name="img-label" slot="img-label"></slot>
          </image-dropzone>
          <div>
            <div class="partner-input">
              <label>${this.fieldLabels.nameLabelText}</label>
              <custom-search searchMap=${JSON.stringify(searchMap)} data=${JSON.stringify(nameFieldData)} config=${JSON.stringify({})} @change-custom-search=${(event) => {
  this.updatePartner({ name: event.detail.value });
}} @entry-selected=${this.handleAutocomplete} searchdata=${JSON.stringify(this.seriesPartners)} identifier='sponsorId'></custom-search>
            </div>
            <div class="partner-input">
              <label>${this.fieldLabels.urlLabelText}</label>
              <sp-textfield pattern=${LINK_REGEX} value=${this.partner.link} placeholder="Enter partner full URL", @change=${(event) => {
  this.updatePartner({ link: event.target.value });
}}></sp-textfield>
            </div>
          </div>
        </div>
      </div>
      <div class="action-area">
        <sp-button variant="primary" ?disabled=${!this.checkValidity() || !this.partner.hasUnsavedChanges} class="save-partner-button" @click=${this.savePartner}>
        ${this.isSaved() ? 'Saved' : 'Save partner'}</sp-button>
        <slot name="delete-btn"></slot>
        </div>
      </fieldset>
    `;
  }
}
