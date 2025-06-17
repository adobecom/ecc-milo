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
    draggedIndex: { type: Number },
    dropTargetIndex: { type: Number },
  };

  constructor() {
    super();
    this.agendaItems = this.agendaItems || [{}];
    this.timeslots = this.dataset.timeslots.split(',');
    this.draggedIndex = -1;
    this.dropTargetIndex = -1;
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
    return this.agendaItems.filter((agenda) => agenda.startTime && (agenda.title || agenda.description)).map((agenda) => ({
      startTime: agenda.startTime,
      description: agenda.description,
      title: agenda.title,
    }));
  }

  hasOnlyEmptyAgendaLeft() {
    return !this.agendaItems[0]?.startTime && !this.agendaItems[0]?.description;
  }

  handleDragStart(e, index) {
    this.draggedIndex = index;
    e.dataTransfer.effectAllowed = 'move';
    e.target.classList.add('dragging');
  }

  handleDragEnd(e) {
    this.draggedIndex = -1;
    this.dropTargetIndex = -1;
    e.target.classList.remove('dragging');
    this.requestUpdate();
  }

  handleDragOver(e, index) {
    e.preventDefault();
    if (this.draggedIndex === index) return;
    this.dropTargetIndex = index;
    this.requestUpdate();
  }

  handleDragLeave(e) {
    e.preventDefault();
    this.dropTargetIndex = -1;
    this.requestUpdate();
  }

  handleDrop(e, index) {
    e.preventDefault();
    if (this.draggedIndex === -1 || this.draggedIndex === index) return;

    const newAgendaItems = [...this.agendaItems];
    const [draggedItem] = newAgendaItems.splice(this.draggedIndex, 1);
    newAgendaItems.splice(index, 0, draggedItem);
    this.agendaItems = newAgendaItems;
    this.draggedIndex = -1;
    this.dropTargetIndex = -1;
    this.requestUpdate();
  }

  render() {
    return html`
      <div class="agenda-group-container">
      ${repeat(this.agendaItems, (agendaItem, index) => {
    const { hours, minutes, period } = agendaItem.startTime ? parse24HourFormat(agendaItem.startTime) : {};
    const agendaComponents = {
      startTime: agendaItem.startTime,
      title: agendaItem.title || '',
      description: agendaItem.description,
      startTimeValue: agendaItem.startTimeValue || ((hours && minutes) && `${hours}:${minutes}`) || '',
      startTimePeriod: agendaItem.startTimePeriod || period || '',
    };

    const options = { timeslots: this.timeslots };
    return html`
        <agenda-fieldset 
          class="${this.draggedIndex === index ? 'dragging' : ''} ${this.dropTargetIndex === index ? 'drop-target' : ''}"
          .agenda=${agendaComponents} 
          .options=${options}
          draggable="true"
          @dragstart=${(e) => this.handleDragStart(e, index)}
          @dragend=${this.handleDragEnd}
          @dragover=${(e) => this.handleDragOver(e, index)}
          @dragleave=${this.handleDragLeave}
          @drop=${(e) => this.handleDrop(e, index)}
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
