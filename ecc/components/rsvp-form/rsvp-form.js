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
    eventFields: { type: Array },
    formType: { type: String },
    eventType: { type: String },
    formUrl: { type: String },
    editFieldModal: { type: Boolean },
    editingField: { type: Object },
  };

  constructor() {
    super();
    this.data = [];
    this.eventFields = [];
    this.formType = 'basic';
    this.formUrl = '';
    this.editFieldModal = false;
    this.editingField = null;

    // Bind instance methods
    this.handleDragEnd = this.handleDragEnd.bind(this);
  }

  firstUpdated() {
    this.eventFields = this.data.filter((field) => field.mandatory).map((field, index) => ({
      ...field,
      ordinal: index,
    }));
  }

  static styles = style;

  static isListTypeField(item) {
    return item.type === 'list';
  }

  static buildFieldPreview(item) {
    if (item.type === 'list') {
      console.log('item', item);
      return html`
        <div class="field-preview-row-input">
          <sp-field-label size="l" class="field-label">${item.name}</sp-field-label>
          <sp-picker label="Field name">
            ${repeat(item.values, (option) => option.value, (option) => html`<sp-menu-item value=${option.value}>${option.label}</sp-menu-item>`)}
          </sp-picker>
        </div>
      `;
    }

    return html`
      <div class="field-preview-row-input">
        <sp-field-label size="l" class="field-label">${item.name}</sp-field-label>
        <sp-textfield label="Field name" placeholder=${item.placeholder || ''}></sp-textfield>
      </div>
    `;
  }

  showEditFieldModal(field) {
    if (field) {
      // Create a deep copy of the field for editing
      this.editingField = {
        ...field,
        values: field.values ? field.values.map((value, index) => ({
          ...value,
          ordinal: index,
        })) : [],
      };
      this.editFieldModal = true;
      this.requestUpdate();
    }
  }

  closeEditFieldModal() {
    this.editingField = null;
    this.editFieldModal = false;
    this.requestUpdate();
  }

  saveEditFieldModal() {
    const updatedIndex = this.eventFields.findIndex((f) => f.name === this.editingField.name);
    if (updatedIndex !== -1) {
      this.eventFields[updatedIndex] = { ...this.editingField };
    }
    this.closeEditFieldModal();
  }

  updateTempField(event) {
    const { value, attribute } = event.target;
    if (this.editingField) {
      this.editingField[attribute] = value;
      this.requestUpdate();
    }
  }

  updateInlineField(event) {
    const { fieldName, value, attribute } = event.target;
    const updatedIndex = this.eventFields.findIndex((f) => f.name === fieldName);
    if (updatedIndex !== -1) {
      this.eventFields[updatedIndex][attribute] = value;
    }
    this.requestUpdate();
  }

  moveFieldToSelected(field) {
    const newField = {
      ...field,
      ordinal: this.eventFields.length,
    };
    this.eventFields = [...this.eventFields, newField];
    this.requestUpdate();
  }

  moveFieldToUnselected(field) {
    this.eventFields = this.eventFields
      .filter((f) => f.name !== field.name)
      .map((f, index) => ({
        ...f,
        ordinal: index,
      }));
    this.requestUpdate();
  }

  static dragAndReorderFields(field) {
    return (e) => {
      // Only allow dragging if the drag button was clicked
      if (!e.target.closest('.field-config-button[aria-label="Drag and reorder field"]')) {
        e.preventDefault();
        return;
      }
      const row = e.target.closest('.field-row');
      row.classList.add('dragging');
      // Set the drag data on the row element
      row.draggable = true;
      row.ondragstart = (dragEvent) => {
        dragEvent.dataTransfer.setData('text/plain', field.name);
        const rect = row.getBoundingClientRect();
        const offsetX = dragEvent.clientX - rect.left;
        const offsetY = dragEvent.clientY - rect.top;
        dragEvent.dataTransfer.setDragImage(row, offsetX, offsetY);
      };
    };
  }

  static handleDragOver(e) {
    e.preventDefault();
    const tbody = e.target.closest('tbody');
    if (!tbody) return;

    const draggingElement = tbody.querySelector('.dragging');
    if (!draggingElement) return;

    const siblings = [...tbody.querySelectorAll('.field-row:not(.dragging)')];
    const nextSibling = siblings.find((sibling) => {
      const box = sibling.getBoundingClientRect();
      const offset = e.clientY - box.top - box.height / 2;
      return offset < 0;
    });

    if (nextSibling) {
      tbody.insertBefore(draggingElement, nextSibling);
    } else {
      tbody.appendChild(draggingElement);
    }
  }

  handleDragEnd(e) {
    const tbody = e.target.closest('tbody');
    if (!tbody) return;

    const draggingElement = tbody.querySelector('.dragging');
    if (!draggingElement) return;

    draggingElement.classList.remove('dragging');
    const rows = tbody.querySelectorAll('.field-row');
    const newOrder = Array.from(rows).map((row, index) => {
      const fieldName = row.querySelector('.cat-text').textContent.toLowerCase().replace(/\s+/g, '');
      const field = this.eventFields.find((f) => f.name.toLowerCase().replace(/\s+/g, '') === fieldName);
      return field ? { ...field, ordinal: index } : null;
    }).filter(Boolean);

    this.eventFields = newOrder;
    this.requestUpdate();
  }

  reorderOptions(event) {
    const { fromIndex, toIndex } = event.detail;
    if (this.editingField && this.editingField.values) {
      const values = [...this.editingField.values];
      const [movedValue] = values.splice(fromIndex, 1);
      values.splice(toIndex, 0, movedValue);
      this.editingField.values = values;
      this.requestUpdate();
    }
  }

  getRegistrationPayload() {
    const registration = { type: this.formType === 'basic' ? 'ESP' : 'Marketo' };

    if (this.formType === 'basic') {
      registration.formData = 'v1';
      return { registration, fields: this.eventFields };
    }

    if (this.formType === 'marketo') {
      registration.formData = this.formUrl;
      return { registration };
    }
    return {};
  }

  renderBasicForm() {
    const { data } = this;
    const unselectedFields = data.filter((df) => !this.eventFields.find((f) => f.name === df.name));

    return html`
      <div class="rsvp-fields">
        <div class="selected-fields">
          <table class="field-config-table">
            <thead>
              <tr class="table-header-row">
                <td class="table-heading">FIELD CATEGORIES</td>
                <td class="table-heading">REQUIRED FIELD?</td>
              </tr>
            </thead>
            <tbody @dragover=${RsvpForm.handleDragOver}>
              ${repeat(this.eventFields, (field) => field.name, (field) => html`<tr class="field-row" draggable="true" 
                @dragstart=${RsvpForm.dragAndReorderFields(field)}
                @dragend=${this.handleDragEnd}>
                <td><div class="cat-text">${convertString(field.name)}</div></td>
                <td>
                  <div class="field-container">  
                    <sp-switch class="check-require" name=${field.name} ?checked=${field.required} @change=${(e) => this.updateInlineField({ target: { fieldName: field.name, value: e.target.checked, attribute: 'required' } })}>${field.required ? 'Yes' : 'No'}</sp-switch>
                    <div class="field-config-container">
                      <button class="field-config-button" aria-label="Edit field" @click=${() => this.showEditFieldModal(field)}>
                        <img src="/ecc/icons/pencil-wire.svg" alt="Edit field">
                      </button>
                      <button class="field-config-button" aria-label="Remove field" @click=${() => this.moveFieldToUnselected(field)}>
                        <img src="/ecc/icons/eye-wire.svg" alt="Remove field">
                      </button>
                      <button class="field-config-button" aria-label="Drag and reorder field">
                        <img src="/ecc/icons/drag-dots.svg" alt="Drag and reorder field">
                      </button>
                    </div>
                  </div>
                </td>
              </tr>`)}
            </tbody>
          </table>
        </div>

        <div class="unselected-fields">
          <table class="field-config-table">
            <tbody>
              ${repeat(unselectedFields, (field) => field.name, (field) => html`<tr class="field-row">
                <td><div class="cat-text">${convertString(field.name)}</div></td>
                <td>
                  <div class="field-container">
                    <sp-switch class="check-require" name=${field.name} ?checked=${field.required} disabled>${field.required ? 'Yes' : 'No'}</sp-switch>
                    <button class="field-config-button" aria-label="Add field" @click=${() => this.moveFieldToSelected(field)}>
                      <img src="/ecc/icons/eye-slash-wire.svg" alt="Add field">
                    </button>
                  </div>
                </td>
              </tr>`)}
            </tbody>
          </table>
        </div>

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
            ${this.editingField ? html`
              <div class="field-presentation-row">
                <div>
                  <sp-field-label size="l" class="field-label">Field category</sp-field-label>
                  <sp-textfield label="Field name" value=${this.editingField.name} disabled></sp-textfield>
                </div>
                <div class="field-presentation-row-input">
                  <sp-field-label size="l" class="field-label">Placeholder text</sp-field-label>
                  <sp-textfield label="Placeholder" name="placeholder" value=${this.editingField.placeholder || ''} @change=${(e) => this.updateTempField({ target: { value: e.target.value, attribute: 'placeholder' } })}></sp-textfield>
                </div>
              </div>
              <div class="field-required-toggle-row">
                <sp-field-label size="l" class="field-label">Required field?</sp-field-label>
                <sp-switch class="check-require" name="required" ?checked=${this.editingField.required} @change=${(e) => this.updateTempField({ target: { value: e.target.checked, attribute: 'required' } })}>${this.editingField.required ? 'Yes' : 'No'}</sp-switch>
              </div>
              <div class="field-options-row ${RsvpForm.isListTypeField(this.editingField) ? '' : 'hidden'}">
                <sp-field-label size="l" class="field-label">List options</sp-field-label>
                <div class="field-option-row" @dragover=${RsvpForm.handleOptionsDragOver}>
                  ${repeat(this.editingField.values || [], (option) => option.value, (option) => html`
                    <div class="field-option-item" draggable="true"
                      @dragstart=${RsvpForm.dragAndReorderOptions(option)}
                      @dragend=${this.handleOptionsDragEnd}>
                      <span>${option.label}</span>
                      <button class="field-config-button" aria-label="Drag option">
                        <img src="/ecc/icons/drag-dots.svg" alt="Drag option">
                      </button>
                    </div>
                  `)}
                </div>
              </div>
              <div class="field-preview-row">
                <h3>Preview</h3>
                ${RsvpForm.buildFieldPreview(this.editingField)}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
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
    const regPayload = this.getRegistrationPayload();
    console.log('regPayload', regPayload);
    if (this.eventType === EVENT_TYPES.ONLINE) {
      return this.renderWebinarForm();
    }

    return this.renderBasicForm();
  }

  static dragAndReorderOptions(option) {
    return (e) => {
      const optionItem = e.target.closest('.field-option-item');
      if (!optionItem) {
        e.preventDefault();
        return;
      }
      optionItem.classList.add('dragging');
      optionItem.draggable = true;
      optionItem.ondragstart = (dragEvent) => {
        dragEvent.dataTransfer.setData('text/plain', option.value);
        const rect = optionItem.getBoundingClientRect();
        const offsetX = dragEvent.clientX - rect.left;
        const offsetY = dragEvent.clientY - rect.top;
        dragEvent.dataTransfer.setDragImage(optionItem, offsetX, offsetY);
      };
    };
  }

  static handleOptionsDragOver(e) {
    e.preventDefault();
    const container = e.target.closest('.field-option-row');
    if (!container) return;

    const draggingElement = container.querySelector('.dragging');
    if (!draggingElement) return;

    const siblings = [...container.querySelectorAll('.field-option-item:not(.dragging)')];
    const nextSibling = siblings.find((sibling) => {
      const box = sibling.getBoundingClientRect();
      const offset = e.clientY - box.top - box.height / 2;
      return offset < 0;
    });

    if (nextSibling) {
      container.insertBefore(draggingElement, nextSibling);
    } else {
      container.appendChild(draggingElement);
    }
  }

  handleOptionsDragEnd(e) {
    const container = e.target.closest('.field-option-row');
    if (!container) return;

    const draggingElement = container.querySelector('.dragging');
    if (!draggingElement) return;

    draggingElement.classList.remove('dragging');
    const options = container.querySelectorAll('.field-option-item');
    const newOrder = Array.from(options).map((option, index) => {
      const value = option.querySelector('span').textContent;
      const optionData = this.editingField.values.find((v) => v.label === value);
      return optionData ? { ...optionData, ordinal: index } : null;
    }).filter(Boolean);

    this.editingField.values = newOrder;
    this.requestUpdate();
  }
}
