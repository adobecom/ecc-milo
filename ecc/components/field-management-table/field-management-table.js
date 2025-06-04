import { LIBS } from '../../scripts/scripts.js';
import style from './field-management-table.css.js';
import { getIcon } from '../../scripts/utils.js';

const { LitElement, html, repeat, render, nothing } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class FieldManagementTable extends LitElement {
  static styles = style;

  static properties = {
    config: { type: Object },
    fields: { type: Array },
    pendingChanges: { type: Boolean },
    toastState: { type: Object },
    changedFields: { type: Set },
    originalFields: { type: Map },
    selectedTemplate: { type: Object },
    dialogContent: { type: Object },
    dialogTitle: { type: String },
    isDialogOpen: { type: Boolean },
  };

  constructor() {
    super();
    this.fields = [];
    this.pendingChanges = false;
    this.config = {};
    this.changedFields = new Set();
    this.originalFields = new Map();
    this.selectedTemplate = null;
    this.dialogContent = null;
    this.dialogTitle = '';
    this.isDialogOpen = false;
  }

  firstUpdated() {
    this.toast = this.shadowRoot.querySelector('sp-toast');
    // Load initial fields from mock-fields.json
    this.loadFields();

    // Set up dialog content container
    const spTheme = this.closest('sp-theme');
    if (spTheme) {
      const dialog = spTheme.querySelector('sp-dialog');
      if (dialog) {
        this.dialogContentContainer = document.createElement('div');
        dialog.appendChild(this.dialogContentContainer);
      }
    }
  }

  async loadFields() {
    try {
      const response = await fetch('/ecc/components/rsvp-form/mock-fields.json');
      const data = await response.json();
      this.fields = data[0].localization['en-US'].map((field, index) => ({
        ...field,
        ordinal: index,
        id: `field-${index}-${Date.now()}`,
      }));
      // Store original states after loading
      this.originalFields = new Map(this.fields.map((field) => [field.id, { ...field }]));
      this.requestUpdate();
    } catch (error) {
      window.lana?.log(`Error loading fields: ${JSON.stringify(error)}`);
    }
  }

  togglePendingChanges() {
    // Implement change detection logic here
    this.pendingChanges = true;
    this.requestUpdate();
  }

  isFieldChanged(field) {
    const originalField = this.originalFields.get(field.id);
    if (!originalField) return false;

    // Compare basic properties
    if (field.name !== originalField.name
        || field.type !== originalField.type
        || field.mandatory !== originalField.mandatory
        || field.placeholder !== originalField.placeholder) {
      return true;
    }

    // Compare list values if present
    if (field.type === 'list') {
      // Check if both have values
      if (!field.values && !originalField.values) return false;
      if (!field.values || !originalField.values) return true;
      if (field.values.length !== originalField.values.length) return true;

      // Deep compare each value/label pair
      return field.values.some((value, index) => {
        const originalValue = originalField.values[index];
        if (!originalValue) return true;
        return value.value !== originalValue.value || value.label !== originalValue.label;
      });
    }

    return false;
  }

  toggleFieldChange(field) {
    if (this.isFieldChanged(field)) {
      this.changedFields.add(field.id);
    } else {
      this.changedFields.delete(field.id);
    }
    this.requestUpdate();
  }

  resetField(field) {
    // Reset the field to its original state using the unique ID
    const originalField = this.originalFields.get(field.id);
    if (originalField) {
      Object.assign(field, { ...originalField });
      this.changedFields.delete(field.id);
      this.requestUpdate();
    }
  }

  handleFieldEdit(field) {
    const spTheme = this.closest('sp-theme');
    if (!spTheme) return;

    const underlay = spTheme.querySelector('sp-underlay');
    const dialog = spTheme.querySelector('sp-dialog');

    this.dialogTitle = 'Edit Field';
    this.isDialogOpen = true;
    this.dialogContent = html`
      <div class="form-container">
        <div class="field-container">
          <sp-field-label size="l">Field Name</sp-field-label>
          <sp-textfield
            value=${field.name}
            style="width: 100%"
            required
          ></sp-textfield>
        </div>

        <div class="field-container">
          <sp-field-label size="l">Field Type</sp-field-label>
          <sp-textfield
            value=${field.type}
            style="width: 100%"
            disabled
          ></sp-textfield>
        </div>

        <div class="field-container inline">
          <sp-field-label size="l">Mandatory Field (Must be included in RSVP forms using this template)</sp-field-label>
          <sp-switch ?checked=${field.mandatory}></sp-switch>
        </div>

        <div class="field-container">
          <sp-field-label size="l">Placeholder Text</sp-field-label>
          <sp-textfield
            value=${field.placeholder || ''}
            style="width: 100%"
          ></sp-textfield>
        </div>

        ${field.type === 'list' ? html`
          <div class="field-container">
            <sp-field-label size="l">List Options</sp-field-label>
            ${(field.values || []).map((option) => html`
              <div class="option-row">
                <div class="option-row-container">
                  <div class="option-row-container-item">
                    <sp-field-label size="l">Option Value</sp-field-label>
                    <sp-textfield
                      value=${option.value}
                      placeholder="Option value"
                    ></sp-textfield>
                  </div>
                  <div class="option-row-container-item">
                    <sp-field-label size="l">Option Label</sp-field-label>
                    <sp-textfield
                      value=${option.label}
                      placeholder="Option label"
                    ></sp-textfield>
                  </div>
                </div>
                <sp-action-button variant="negative" @click=${(e) => e.target.closest('.option-row').remove()}>
                  ${getIcon('delete-wire-round')}
                </sp-action-button>
              </div>
            `)}
            ${this.addOptionRow()}
          </div>
        ` : ''}

        <div class="button-container">
          <sp-button variant="secondary" slot="button" @click=${() => {
            underlay.open = false;
            this.isDialogOpen = false;
            this.dialogContent = null;
          }}>Cancel</sp-button>
          <sp-button variant="primary" slot="button" @click=${() => {
            // Store original state before making changes
            if (!this.originalFields.has(field.id)) {
              this.originalFields.set(field.id, { ...field });
            }

            // Update field properties
            field.name = dialog.querySelector('sp-textfield').value;
            field.mandatory = dialog.querySelector('sp-switch').checked;
            field.placeholder = dialog.querySelectorAll('sp-textfield')[2].value;

            if (field.type === 'list') {
              const optionRows = dialog.querySelectorAll('.option-row');
              field.values = Array.from(optionRows).map((row, index) => {
                const [valueInput, labelInput] = row.querySelectorAll('sp-textfield');
                return {
                  value: valueInput.value,
                  label: labelInput.value,
                  ordinal: index,
                };
              });
            }

            this.toggleFieldChange(field);
            underlay.open = false;
            this.isDialogOpen = false;
            this.dialogContent = null;
          }}>Save Changes</sp-button>
        </div>
      </div>
    `;

    // Set dialog heading and content
    const heading = document.createElement('h1');
    heading.setAttribute('slot', 'heading');
    heading.textContent = this.dialogTitle;
    dialog.appendChild(heading);
    render(this.dialogContent, this.dialogContentContainer);
    underlay.open = true;
  }

  handleFieldDelete(field) {
    const spTheme = this.closest('sp-theme');
    if (!spTheme) return;

    const underlay = spTheme.querySelector('sp-underlay');
    const dialog = spTheme.querySelector('sp-dialog');

    this.dialogTitle = 'Delete Field';
    this.isDialogOpen = true;
    this.dialogContent = html`
      <p>Are you sure you want to delete "${field.name}"? This cannot be undone.</p>
      <div class="button-container">
        <sp-button variant="secondary" slot="button" @click=${() => {
          underlay.open = false;
          this.isDialogOpen = false;
          this.dialogContent = null;
        }}>Cancel</sp-button>
        <sp-button variant="negative" slot="button" @click=${() => {
          // Store original state before deletion
          if (!this.originalFields.has(field.id)) {
            this.originalFields.set(field.id, { ...field });
          }
          this.fields = this.fields.filter((f) => f.id !== field.id);
          this.changedFields.delete(field.id);
          underlay.open = false;
          this.isDialogOpen = false;
          this.dialogContent = null;
          this.requestUpdate();
        }}>Delete</sp-button>
      </div>
    `;

    // Set dialog heading and content
    const heading = document.createElement('h1');
    heading.setAttribute('slot', 'heading');
    heading.textContent = this.dialogTitle;
    dialog.appendChild(heading);
    render(this.dialogContent, this.dialogContentContainer);
    underlay.open = true;
  }

  addOptionRow() {
    const spTheme = this.closest('sp-theme');
    if (!spTheme) return nothing;

    const dialog = spTheme.querySelector('sp-dialog');

    return html`
      <div class="option-row">
        <div class="option-row-container">
          <div class="option-row-container-item">
            <sp-field-label size="l">Option Value</sp-field-label>
            <sp-textfield placeholder="Option value"></sp-textfield>
          </div>
          <div class="option-row-container-item">
            <sp-field-label size="l">Option Label</sp-field-label>
            <sp-textfield placeholder="Option label"></sp-textfield>
          </div>
        </div>
        <sp-action-button variant="negative" @click>${getIcon('delete-wire-round')}</sp-action-button>
      </div>
      <sp-button
        variant="secondary"
        size="m"
        @click=${() => {
    dialog.querySelector('.list-options').appendChild(this.addOptionRow());
  }}
      >Add Option</sp-button>
    `;
  }

  handleFieldAdd() {
    const spTheme = this.closest('sp-theme');
    if (!spTheme) return;

    const underlay = spTheme.querySelector('sp-underlay');
    const dialog = spTheme.querySelector('sp-dialog');

    this.dialogTitle = 'Add New Field';
    this.isDialogOpen = true;
    this.dialogContent = html`
      <div class="form-container">
        <div class="field-container">
          <sp-field-label size="l">Field Name</sp-field-label>
          <sp-textfield
            placeholder="Enter field name"
            style="width: 100%"
            required
          ></sp-textfield>
        </div>

        <div class="field-container">
          <sp-field-label size="l">Field Type</sp-field-label>
          <sp-picker
            style="width: 100%"
            @change=${(e) => {
              const type = e.target.value;
              const listOptionsContainer = dialog.querySelector('.list-options-container');
              if (listOptionsContainer) {
                listOptionsContainer.style.display = type === 'list' ? 'block' : 'none';
              }
            }}
          >
            <sp-menu-item value="text">Text</sp-menu-item>
            <sp-menu-item value="number">Number</sp-menu-item>
            <sp-menu-item value="email">Email</sp-menu-item>
            <sp-menu-item value="tel">Phone</sp-menu-item>
            <sp-menu-item value="list">List</sp-menu-item>
          </sp-picker>
        </div>

        <div class="field-container inline">
          <sp-field-label size="l">Mandatory Field</sp-field-label>
          <sp-switch></sp-switch>
        </div>

        <div class="field-container">
          <sp-field-label size="l">Placeholder Text</sp-field-label>
          <sp-textfield
            placeholder="Enter placeholder text"
            style="width: 100%"
          ></sp-textfield>
        </div>

        <div class="field-container list-options-container" style="display: none;">
          <sp-field-label size="l">List Options</sp-field-label>
          <div class="list-options">
            <div class="option-row">
              <div class="option-row-container">
                <div class="option-row-container-item">
                  <sp-field-label size="l">Option Value</sp-field-label>
                  <sp-textfield placeholder="Option value"></sp-textfield>
                </div>
                <div class="option-row-container-item">
                  <sp-field-label size="l">Option Label</sp-field-label>
                  <sp-textfield placeholder="Option label"></sp-textfield>
                </div>
              </div>
              <sp-action-button variant="negative" @click=${(e) => e.target.closest('.option-row').remove()}>
                ${getIcon('delete-wire-round')}
              </sp-action-button>
            </div>
          </div>
          ${this.addOptionRow()}
        </div>

        <div class="button-container">
          <sp-button
            variant="secondary"
            slot="button"
            @click=${() => {
              underlay.open = false;
              this.isDialogOpen = false;
              this.dialogContent = null;
            }}
          >Cancel</sp-button>
          <sp-button
            variant="primary"
            slot="button"
            @click=${() => {
              const name = dialog.querySelector('sp-textfield').value.trim();
              const type = dialog.querySelector('sp-picker').value;
              const mandatory = dialog.querySelector('sp-switch').checked;
              const placeholder = dialog.querySelectorAll('sp-textfield')[1].value.trim();

              if (name) {
                const newField = {
                  name,
                  type,
                  placeholder,
                  mandatory,
                  ordinal: this.fields.length,
                  id: `field-${this.fields.length}-${Date.now()}`,
                };

                if (type === 'list') {
                  const optionRows = dialog.querySelectorAll('.option-row');
                  newField.values = Array.from(optionRows).map((row, index) => {
                    const [valueInput, labelInput] = row.querySelectorAll('sp-textfield');
                    return {
                      value: valueInput.value,
                      label: labelInput.value,
                      ordinal: index,
                    };
                  });
                }

                this.fields = [...this.fields, newField];
                this.originalFields.set(newField.id, { ...newField });
                this.changedFields.add(newField.id);
                underlay.open = false;
                this.isDialogOpen = false;
                this.dialogContent = null;
                this.requestUpdate();
              }
            }}
          >Add Field</sp-button>
        </div>
      </div>
    `;

    // Set dialog heading and content
    const heading = document.createElement('h1');
    heading.setAttribute('slot', 'heading');
    heading.textContent = this.dialogTitle;
    dialog.appendChild(heading);
    render(this.dialogContent, this.dialogContentContainer);
    underlay.open = true;
  }

  handleTemplateSelect(e) {
    const { template } = e.detail;
    this.selectedTemplate = template;
    if (template) {
      this.fields = template.fields.map((field, index) => ({
        ...field,
        ordinal: index,
        id: `field-${index}-${Date.now()}`,
      }));
      this.originalFields = new Map(this.fields.map((field) => [field.id, { ...field }]));
      this.changedFields.clear();
      this.togglePendingChanges();
    } else {
      // Template was deselected (deleted)
      this.fields = [];
      this.originalFields.clear();
      this.changedFields.clear();
      this.togglePendingChanges();
    }
  }

  showToast(message, variant = 'positive') {
    const spTheme = this.closest('sp-theme');
    if (!spTheme) return;

    const toastContent = html`
      <sp-toast
        variant=${variant}
        size="m"
        timeout="6000"
        open
        @close=${(e) => e.target.remove()}
      >${message}</sp-toast>
    `;

    render(toastContent, spTheme);
  }

  async save() {
    if (!this.selectedTemplate) {
      // Show dialog to get template name
      const spTheme = this.closest('sp-theme');
      if (!spTheme) return;

      const underlay = spTheme.querySelector('sp-underlay');
      const dialog = spTheme.querySelector('sp-dialog');

      // Clear any existing content
      dialog.innerHTML = '';

      // Create the dialog content
      const heading = document.createElement('h1');
      heading.setAttribute('slot', 'heading');
      heading.textContent = 'Save as New Template';
      dialog.appendChild(heading);

      const dialogContent = html`
        <div style="margin-bottom: 16px">
          <sp-textfield
            placeholder="Enter template name"
            style="width: 100%"
          ></sp-textfield>
        </div>
        <div class="button-container">
          <sp-button
            variant="secondary"
            slot="button"
            @click=${() => {
    underlay.open = false;
    dialog.innerHTML = '';
  }}
          >Cancel</sp-button>
          <sp-button
            variant="primary"
            slot="button"
            @click=${() => {
    const templateName = dialog.querySelector('sp-textfield').value.trim();
    if (templateName) {
      // Create a new template
      const newTemplate = {
        id: `template-${Date.now()}`,
        name: templateName,
        fields: this.fields.map((field) => ({
          ...field,
          values: field.type === 'list' && field.values
            ? field.values.map((value, index) => ({
              ...value,
              ordinal: index,
            }))
            : field.values,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Get the field-templates component and use its public API
      const fieldTemplates = this.shadowRoot.querySelector('field-templates');
      if (fieldTemplates?.addTemplate(newTemplate)) {
        // Update original fields to match new state
        this.originalFields = new Map(this.fields.map((field) => [field.id, { ...field }]));
        this.changedFields.clear();
        this.selectedTemplate = newTemplate;
        this.requestUpdate();

        this.showToast('New template created successfully');
        underlay.open = false;
        dialog.innerHTML = '';
      }
    }
  }}
          >Save</sp-button>
        </div>
      `;

      // Create a container for the dialog content
      const contentContainer = document.createElement('div');
      dialog.appendChild(contentContainer);
      render(dialogContent, contentContainer);
      underlay.open = true;
      return;
    }

    try {
      // Create a deep copy of fields with preserved ordinal values
      const fieldsWithOrdinals = this.fields.map((field) => ({
        ...field,
        values: field.type === 'list' && field.values
          ? field.values.map((value, index) => ({
            ...value,
            ordinal: index,
          }))
          : field.values,
      }));

      // Update the selected template
      this.selectedTemplate.fields = fieldsWithOrdinals;
      this.selectedTemplate.updatedAt = new Date().toISOString();

      // Update original fields to match new state
      this.originalFields = new Map(this.fields.map((field) => [field.id, { ...field }]));
      this.changedFields.clear();
      this.requestUpdate();

      this.showToast('Changes saved successfully');
    } catch (error) {
      window.lana?.log(`Error saving template: ${JSON.stringify(error)}`);
      this.showToast('Error saving changes', 'negative');
    }
  }

  resetForm() {
    this.loadFields();
    this.changedFields.clear();
  }

  render() {
    return html`
      <div class="form-container">
        <div class="header">
          <div>
            <h1>RSVP Form Management</h1>
          </div>
        </div>

        <div class="content">
          <field-templates
            @template-select=${this.handleTemplateSelect}
            .fields=${this.fields}
            .spTheme=${this.closest('sp-theme')}
          ></field-templates>

          <div class="form-section">
            <div class="section-header">
              <h2>Form Fields</h2>
              <div class="button-container">
                <sp-button 
                  variant="secondary" 
                  size="m" 
                  ?disabled=${this.changedFields.size === 0} 
                  @click=${this.resetForm}
                >
                  Cancel
                </sp-button>
                <sp-button 
                  variant="primary" 
                  size="m" 
                  ?disabled=${this.changedFields.size === 0} 
                  @click=${this.save}
                >
                  ${this.selectedTemplate ? 'Save Changes' : 'Save as New Template'}
                </sp-button>
                <span class="divider"></span>
                <sp-button variant="primary" size="m" @click=${this.handleFieldAdd}>
                  Add Field
                </sp-button>
              </div>  
            </div>

            <div class="fields-table">
              <table>
                <thead>
                  <tr>
                    <th>Field Name</th>
                    <th>Type</th>
                    <th>Mandatory</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${repeat(this.fields, (field) => field.id, (field) => html`
                    <tr class="field-row ${this.changedFields.has(field.id) ? 'edited' : ''}">
                      <td>
                        ${field.name}
                      </td>
                      <td>${field.type}</td>
                      <td>
                        <sp-switch
                          ?checked=${field.mandatory}
                          @change=${(e) => {
                            field.mandatory = e.target.checked;
                            this.toggleFieldChange(field);
                          }}
                        ></sp-switch>
                      </td>
                      <td>
                        <div class="actions">
                          <sp-action-button @click=${() => this.handleFieldEdit(field)}>
                            ${getIcon('edit-pencil')}
                          </sp-action-button>
                          <sp-action-button @click=${() => this.handleFieldDelete(field)}>
                            ${getIcon('delete-wire-round')}
                          </sp-action-button>
                          <sp-action-button ?disabled=${!this.changedFields.has(field.id)} @click=${() => this.resetField(field)}>
                            ${getIcon('revert')}
                          </sp-action-button>
                        </div>
                      </td>
                    </tr>
                  `)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
