import { LIBS } from '../../scripts/scripts.js';
import { style } from './agenda-fieldset-group.css.js';

const { LitElement, html, repeat, nothing } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class AgendaFieldsetGroup extends LitElement {
  static properties = {
    agendas: { type: Array },
    timeslots: { type: Array },
    options: { type: Object },
  };

  constructor() {
    super();
    this.agendas = this.agendaItems || [{}];
    this.timeslots = this.dataset.timeslots.split(',');
    this.options = this.dataset.options ? JSON.parse(this.dataset.options) : {};
  }

  static styles = style;

  addAgenda() {
    this.agendas = [...this.agendas, {}];
  }

  deleteAgenda(index) {
    this.agendas = this.agendas.filter((_, i) => i !== index);
    this.requestUpdate();
  }

  handleAgendaUpdate(event, index) {
    const updatedAgenda = event.detail.agenda;
    this.agendas = this.agendas.map((agenda, i) => (i === index ? updatedAgenda : agenda));
  }

  getAgendas() {
    return this.agendas.filter((o) => !(Object.keys(o).length === 0 && o.constructor === Object));
  }

  render() {
    console.log(this.dataset.agendaItems, this.agendas);
    return html`
      ${repeat(this.agendas, (agenda, index) => html`
        <agenda-fieldset .agendas=${this.agendas} .agenda=${agenda} .timeslots=${this.timeslots} .options=${this.options}
          @update-agenda=${(event) => this.handleAgendaUpdate(event, index)}>
          <div slot="delete-btn" class="delete-btn">
            ${this.agendas.length > 1 ? html`
              <img class="icon icon-remove-circle" src="/ecc/icons/remove-circle.svg" alt="remove-repeater" @click=${() => this.deleteAgenda(index)}></img>
            ` : nothing}
          </div>
        </agenda-fieldset>
      `)}
      <repeater-element text="Add agenda time and details" @repeat=${this.addAgenda}></repeater-element>
    `;
  }
}
