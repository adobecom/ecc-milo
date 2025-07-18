import { LIBS } from '../../scripts/scripts.js';
import { EVENT_TYPES } from '../../scripts/constants.js';
import { style } from './rsvp-form.css.js';
import { getIcon } from '../../scripts/utils.js';

const { LitElement, html, repeat } = await import(`${LIBS}/deps/lit-all.min.js`);

/**
 * Converts a camelCase or PascalCase string into an uppercase string with spaces between words.
 *
 * @param {string} input - The input string to be converted.
 * @returns {string} The converted string in uppercase with spaces between words.
 */
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
    formUrl: { type: String },
  };

  constructor() {
    super();
    this.data = [];
    this.formType = 'basic';
    this.visible = new Set();
    this.required = new Set();
    this.formUrl = '';
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
    const mandatedfields = this.data.filter((f) => f.Required === 'x').map((f) => f.Field);

    const cleanVisible = Array.from(new Set([...mandatedfields, ...visible]));
    const cleanRequired = Array.from(new Set([...mandatedfields, ...required]));

    return {
      rsvpFormFields: {
        visible: cleanVisible,
        required: cleanRequired,
      },
    };
  }

  updateMarketoFormUrl(value) {
    this.formUrl = value;
    this.requestUpdate();
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

  getRegistrationPayload() {
    const registration = { type: this.formType === 'basic' ? 'ESP' : 'Marketo' };

    if (this.formType === 'basic') {
      registration.formData = 'v1';
      return {
        registration,
        ...this.getRsvpFormFields(),
      };
    }

    if (this.formType === 'marketo') {
      registration.formData = this.formUrl;
      return { registration };
    }
    return {};
  }

  // eslint-disable-next-line class-methods-use-this
  renderMarketoForm() {
    return html`
      <div class="rsvp-checkboxes">
      <sp-field-label size="l" class="field-label">Marketo form URL
      <sp-action-button size="s" class="tooltip-trigger">
        ${getIcon('info')}
      </sp-action-button>
      <sp-tooltip self-managed variant="info" class="tooltip-content">
        Please enter the Marketo form URL generated by the Milo Marketo Configurator.
      </sp-tooltip>
      </sp-field-label>
      <sp-field-label size="l" class="field-label">
        Configure the Marketo RSVP Form here: <a href="https://milo.adobe.com/tools/marketo" target="_blank">https://milo.adobe.com/tools/marketo</a>
      </sp-field-label>
      <sp-textfield class="field-label" @change="${(event) => this.updateMarketoFormUrl(event.target.value)}" value=${this.formUrl}></sp-textfield>
      </div>
      `;
  }

  renderForm() {
    if (this.formType === 'basic') {
      return this.renderBasicForm();
    }
    return this.renderMarketoForm();
  }

  handleFormTypeChange(event) {
    this.formType = event.target.value;
    this.requestUpdate();
  }

  renderWebinarForm() {
    return html`
      <div class="rsvp-form">
      <fieldset class="form-type" @change=${(e) => { this.handleFormTypeChange(e); }} >
        <input type="radio" id="basic" name="drone" value="basic" .checked=${this.formType === 'basic'}/>
        <label for="basic">Basic form</label>
        <input type="radio" id="marketo" name="drone" value="marketo" .checked=${this.formType === 'marketo'} />
        <label for="marketo">Marketo</label>
      </fieldset>
      ${this.renderForm()}
      </div>
    `;
  }

  render() {
    // due to the dynamic data fetching based on the cloud type,
    // we need to handle the case where the data is not yet available.
    if (!this.data) return html`<div class="rsvp-form"></div>`;

    if (this.eventType === EVENT_TYPES.WEBINAR) {
      return this.renderWebinarForm();
    }

    return this.renderBasicForm();
  }
}
