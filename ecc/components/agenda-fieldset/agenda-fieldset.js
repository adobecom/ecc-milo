import { LIBS } from '../../scripts/scripts.js';
import { parse24HourFormat, convertTo24HourFormat } from '../../scripts/utils.js';
import { style } from './agenda-fieldset.css.js';

const { LitElement, html, repeat } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class AgendaFieldset extends LitElement {
  static properties = {
    agendas: { type: Array },
    agenda: { type: Object, reflect: true },
    timeslots: { type: Array, reflect: true },
    options: { type: Object, reflect: true },
  };

  static styles = style;

  updateValue(key, value) {
    this.agenda = { ...this.agenda, [key]: value };

    if (this.agenda.startTimeValue && this.agenda.startTimePeriod) {
      this.agenda.startTime = convertTo24HourFormat(`${this.agenda.startTimeValue} ${this.agenda.startTimePeriod}`);
    }

    this.dispatchEvent(new CustomEvent('update-agenda', {
      detail: { agenda: this.agenda },
      bubbles: true,
      composed: true,
    }));
  }

  parseAgendaTime() {
    if (!this.agenda.startTime) return '';

    const { hours, minutes } = parse24HourFormat(this.agenda.startTime);
    return `${hours}:${minutes}`;
  }

  parseAgendaPeriod() {
    if (!this.agenda.startTime) return '';

    const { period } = parse24HourFormat(this.agenda.startTime);
    return period;
  }

  render() {
    return html`
      <div class="field-container">
        <div class="time-picker">
          <p>Time</p>
          <div class="time-picker-wrapper">
            <sp-picker class="time-picker-input select-input" label="Pick agenda time" value=${this.parseAgendaTime()} @change=${(event) => {
  this.updateValue('startTimeValue', event.target.value);
}}>
              ${repeat(this.timeslots, (timeslot) => html`<sp-menu-item value=${timeslot}>${timeslot}</sp-menu-item>`)}
            </sp-picker>
            <sp-picker class="period-picker-input select-input" label="AM/PM" value=${this.parseAgendaPeriod()} @change=${(event) => {
  this.updateValue('startTimePeriod', event.target.value);
}}>
              ${repeat(['AM', 'PM'], (p) => html`<sp-menu-item value=${p}>${p}</sp-menu-item>`)}
            </sp-picker>
          </div>
        </div>
        <div class="text-field-wrapper">
          <sp-textfield class="text-input" placeholder=${this.options.placeholder} value=${this.agenda.description} ?required=${this.options.isRequired && (this.agendas.length > 1 || this.agenda.startTime)} quiet size="xl" maxlength=${this.options.maxCharNum} @change=${(event) => {
  this.updateValue('description', event.target.value);
}}></sp-textfield>
          <div class="attr-text">${this.options.maxLengthText}</div>
        </div>
      </div>
      <slot name="delete-btn"></slot>
    `;
  }
}
