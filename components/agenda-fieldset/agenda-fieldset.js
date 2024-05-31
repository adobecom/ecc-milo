import { getLibs } from '../../scripts/utils.js';
import { style } from './agenda-fieldset.css.js';
import { convertTo24HourFormat } from '../../utils/utils.js';

const { LitElement, html, repeat, nothing } = await import(`${getLibs()}/deps/lit-all.min.js`);

export default class AgendaFieldset extends LitElement {
  static properties = {
    agenda: { type: Object, reflect: true },
    timeslots: { type: Array, reflect: true },
    options: { type: Object, reflect: true },
  };

  static styles = style;

  updateValue(key, value) {
    this.agenda = { ...this.agenda, [key]: value };
    this.dispatchEvent(new CustomEvent('update-agenda', {
      detail: { agenda: this.agenda },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    return html`
      <div class="field-container">
        <div class="time-picker">
          <p>Time</p>
          <div class="time-picker-wrapper">
            <sp-picker class="time-picker-input select-input" label="Pick agenda time" value=${this.agenda.startTime || nothing} @change=${(event) => {
  this.updateValue('startTime', event.target.value);
}}>
              ${repeat(this.timeslots, (timeslot) => html`<sp-menu-item value=${convertTo24HourFormat(timeslot)}>${timeslot}</sp-menu-item>`)}
            </sp-picker>
          </div>
        </div>
        <div class="text-field-wrapper">
          <sp-textfield class="text-input" placeholder=${this.options.placeholder} value=${this.agenda.description || nothing} ?required=${this.options.isRequired} quiet size="xl" maxlength=${this.options.maxCharNum} @change=${(event) => {
  this.updateValue('description', event.target.value);
}}></sp-textfield>
          <div class="attr-text">${this.options.maxLengthText}</div>
        </div>
      </div>
      <slot name="delete-btn"></slot>
    `;
  }
}
