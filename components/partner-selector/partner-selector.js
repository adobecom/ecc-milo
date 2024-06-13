import { getLibs } from '../../scripts/utils.js';
import { isEmptyObject } from '../../utils/utils.js';
import { style } from './partner-selector.css.js';
import { createPartner } from '../../utils/esp-controller.js';

const { LitElement, html } = await import(`${getLibs()}/deps/lit-all.min.js`);

export default class PartnerSelector extends LitElement {
  static properties = { selectedPartner: { type: Object } };

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
  }

  render() {
    return html`
      <fieldset class="partner-field-wrapper">
        <image-dropzone configs=${JSON.stringify({
    uploadOnEvent: true,
    type: 'partner-image',
    targetUrl: `/v1/partners/${this.selectedPartner.id}/images`,
  })}>
        <slot name="img-label" slot="img-label"></slot>
    </image-dropzone>
        <div class="partner-input-wrapper">
          <label>Partner name</label>
          <sp-textfield @change=${(event) => this.updateValue('name', event.detail.value)}></sp-textfield>
        </div>
        <div class="partner-input-wrapper">
          <label>Partner external url</label>
          <sp-textfield @change=${(event) => this.updateValue('externalUrl', event.detail.value)}></sp-textfield>
        </div>
        <slot name="delete-btn"></slot>
            <sp-button variant="primary" class="save-profile-button" @click=${async () => {
    const respJson = await createPartner(this.selectedPartner, this.eventId);
    if (respJson.partnerId) {
      this.selectedPartner.id = respJson.partnerId;
      this.imageDropzone.dispatchEvent(new CustomEvent('shouldupload'));
    }
  }}>Save Partner</sp-button>
      </fieldset>
    `;
  }
}
