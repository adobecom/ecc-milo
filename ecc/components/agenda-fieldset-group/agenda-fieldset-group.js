/* eslint-disable max-len */
import { LIBS } from '../../scripts/scripts.js';
import { parse24HourFormat } from '../../scripts/utils.js';
import { style } from './agenda-fieldset-group.css.js';

const { LitElement, html, repeat, nothing } = await import(`${LIBS}/deps/lit-all.min.js`);

const defaultAgenda = { startTime: '', description: '' };

export default class AgendaFieldsetGroup extends LitElement {
  static properties = {
    agendaItems: { type: Array },
    timeslots: { type: Array },
  };

  constructor() {
    super();
    this.agendaItems = this.agendaItems || [{}];
    this.timeslots = this.dataset.timeslots.split(',');
  }

  static styles = style;

  addAgenda() {
    this.agendaItems = [...this.agendaItems, {}];
  }

  deleteAgenda(index) {
    this.agendaItems = this.agendaItems.filter((_, i) => i !== index);
    if (this.agendaItems.length === 0) {
      this.agendaItems = [defaultAgenda];
    }

    this.requestUpdate();
  }

  handleAgendaUpdate(event, index) {
    const updatedAgenda = event.detail.agenda;
    this.agendaItems = this.agendaItems.map((agenda, i) => (i === index ? updatedAgenda : agenda));
  }

  getCompleteAgenda() {
    return this.agendaItems.filter((agenda) => agenda.startTime && agenda.description).map((agenda) => ({
      startTime: agenda.startTime,
      description: agenda.description,
    }));
  }

  hasOnlyEmptyAgendaLeft() {
    return !this.agendaItems[0]?.startTime && !this.agendaItems[0]?.description;
  }

  render() {
    return html`
      <div class="agenda-group-container">
      ${repeat(this.agendaItems, (agendaItem, index) => {
    const { hours, minutes, period } = agendaItem.startTime ? parse24HourFormat(agendaItem.startTime) : {};
    const agendaComponents = {
      startTime: agendaItem.startTime,
      title: agendaItem.title || '',
      detail: agendaItem.description || '',
      startTimeValue: agendaItem.startTimeValue || ((hours && minutes) && `${hours}:${minutes}`) || '',
      startTimePeriod: agendaItem.startTimePeriod || period || '',
    };

    const options = { timeslots: this.timeslots };
    return html`
        <agenda-fieldset .agenda=${agendaComponents} .options=${options}
          @update-agenda=${(event) => this.handleAgendaUpdate(event, index)}>
          <div slot="delete-btn" class="delete-btn">
            ${this.agendaItems.length === 1 && this.hasOnlyEmptyAgendaLeft() ? nothing : html`
              <img class="icon icon-remove-circle" src="${this.agendaItems.length === 1 ? '/ecc/icons/delete.svg' : '/ecc/icons/remove-circle.svg'}" alt="remove-repeater" @click=${() => this.deleteAgenda(index)}></img>
            `}
          </div>
        </agenda-fieldset>
      `;
  })}
      <repeater-element text="Add agenda time and details" @repeat=${this.addAgenda}></repeater-element>
      </div>
    `;
  }
}
