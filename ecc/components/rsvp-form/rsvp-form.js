import { LIBS } from '../../scripts/scripts.js';
import { style } from './rsvp-form.css.js';

const { LitElement, html, repeat } = await import(`${LIBS}/deps/lit-all.min.js`);

function convertString(input) {
  const parts = input.replace(/([a-z])([A-Z])/g, '$1 $2');
  const result = parts.toUpperCase();

  return result;
}

export default class RsvpForm extends LitElement {
  static properties = {
    data: { type: Array },
    formType: { type: String },
    visible: { type: Set },
    required: { type: Set },
    eventType: { type: String },
  };

  constructor() {
    super();
    this.data = [];
    this.formType = 'basic';
    this.visible = new Set();
    this.required = new Set();
  }

  static styles = style;

  toggleVisible(event) {
    const { name, checked } = event.target;
    if (checked) {
      this.visible.add(name);
    } else {
      this.visible.delete(name);
      this.required.delete(name);
    }
    this.requestUpdate();
  }

  toggleRequired(event) {
    const { name, checked } = event.target;
    if (checked) {
      this.visible.add(name);
      this.required.add(name);
    } else {
      this.required.delete(name);
    }
    this.requestUpdate();
  }

  getRsvpFormFields() {
    const visible = Array.from(this.visible);
    const required = Array.from(this.required);
    return {
      visible,
      required,
    };
  }

  renderBasicForm() {
    const data = this.data.filter((f) => f.Required !== 'x' && f.Type !== 'submit');

    return html`
      <div class="rsvp-checkboxes">
        <table class="field-config-table">
          <thead>
            <tr class="table-header-row">
              <td class="table-heading">FIELD CATEGORIES</td>
              <td class="table-heading">INCLUDE ON FORM</td>
              <td class="table-heading">MAKE IT REQUIRED</td>
            </tr>
          </thead>
          <tbody>
            ${repeat(data, (item) => item.Field, (item) => html`<tr class="field-row">
              <td><div class="cat-text">${convertString(item.Field)}</div></td>
              <td>
                <sp-switch class="check-appear" name=${item.Field} ?checked=${(this.visible.has(item.Field))} @change=${this.toggleVisible}>Appears on form</sp-switch>
              </td>
              <td>
                <sp-switch class="check-require" name=${item.Field} ?checked=${(this.required.has(item.Field))} @change=${this.toggleRequired}>Required field</sp-switch>
              </td>
            </tr>`)}
          </tbody>
        </table>
      </div>
    `;
  }

  // eslint-disable-next-line class-methods-use-this
  renderMarketoForm() {
    return html`
        <div class="rsvp-checkboxes">
        <sp-field-label size="xl" class="field-label">SFDC ID *</sp-field-label>
        <sp-textfield class="field-label"></sp-textfield>
        </div>
        `;
  }

  renderForm() {
    if (this.formType === 'basic') {
      return this.renderBasicForm();
    }
    return this.renderMarketoForm();
  }

  renderWebinarForm() {
    return html`
      <div class="rsvp-form">
      <fieldset class="form-type" @change=${(e) => { this.formType = e.target.value; }} >
    <input type="radio" id="basic" name="drone" value="basic" ?checked=${this.formType === 'basic'}/>
    <label for="basic">Basic form</label>
    <input type="radio" id="marketo" name="drone" value="marketo" ?checked=${this.formType === 'marketo'} />
    <label for="marketo">Marketo</label>
</fieldset>
      ${this.renderForm()}
      </div>
    `;
  }

  render() {
    if (this.eventType === 'Online') {
      return this.renderWebinarForm();
    }

    return this.renderBasicForm();
  }
}
