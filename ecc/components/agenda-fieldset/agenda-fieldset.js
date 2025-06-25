import { LIBS } from '../../scripts/scripts.js';
import { parse24HourFormat, convertTo24HourFormat } from '../../scripts/utils.js';
import { style } from './agenda-fieldset.css.js';

const { LitElement, html, repeat } = await import(`${LIBS}/deps/lit-all.min.js`);

const titlePlaceholder = 'Add agenda title';
const titleMaxLength = 55;
const descriptionPlaceholder = 'Add agenda details';
const maxLengthSuffix = ' characters max *';

export default class AgendaFieldset extends LitElement {
  static properties = {
    agenda: { type: Object, reflect: true },
    options: { type: Object, reflect: true },
  };

  static styles = style;

  firstUpdated() {
    // Prevent drag and drop into tiptap editor
    const tiptap = this.renderRoot.querySelector('rte-tiptap');
    if (tiptap) {
      tiptap.addEventListener('dragover', (e) => e.preventDefault());
      tiptap.addEventListener('drop', (e) => e.preventDefault());
    }
  }

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
      <div class="agenda-container">
        <div class="field-container">
          <div class="time-picker">
            <p>Time</p>
            <div class="time-picker-wrapper">
              <sp-picker class="time-picker-input select-input" label="Pick agenda time" value=${this.parseAgendaTime()} @change=${(event) => {
  this.updateValue('startTimeValue', event.target.value);
}}>
                ${repeat(this.options.timeslots, (timeslot) => html`<sp-menu-item value=${timeslot}>${timeslot}</sp-menu-item>`)}
              </sp-picker>
              <sp-picker class="period-picker-input select-input" label="AM/PM" value=${this.parseAgendaPeriod()} @change=${(event) => {
  this.updateValue('startTimePeriod', event.target.value);
}}>
                ${repeat(['AM', 'PM'], (p) => html`<sp-menu-item value=${p}>${p}</sp-menu-item>`)}
              </sp-picker>
            </div>
          </div>
          <slot name="delete-btn"></slot>
        </div>
        <div class="text-field-wrapper">
          <sp-textfield class="text-input" placeholder=${titlePlaceholder} value=${this.agenda.title} quiet size="xl" maxlength=${titleMaxLength} @change=${(event) => {
  this.updateValue('title', event.target.value);
}}></sp-textfield>
          <div class="attr-text">${titleMaxLength + maxLengthSuffix}</div>
          <rte-tiptap placeholder=${descriptionPlaceholder} content=${this.agenda.description} size="s" .handleInput=${(value) => {
  this.updateValue('description', value);
}}></rte-tiptap>
        </div>
      </div>
      <div class="agenda-drag-handle">
        <img class="icon icon-drag-dots" src="/ecc/icons/drag-dots.svg" alt="drag-dots"></img>
      </div>
    `;
  }
}
