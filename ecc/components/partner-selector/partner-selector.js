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
    buttonStatePending: { type: Boolean },
  };

  constructor() {
    super();
    this.partner = this.partner || {
      name: '',
      link: '',
      photo: null,
      hasUnsavedChanges: false,
    };
    this.buttonStatePending = false;
  }

  static styles = style;

  getRequiredProps() {
    const nameFieldData = {
      value: this.partner.name,
      placeholder: 'Enter partner name',
    };

    const searchMap = { searchKeys: ['name'], renderKeys: ['name'] };
    return { searchMap, nameFieldData };
  }

  updatePartner(newData) {
    const partner = { ...this.partner, ...newData, hasUnsavedChanges: true };

    this.dispatchEvent(new CustomEvent('update-partner', { detail: { partner } }));
  }

  selectSeriesPartner(partner) {
    partner.hasUnsavedChanges = false;
    this.dispatchEvent(new CustomEvent('select-partner', { detail: { partner } }));
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

  async savePartner() {
    let respJson;
    this.buttonStatePending = true;
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
      const imageDropzone = this.shadowRoot.querySelector('image-dropzone');
      this.partner.sponsorId = respJson.sponsorId;
      this.partner.modificationTime = respJson.modificationTime;
      const file = imageDropzone?.getFile();

      if (file && (file instanceof File)) {
        const sponsorData = await uploadImage(file, {
          targetUrl: `/v1/series/${this.seriesId}/sponsors/${this.partner.sponsorId}/images`,
          type: 'sponsor-image',
          altText: `${this.partner.name} image`,
        }, null, respJson.image?.imageId);

        if (sponsorData) {
          if (sponsorData.error) {
            this.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: { message: 'Failed to updated the image. Please try again later.' } }, bubbles: true, composed: true }));
          }

          if (sponsorData.modificationTime) {
            this.partner.modificationTime = sponsorData.modificationTime;
          }
        }
      } else if (!file && respJson.image?.imageId) {
        try {
          const resp = await deleteImage({ targetUrl: `/v1/series/${this.seriesId}/sponsors/${this.partner.sponsorId}/images` }, respJson.image?.imageId);
          if (resp.error) {
            this.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: { message: 'Failed to delete the image. Please try again later.' } }, bubbles: true, composed: true }));
          } else {
            this.partner.hasUnsavedChanges = false;
            this.partner.modificationTime = resp.modificationTime;
          }
        } catch (error) {
          this.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: { message: 'Failed to delete the image. Please try again later.' } }, bubbles: true, composed: true }));
        }
      }

      this.partner.hasUnsavedChanges = false;
      this.dispatchEvent(new CustomEvent('update-partner', { detail: { partner: this.partner } }));
      this.dispatchEvent(new CustomEvent('show-success-toast', { detail: { message: 'Partner saved successfully' }, bubbles: true, composed: true }));
      this.buttonStatePending = false;
      this.requestUpdate();
    }
  }

  handleAutocomplete(e) {
    const partner = { ...e.detail.entryData };
    this.selectSeriesPartner(partner);
  }

  handleImageChange(e) {
    this.partner.hasUnsavedChanges = true;
    this.partner.photo = e.detail.file;

    this.requestUpdate();
  }

  render() {
    const { nameFieldData } = this.getRequiredProps();
    return html`
      <fieldset class="partner-field-wrapper">
      <div>
        <div class="partner-input-wrapper">
          <image-dropzone .file=${this.partner.photo} @image-change=${this.handleImageChange}>
        <slot name="img-label" slot="img-label"></slot>
          </image-dropzone>
          <div>
            <div class="partner-input">
              <label>${this.fieldLabels.nameLabelText}</label>
              <custom-search fielddata=${JSON.stringify(nameFieldData)} config=${JSON.stringify({ showImage: true })} @change-custom-search=${(event) => {
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
        <sp-button variant="primary" ?pending=${this.buttonStatePending} ?disabled=${!this.checkValidity() || !this.partner.hasUnsavedChanges} class="save-partner-button" @click=${this.savePartner}>
        ${this.isSaved() ? 'Saved' : 'Save partner'}</sp-button>
        <slot name="delete-btn"></slot>
        </div>
      </fieldset>
    `;
  }
}
