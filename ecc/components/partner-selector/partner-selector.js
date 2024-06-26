import { getLibs } from '../../scripts/utils.js';
import { style } from './partner-selector.css.js';
import { createPartner } from '../../utils/esp-controller.js';

const { LitElement, html } = await import(`${getLibs()}/deps/lit-all.min.js`);

export default class PartnerSelector extends LitElement {
  static properties = {
    selectedPartner: { type: Object },
    fieldLabels: { type: Object },
  };

  constructor() {
    super();
    this.selectedPartner = {};
  }

  static styles = style;

  firstUpdated() {
    this.imageDropzone = this.shadowRoot.querySelector('image-dropzone');
  }

  updateValue(key, value) {
    this.selectedPartner = { ...this.selectedPartner, [key]: value };

    this.dispatchEvent(new CustomEvent('update-partner', {
      detail: { partner: this.selectedPartner },
      bubbles: true,
      composed: true,
    }));
  }

  hasRequiredAttributes() {
    return this.selectedPartner.name;
  }

  render() {
    const configString = JSON.stringify({
      uploadOnCommand: true,
      type: 'partner-image',
      targetUrl: `/v1/partners/${this.selectedPartner.id}/images`,
    });

    return html`
      <fieldset class="partner-field-wrapper">
      <div>
        <div class="partner-input-wrapper">
          <image-dropzone .file=${this.selectedPartner.file} .configs=${configString}>
        <slot name="img-label" slot="img-label"></slot>
          </image-dropzone>
          <div>
            <div class="partner-input">
              <label>${this.fieldLabels.nameLabelText}</label>
              <sp-textfield value=${this.selectedPartner.name} @change=${(event) => this.updateValue('name', event.target.value)}></sp-textfield>
            </div>
            <div class="partner-input">
              <label>${this.fieldLabels.urlLabelText}</label>
              <sp-textfield value=${this.selectedPartner.externalUrl} @change=${(event) => this.updateValue('externalUrl', event.target.value)}></sp-textfield>
            </div>
          </div>
        </div>
      </div>
      <div class="action-area">
        <sp-button variant="primary" .disabled=${!this.selectedPartner.name} class="save-partner-button" @click=${async () => {
  const respJson = await createPartner(this.selectedPartner, this.eventId);
  if (respJson.partnerId) {
    this.selectedPartner.id = respJson.partnerId;
    this.imageDropzone.uploadImage();
  }
}}>Save Partner</sp-button>
        <slot name="delete-btn"></slot>
        </div>
      </fieldset>
    `;
  }
}
