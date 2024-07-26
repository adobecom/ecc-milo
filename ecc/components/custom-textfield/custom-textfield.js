/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { LIBS } from '../../scripts/scripts.js';
import { style } from './custom-textfield.css.js';

const { LitElement, html, nothing } = await import(`${LIBS}/deps/lit-all.min.js`);

const defaultConfig = {
  grows: false,
  multiline: false,
  size: 'l',
};

const defaultData = {
  value: '',
  placeholder: '',
  helperText: '',
};

export class CustomTextfield extends LitElement {
  static properties = {
    config: { type: Object, reflect: true },
    fielddata: { type: Object, reflect: true },
  };

  static styles = style;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.config = { ...defaultConfig, ...this.config };
    this.fielddata = { ...defaultData, ...(this.fielddata ? this.fielddata : {}) };
  }

  getMaxLength() {
    if (!this.fielddata.helperText) return '';

    const match = this.fielddata.helperText.match(/\d+/);

    return match ? match[0] : '';
  }

  render() {
    return html`
    <sp-textfield placeholder=${this.fielddata.placeholder} pattern=${this.config.pattern} ?quiet=${this.config.quiet} size=${this.config.size} ?grows=${this.config.grows} ?multiline=${this.config.multiline} maxlength=${this.getMaxLength()} class='text-input' value=${this.fielddata.value} @change=${(event) => { event.stopPropagation(); this.dispatchEvent(new CustomEvent('change-custom', { detail: { value: event.target.value } })); }} @input=${(event) => { event.stopPropagation(); this.dispatchEvent(new CustomEvent('input-custom', { detail: { value: event.target.value } })); }}></sp-textfield>
    ${this.fielddata.helperText ? html`<sp-helptext class="helper-text">${this.fielddata.helperText}</sp-helptext>` : nothing}`;
  }
}
