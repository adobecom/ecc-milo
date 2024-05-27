import { getLibs } from '../../scripts/utils.js';
import { style } from './agenda-fieldset.css.js';
import { convertTo24HourFormat } from '../../utils/utils.js';

const { LitElement, html } = await import(`${getLibs()}/deps/lit-all.min.js`);

export default class AgendaFieldset extends LitElement {
  static properties = { timeSlots: { type: Array }, options: { type: Object } };

  constructor() {
    super();
    this.timeSlots = this.dataset.timeSlots.split(',');
    this.options = JSON.parse(this.dataset.options);
  }

  static styles = style;

  render() {
    return html`
      <div class="field-container">
        <div class="time-picker">
          <p>Time</p>
          <div class="time-picker-wrapper">
            <sp-picker class="time-picker-input select-input" label="Pick agenda time">
            ${this.timeSlots.map((timeSlot) => html`<sp-menu-item value=${convertTo24HourFormat(timeSlot)}">${timeSlot}</sp-menu-item>`)}
            </sp-picker>
          </div>
        </div>
        <div class="text-field-wrapper"><sp-textfield class="text-input" placeholder=${this.options.placeholder} ${this.options.isRequired ? 'required' : ''} quiet
            size="xl" maxlength=${this.options.maxCharNum}></sp-textfield>
          <div class="attr-text">${this.options.maxLengthText}</div>
        </div>
      </div>
    `;
  }
}
