/* eslint-disable max-len */
import { LIBS } from '../../scripts/scripts.js';
import { style } from './agenda-fieldset-group.css.js';

const { LitElement, html, repeat, nothing } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class AgendaFieldsetGroup extends LitElement {
  static properties = {
    agendaItems: { type: Array },
    timeslots: { type: Array },
    options: { type: Object },
  };

  constructor() {
    super();
    this.agendaItems = this.agendaItems || [{}];
    this.timeslots = this.dataset.timeslots.split(',');
    this.options = this.dataset.options ? JSON.parse(this.dataset.options) : {};
  }

  static styles = style;

  addAgenda() {
    this.agendaItems = [...this.agendaItems, {}];
  }

  deleteAgenda(index) {
    this.agendaItems = this.agendaItems.filter((_, i) => i !== index);
    if (this.agendaItems.length === 0) {
      this.agendaItems = [{
        startTime: '',
        description: '',
      }];
    }

    this.requestUpdate();
  }

  handleAgendaUpdate(event, index) {
    const updatedAgenda = event.detail.agenda;
    this.agendaItems = this.agendaItems.map((agenda, i) => (i === index ? updatedAgenda : agenda));
  }

  getAgendas() {
    return this.agendaItems.filter((o) => !(Object.keys(o).length === 0 && o.constructor === Object));
  }

  hasOnlyEmptyAgendaLeft() {
    return this.agendaItems[0].startTime === '' && this.agendaItems[0].description === '';
  }

  render() {
    return html`
      ${repeat(this.agendaItems, (agendaItem, index) => html`
        <agenda-fieldset .agendas=${this.agendaItems} .agenda=${agendaItem} .timeslots=${this.timeslots} .options=${this.options}
          @update-agenda=${(event) => this.handleAgendaUpdate(event, index)}>
          <div slot="delete-btn" class="delete-btn">
            ${this.agendaItems.length === 1 && this.hasOnlyEmptyAgendaLeft() ? nothing : html`
              <img class="icon icon-remove-circle" src="/ecc/icons/remove-circle.svg" alt="remove-repeater" @click=${() => this.deleteAgenda(index)}></img>
            `}
          </div>
        </agenda-fieldset>
      `)}
      <repeater-element text="Add agenda time and details" @repeat=${this.addAgenda}></repeater-element>
    `;
  }
}
