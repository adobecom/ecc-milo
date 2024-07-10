import { LIBS } from '../../scripts/scripts.js';
import { style } from './partner-selector.css.js';
import { createSponsor, updateSponsor, uploadImage } from '../../scripts/esp-controller.js';

const { LitElement, html } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class PartnerSelector extends LitElement {
  static properties = {
    partner: { type: Object },
    fieldLabels: { type: Object },
    seriesId: { type: String },
  };

  constructor() {
    super();
    this.partner = {};
  }

  static styles = style;

  firstUpdated() {
    this.imageDropzone = this.shadowRoot.querySelector('image-dropzone');
  }

  updateValue(key, value) {
    this.partner = { ...this.partner, [key]: value };

    this.dispatchEvent(new CustomEvent('update-partner', {
      detail: { partner: this.partner },
      bubbles: true,
      composed: true,
    }));
  }

  async savePartner(e) {
    const imageDropzone = this.shadowRoot.querySelector('image-dropzone');
    const saveButton = e.target;
    let respJson;

    saveButton.pending = true;
    if (!this.partner.sponsorId) {
      respJson = await createSponsor(this.partner, this.seriesId);
    } else {
      respJson = await updateSponsor(this.partner, this.partner.sponsorId, this.seriesId);
    }

    if (respJson.sponsorId) {
      this.partner.sponsorId = respJson.sponsorId;
      this.partner.photo = imageDropzone?.file ? { imageUrl: imageDropzone?.file?.url } : null;
      const file = imageDropzone?.getFile();

      if (file && (file instanceof File)) {
        const speakerData = await uploadImage(file, {
          targetUrl: `/v1/series/${this.seriesId}/sponsors/${this.partner.sponsorId}/images`,
          type: 'sponsor-image',
          altText: `${this.partner.name} image`,
        });

        this.partner.modificationTime = speakerData.modificationTime;
      }

      this.requestUpdate();
    }

    saveButton.pending = false;
  }

  render() {
    return html`
      <fieldset class="partner-field-wrapper">
      <div>
        <div class="partner-input-wrapper">
          <image-dropzone .file=${this.partner.file}>
        <slot name="img-label" slot="img-label"></slot>
          </image-dropzone>
          <div>
            <div class="partner-input">
              <label>${this.fieldLabels.nameLabelText}</label>
              <sp-textfield value=${this.partner.name} @change=${(event) => {
  this.updateValue('name', event.target.value);
}}></sp-textfield>
            </div>
            <div class="partner-input">
              <label>${this.fieldLabels.urlLabelText}</label>
              <sp-textfield value=${this.partner.externalUrl} @change=${(event) => {
  this.updateValue('link', event.target.value);
}}></sp-textfield>
            </div>
          </div>
        </div>
      </div>
      <div class="action-area">
        <sp-button variant="primary" .disabled=${!this.partner.name} class="save-partner-button" @click=${this.savePartner}>Save Partner</sp-button>
        <slot name="delete-btn"></slot>
        </div>
      </fieldset>
    `;
  }
}
