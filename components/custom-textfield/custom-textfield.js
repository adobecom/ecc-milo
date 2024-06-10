/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { getLibs } from '../../scripts/utils.js';
import { style } from './custom-textfield.css.js';

const { LitElement, html } = await import(`${getLibs()}/deps/lit-all.min.js`);

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
    data: { type: Object, reflect: true },
  };

  static styles = style;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.config = { ...defaultConfig, ...this.config };
    this.data = { ...defaultData, ...(this.data ? this.data : {}) };
  }

  render() {
    return html`
    <sp-textfield placeholder=${this.data.placeholder} ?quiet=${this.config.quiet} size=${this.config.size} ?grows=${this.config.grows} ?multiline=${this.config.multiline} class='text-input' value=${this.data.value} @change=${(event) => this.dispatchEvent(new CustomEvent('input-change', { detail: { value: event.target.value } }))}></sp-textfield>
    <sp-helptext class="helper-text">${this.data.helperText}</sp-helptext>`;
  }
}
