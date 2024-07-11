import { LIBS } from '../../scripts/scripts.js';
import { style } from './partner-selector.css.js';
import { createSponsor, updateSponsor, uploadImage } from '../../scripts/esp-controller.js';

const { LitElement, html } = await import(`${LIBS}/deps/lit-all.min.js`);
const LINK_REGEX = '^https:\\/\\/[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}(:[0-9]{1,5})?(\\/.*)?$';

export default class PartnerSelector extends LitElement {
  static properties = {
    partner: { type: Object },
    fieldLabels: { type: Object },
    seriesId: { type: String },
    hasUnsavedChange: { type: Boolean },
  };

  constructor() {
    super();
    this.partner = this.partner || {
      name: '',
      link: '',
    };
    this.hasUnsavedChange = false;
  }

  static styles = style;

  firstUpdated() {
    this.imageDropzone = this.shadowRoot.querySelector('image-dropzone');
    this.imageDropzone.addEventListener('image-change', () => {
      this.hasUnsavedChange = true;
      this.requestUpdate();
    });
    this.checkValidity();
  }

  updateValue(key, value) {
    this.hasUnsavedChange = true;
    const saveButton = this.shadowRoot.querySelector('.save-partner-button');
    if (saveButton) saveButton.textContent = 'Save Partner';

    this.partner = { ...this.partner, [key]: value };
    this.partner.photo = this.imageDropzone?.file || null;

    this.dispatchEvent(new CustomEvent('update-partner', {
      detail: { partner: this.partner },
      bubbles: true,
      composed: true,
    }));
  }

  checkValidity() {
    return this.partner.name?.length >= 3 && this.partner.link?.match(LINK_REGEX);
  }

  async savePartner(e) {
    const saveButton = e.target;
    let respJson;

    saveButton.pending = true;

    const payload = {
      name: this.partner.name,
      link: this.partner.link,
    };
    if (!this.partner.sponsorId) {
      respJson = await createSponsor(payload, this.seriesId);
    } else {
      respJson = await updateSponsor(payload, this.partner.sponsorId, this.seriesId);
    }

    if (respJson.sponsorId) {
      this.partner.sponsorId = respJson.sponsorId;
      const file = this.imageDropzone?.getFile();

      if (file && (file instanceof File)) {
        const sponsorData = await uploadImage(file, {
          targetUrl: `/v1/series/${this.seriesId}/sponsors/${this.partner.sponsorId}/images`,
          type: 'sponsor-image',
          altText: `${this.partner.name} image`,
        });

        if (sponsorData) {
          this.partner.modificationTime = sponsorData.modificationTime;
          if (saveButton) {
            this.hasUnsavedChange = false;
            saveButton.textContent = 'Saved';
          }
        }
      } else if (saveButton) {
        this.hasUnsavedChange = false;
        saveButton.textContent = 'Saved';
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
          <image-dropzone .file=${this.partner.photo}>
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
              <sp-textfield pattern=${LINK_REGEX} value=${this.partner.link} @change=${(event) => {
  this.updateValue('link', event.target.value);
}}></sp-textfield>
            </div>
          </div>
        </div>
      </div>
      <div class="action-area">
        <sp-button variant="primary" ?disabled=${!this.checkValidity() || !this.hasUnsavedChange} class="save-partner-button" @click=${this.savePartner}>Save Partner</sp-button>
        <slot name="delete-btn"></slot>
        </div>
      </fieldset>
    `;
  }
}
