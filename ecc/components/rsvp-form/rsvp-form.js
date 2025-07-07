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

    // Clear existing drop indicators
    tbody.querySelectorAll('.field-row').forEach((row) => {
      row.classList.remove('drop-above', 'drop-below');
    });

    const siblings = [...tbody.querySelectorAll('.field-row:not(.dragging)')];
    const nextSibling = siblings.find((sibling) => {
      const box = sibling.getBoundingClientRect();
      const offset = e.clientY - box.top - box.height / 2;
      return offset < 0;
    });

    if (nextSibling) {
      nextSibling.classList.add('drop-above');
    } else if (siblings.length > 0) {
      siblings[siblings.length - 1].classList.add('drop-below');
    }
  }

  handleDragEnd(e) {
    const tbody = e.target.closest('tbody');
    if (!tbody) return;

    const draggingElement = tbody.querySelector('.dragging');
    if (!draggingElement) return;

    // Calculate new order based on drop indicators that were set during dragover
    const draggedFieldName = draggingElement.querySelector('.cat-text').textContent.toLowerCase().replace(/\s+/g, '');
    const draggedField = this.eventFields.find((f) => f.name.toLowerCase().replace(/\s+/g, '') === draggedFieldName);

    if (!draggedField) return;

    // Read drop indicators BEFORE clearing them
    const dropAbove = tbody.querySelector('.drop-above');
    const dropBelow = tbody.querySelector('.drop-below');

    // Clear all drag states and indicators
    draggingElement.classList.remove('dragging');
    tbody.querySelectorAll('.field-row').forEach((row) => {
      row.classList.remove('drop-above', 'drop-below');
    });

    const newOrder = [...this.eventFields];
    const draggedIndex = newOrder.findIndex((f) => f.name === draggedField.name);

    if (draggedIndex === -1) return;

    // Remove dragged item from current position
    const [removed] = newOrder.splice(draggedIndex, 1);

    if (dropAbove) {
      const dropFieldName = dropAbove.querySelector('.cat-text').textContent.toLowerCase().replace(/\s+/g, '');
      const dropIndex = newOrder.findIndex((f) => f.name.toLowerCase().replace(/\s+/g, '') === dropFieldName);
      if (dropIndex !== -1) {
        newOrder.splice(dropIndex, 0, removed);
      } else {
        // If we can't find the drop target, put it back at original position
        newOrder.splice(draggedIndex, 0, removed);
      }
    } else if (dropBelow) {
      const dropFieldName = dropBelow.querySelector('.cat-text').textContent.toLowerCase().replace(/\s+/g, '');
      const dropIndex = newOrder.findIndex((f) => f.name.toLowerCase().replace(/\s+/g, '') === dropFieldName);
      if (dropIndex !== -1) {
        newOrder.splice(dropIndex + 1, 0, removed);
      } else {
        // If we can't find the drop target, put it back at original position
        newOrder.splice(draggedIndex, 0, removed);
      }
    } else {
      // No drop indicator found, put item back at original position
      newOrder.splice(draggedIndex, 0, removed);
    }

    // Update ordinals and save
    this.eventFields = newOrder.map((field, index) => ({ ...field, ordinal: index }));
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
                <div class="selected-options">
                  <table class="field-config-table">
                    <tbody @dragover=${RsvpForm.handleOptionsDragOver}>
                      ${repeat(this.editingField.values || [], (option) => option, (option) => html`
                        <tr class="field-option-item" draggable="true"
                          @dragstart=${RsvpForm.dragAndReorderOptions(option)}
                          @dragend=${this.handleOptionsDragEnd}>
                          <td><span>${option.label}</span></td>
                          <td>
                            <div class="field-config-container">
                              <button class="field-config-button" aria-label="Remove option" @click=${() => this.moveOptionToUnselected(option)}>
                                <img src="/ecc/icons/eye-wire.svg" alt="Remove option">
                              </button>
                              <button class="field-config-button" aria-label="Drag option">
                                <img src="/ecc/icons/drag-dots.svg" alt="Drag option">
                              </button>
                            </div>
                          </td>
                        </tr>
                      `)}
                    </tbody>
                  </table>
                </div>
                <div class="unselected-options">
                  <table class="field-config-table">
                    <tbody>
                      ${repeat(
    (this.data.find((f) => f.name === this.editingField.name)?.values || [])
      .filter((option) => !this.editingField.values?.some(
        (selected) => selected.value === option.value,
      )),
    (option) => option.value,
    (option) => html`
                          <tr class="field-option-item">
                            <td><span>${option.label}</span></td>
                            <td>
                              <div class="field-config-container">
                                <button class="field-config-button" aria-label="Add option" @click=${() => this.moveOptionToSelected(option)}>
                                  <img src="/ecc/icons/eye-slash-wire.svg" alt="Add option">
                                </button>
                              </div>
                            </td>
                          </tr>
                        `,
  )}
                    </tbody>
                  </table>
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
      <div class="rsvp-fields">
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
    const regPayload = this.getRegistrationPayload();
    console.log('regPayload', regPayload);
    // due to the dynamic data fetching based on the cloud type,
    // we need to handle the case where the data is not yet available.
    if (!this.data) return html`<div class="rsvp-form"></div>`;

    if (this.eventType === EVENT_TYPES.WEBINAR) {
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
    const tbody = e.target.closest('tbody');
    if (!tbody) return;

    const draggingElement = tbody.querySelector('.dragging');
    if (!draggingElement) return;

    // Clear existing drop indicators
    tbody.querySelectorAll('.field-option-item').forEach((item) => {
      item.classList.remove('drop-above', 'drop-below');
    });

    const siblings = [...tbody.querySelectorAll('.field-option-item:not(.dragging)')];
    const nextSibling = siblings.find((sibling) => {
      const box = sibling.getBoundingClientRect();
      const offset = e.clientY - box.top - box.height / 2;
      return offset < 0;
    });

    if (nextSibling) {
      nextSibling.classList.add('drop-above');
    } else if (siblings.length > 0) {
      siblings[siblings.length - 1].classList.add('drop-below');
    }
  }

  handleOptionsDragEnd(e) {
    const tbody = e.target.closest('tbody');
    if (!tbody) return;

    const draggingElement = tbody.querySelector('.dragging');
    if (!draggingElement) return;

    // Calculate new order based on drop indicators
    const draggedLabel = draggingElement.querySelector('span').textContent;
    const draggedOption = this.editingField.values.find((v) => v.label === draggedLabel);

    if (!draggedOption) return;

    // Read drop indicators BEFORE clearing them
    const dropAbove = tbody.querySelector('.drop-above');
    const dropBelow = tbody.querySelector('.drop-below');

    // Clear all drag states and indicators
    draggingElement.classList.remove('dragging');
    tbody.querySelectorAll('.field-option-item').forEach((item) => {
      item.classList.remove('drop-above', 'drop-below');
    });

    const newOrder = [...this.editingField.values];
    const draggedIndex = newOrder.findIndex((v) => v.label === draggedLabel);

    if (draggedIndex === -1) return;

    // Remove dragged item from current position
    const [removed] = newOrder.splice(draggedIndex, 1);

    if (dropAbove) {
      const dropLabel = dropAbove.querySelector('span').textContent;
      const dropIndex = newOrder.findIndex((v) => v.label === dropLabel);
      if (dropIndex !== -1) {
        newOrder.splice(dropIndex, 0, removed);
      } else {
        // If we can't find the drop target, put it back at original position
        newOrder.splice(draggedIndex, 0, removed);
      }
    } else if (dropBelow) {
      const dropLabel = dropBelow.querySelector('span').textContent;
      const dropIndex = newOrder.findIndex((v) => v.label === dropLabel);
      if (dropIndex !== -1) {
        newOrder.splice(dropIndex + 1, 0, removed);
      } else {
        // If we can't find the drop target, put it back at original position
        newOrder.splice(draggedIndex, 0, removed);
      }
    } else {
      // No drop indicator found, put item back at original position
      newOrder.splice(draggedIndex, 0, removed);
    }

    // Update ordinals and save
    this.editingField.values = newOrder.map((option, index) => ({ ...option, ordinal: index }));
    this.requestUpdate();
  }

  moveOptionToSelected(option) {
    if (!this.editingField.values) {
      this.editingField.values = [];
    }
    const newOption = {
      ...option,
      ordinal: this.editingField.values.length,
    };
    this.editingField.values = [...this.editingField.values, newOption];
    this.requestUpdate();
  }

  moveOptionToUnselected(option) {
    this.editingField.values = this.editingField.values
      .filter((o) => o.value !== option.value)
      .map((o, index) => ({
        ...o,
        ordinal: index,
      }));
    this.requestUpdate();
  }
}
