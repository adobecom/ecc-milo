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
    editFieldModal: { type: Boolean },
    editingField: { type: Object },
    tempRequired: { type: Set },
    tempEditingField: { type: Object },
  };

  constructor() {
    super();
    this.data = [];
    this.formType = 'basic';
    this.visible = new Set();
    this.required = new Set();
    this.formUrl = '';
    this.editFieldModal = false;
    this.editingField = null;
    this.tempRequired = new Set();
    this.tempEditingField = null;
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
      this.tempRequired.add(name);
    } else {
      this.tempRequired.delete(name);
    }
    this.requestUpdate();
  }

  getRsvpFormFields() {
    const visible = Array.from(this.visible);
    const required = Array.from(this.required);
    const mandatedfields = this.data.filter((f) => f.Required === 'x').map((f) => f.Field);

    return {
      rsvpFormFields: {
        visible: [...mandatedfields, ...visible],
        required: [...mandatedfields, ...required],
      },
    };
  }

  updateMarketoFormUrl(value) {
    this.formUrl = value;
    this.requestUpdate();
  }

  showEditFieldModal(field) {
    if (field) {
      this.editingField = field;
      this.tempEditingField = {
        ...field,
        Options: field.Options ? [...field.Options.split(';')] : [],
      };
      this.tempRequired = new Set(this.required);
      this.editFieldModal = true;
      this.requestUpdate();
    }
  }

  closeEditFieldModal() {
    this.tempRequired = new Set();
    this.tempEditingField = null;
    this.editFieldModal = false;
    this.editingField = null;
    this.requestUpdate();
  }

  saveEditFieldModal() {
    const fieldIndex = this.data.findIndex((f) => f.Field === this.tempEditingField.Field);
    if (fieldIndex !== -1) {
      this.data[fieldIndex] = {
        ...this.tempEditingField,
        Options: this.tempEditingField.Options.join(';'),
      };
    }
    this.required = new Set(this.tempRequired);
    this.closeEditFieldModal();
  }

  updateTempField(event) {
    const { name, value } = event.target;
    if (this.tempEditingField) {
      this.tempEditingField[name] = value;
      this.requestUpdate();
    }
  }

  reorderOptions(event) {
    const { fromIndex, toIndex } = event.detail;
    if (this.tempEditingField && this.tempEditingField.Options) {
      const options = [...this.tempEditingField.Options];
      const [movedOption] = options.splice(fromIndex, 1);
      options.splice(toIndex, 0, movedOption);
      this.tempEditingField.Options = options;
      this.requestUpdate();
    }
  }

  toggleFieldEnabled(event) {
    const { name } = event.target;
    this.toggleVisible(event);
  }

  dragAndReorderFields(event) {
    const { name } = event.target;
    this.dragAndReorderFields(event);
  }

  static isListTypeField(item) {
    return ['select', 'multi-select'].includes(item.Type);
  }

  static buildFieldPreview(item) {
    if (item.Type === 'select') {
      return html`
        <div class="field-preview-row-input">
          <sp-field-label size="l" class="field-label">${item.Label}</sp-field-label>
          <sp-picker label="Field name">
            ${repeat(item.Options, (option) => option, (option) => html`<sp-menu-item value=${option}>${option}</sp-menu-item>`)}
          </sp-picker>
        </div>
      `;
    }

    if (item.Type === 'multi-select') {
      return html`
        <div class="field-preview-row-input">
          <sp-field-label size="l" class="field-label">${item.Label}</sp-field-label>
          <sp-textfield label="Field name" placeholder=${item.Placeholder}></sp-textfield>
          <sp-popover>
            <sp-menu label="Field name" selects="multiple" value=${item.Field}>
              ${repeat(item.Options, (option) => option, (option) => html`<sp-menu-item value=${option}>${option}</sp-menu-item>`)}
            </sp-menu>
          </sp-popover>
        </div>
      `;
    }

    return html`
      <div class="field-preview-row-input">
        <sp-field-label size="l" class="field-label">${item.Label}</sp-field-label>
        <sp-textfield label="Field name" placeholder=${item.Placeholder}></sp-textfield>
      </div>
    `;
  }

  renderBasicForm() {
    const data = this.data.filter((f) => f.Required !== 'x' && f.Type !== 'submit');

    return html`
      <div class="rsvp-fields">
        <table class="field-config-table">
          <thead>
            <tr class="table-header-row">
              <td class="table-heading">FIELD CATEGORIES</td>
              <td class="table-heading">REQUIRED FIELD?</td>
            </tr>
          </thead>
          <tbody>
            ${repeat(data, (item) => item.Field, (item) => html`<tr class="field-row">
              <td><div class="cat-text">${convertString(item.Field)}</div></td>
              <td>
                <div class="field-container">  
                  <sp-switch class="check-require" name=${item.Field} ?checked=${(this.required.has(item.Field))} @change=${this.toggleRequired}>${this.required.has(item.Field) ? 'Yes' : 'No'}</sp-switch>
                  <div class="field-config-container">
                    <button class="field-config-button" aria-label="Edit field" @click=${() => this.showEditFieldModal(item)}>
                      <img src="/ecc/icons/pencil-wire.svg" alt="Edit field">
                    </button>
                    <button class="field-config-button" aria-label="Show field" @click=${this.toggleFieldEnabled}>
                      <img src="/ecc/icons/eye-wire.svg" alt="Show field">
                    </button>
                    <button class="field-config-button" aria-label="Drag field" @mousedown=${this.dragAndReorderFields}>
                      <img src="/ecc/icons/drag-dots.svg" alt="Drag field">
                    </button>
                  </div>
                </div>
              </td>
              <div class="edit-field-modal" ?open=${this.editFieldModal}>
                <div>
                  <div class="header-row">
                    <h2>Edit Field</h2>
                    <div class="header-row-buttons">
                      <button class="header-row-button" aria-label="Cancel" @click=${this.closeEditFieldModal}>
                        Cancel
                      </button>
                      <button class="header-row-button" aria-label="Save changes" @click=${this.saveEditFieldModal}>
                        Save
                      </button>
                    </div>
                  </div>
                  ${this.tempEditingField ? html`
                    <div class="field-presentation-row">
                      <div>
                        <sp-field-label size="l" class="field-label">Field category</sp-field-label>
                        <sp-textfield label="Field name" value=${this.tempEditingField.Label} disabled></sp-textfield>
                      </div>
                      <div class="field-presentation-row-input">
                        <sp-field-label size="l" class="field-label">Placeholder text</sp-field-label>
                        <sp-textfield label="Placeholder" name="Placeholder" value=${this.tempEditingField.Placeholder} @change=${this.updateTempField}></sp-textfield>
                      </div>
                    </div>
                    <div class="field-required-toggle-row">
                      <sp-field-label size="l" class="field-label">Required field?</sp-field-label>
                      <sp-switch class="check-require" name=${this.tempEditingField.Field} ?checked=${this.tempRequired.has(this.tempEditingField.Field)} @change=${this.toggleRequired}>${this.tempRequired.has(this.tempEditingField.Field) ? 'Yes' : 'No'}</sp-switch>
                    </div>
                    <div class="field-options-row ${RsvpForm.isListTypeField(this.tempEditingField) ? '' : 'hidden'}">
                      <sp-field-label size="l" class="field-label">List options</sp-field-label>
                      <div class="field-option-row">
                        ${repeat(this.tempEditingField.Options, (option) => option, (option, index) => html`
                          <div class="field-option-item">
                            <span>${option}</span>
                            <button class="field-config-button" aria-label="Drag option" @mousedown=${() => this.dragAndReorderOptions(index)}>
                              <img src="/ecc/icons/drag-dots.svg" alt="Drag option">
                            </button>
                          </div>
                        `)}
                      </div>
                    </div>
                    <div class="field-preview-row">
                      <h3>Preview</h3>
                      ${RsvpForm.buildFieldPreview(this.tempEditingField)}
                    </div>
                  ` : ''}
                </div>
              </div>
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
    if (this.eventType === EVENT_TYPES.ONLINE) {
      return this.renderWebinarForm();
    }

    return this.renderBasicForm();
  }
}
