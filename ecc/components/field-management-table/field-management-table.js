import { LIBS } from '../../scripts/scripts.js';
import style from './field-management-table.css.js';
import { getIcon } from '../../scripts/utils.js';

const { LitElement, html, repeat, render } = await import(`${LIBS}/deps/lit-all.min.js`);

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
    tempOptionList: { type: Array },
    currentFieldId: { type: String },
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
    this.tempOptionList = [];
    this.currentFieldId = null;
  }

  firstUpdated() {
    this.toast = this.shadowRoot.querySelector('sp-toast');
    // Load initial fields from mock-fields.json
    this.loadFields();
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

  addOptionRow() {
    const newOption = {
      value: '',
      label: '',
      ordinal: this.tempOptionList.length,
      isNew: true,
    };
    this.tempOptionList = [...this.tempOptionList, newOption];

    // Check if we're editing an existing field or adding a new field
    if (this.currentFieldId) {
      // Editing existing field - use updateDialogContent
      this.updateDialogContent();
    } else {
      // Adding new field - regenerate the add field dialog
      this.regenerateAddFieldDialog();
    }
  }

  removeOptionRow(index) {
    this.tempOptionList = this.tempOptionList.filter((_, i) => i !== index);

    // Check if we're editing an existing field or adding a new field
    if (this.currentFieldId) {
      // Editing existing field - use updateDialogContent
      this.updateDialogContent();
    } else {
      // Adding new field - regenerate the add field dialog
      this.regenerateAddFieldDialog();
    }
  }

    regenerateAddFieldDialog() {
    if (!this.isDialogOpen) return;
    
    // Capture current form values before regenerating
    const dialog = this.shadowRoot.querySelector('sp-dialog');
    let currentName = '';
    let currentType = '';
    let currentMandatory = false;
    let currentPlaceholder = '';
    
    if (dialog) {
      const nameField = dialog.querySelector('sp-textfield');
      const typeField = dialog.querySelector('sp-picker');
      const mandatoryField = dialog.querySelector('sp-switch');
      const placeholderField = dialog.querySelectorAll('sp-textfield')[1];
      
      currentName = nameField?.value || '';
      currentType = typeField?.value || '';
      currentMandatory = mandatoryField?.checked || false;
      currentPlaceholder = placeholderField?.value || '';
    }
    
    this.dialogContent = html`
      <div class="form-container">
        <div class="field-container">
          <sp-field-label size="l">Field Name</sp-field-label>
          <sp-textfield
            value=${currentName}
            placeholder="Enter field name"
            style="width: 100%"
            required
          ></sp-textfield>
        </div>

        <div class="field-container">
          <sp-field-label size="l">Field Type</sp-field-label>
          <sp-picker
            value=${currentType}
            style="width: 100%"
            @change=${(e) => {
    const type = e.target.value;
    const listOptionsContainer = this.shadowRoot.querySelector('.list-options-container');
    if (listOptionsContainer) {
      listOptionsContainer.style.display = type === 'list' ? 'block' : 'none';
    }
  }}
          >
            <sp-menu-item value="text" ?selected=${currentType === 'text'}>Text</sp-menu-item>
            <sp-menu-item value="number" ?selected=${currentType === 'number'}>Number</sp-menu-item>
            <sp-menu-item value="email" ?selected=${currentType === 'email'}>Email</sp-menu-item>
            <sp-menu-item value="tel" ?selected=${currentType === 'tel'}>Phone</sp-menu-item>
            <sp-menu-item value="list" ?selected=${currentType === 'list'}>List</sp-menu-item>
          </sp-picker>
        </div>

        <div class="field-container inline">
          <sp-field-label size="l">Mandatory Field</sp-field-label>
          <sp-switch ?checked=${currentMandatory}></sp-switch>
        </div>

        <div class="field-container">
          <sp-field-label size="l">Placeholder Text</sp-field-label>
          <sp-textfield
            value=${currentPlaceholder}
            placeholder="Enter placeholder text"
            style="width: 100%"
          ></sp-textfield>
        </div>

        <div class="field-container list-options-container" style="display: ${currentType === 'list' ? 'block' : 'none'};">
          <sp-field-label size="l">List Options</sp-field-label>
          <div class="list-options">
            ${this.tempOptionList.map((option, index) => html`
              <div class="option-row">
                <div class="option-row-container">
                  <div class="option-row-container-item">
                    <sp-field-label size="l">Option Value</sp-field-label>
                    <sp-textfield
                      value=${option.value || ''}
                      placeholder="Option value"
                      @input=${(e) => {
    this.tempOptionList[index].value = e.target.value;
    this.requestUpdate();
  }}
                    ></sp-textfield>
                  </div>
                  <div class="option-row-container-item">
                    <sp-field-label size="l">Option Label</sp-field-label>
                    <sp-textfield
                      value=${option.label || ''}
                      placeholder="Option label"
                      @input=${(e) => {
    this.tempOptionList[index].label = e.target.value;
    this.requestUpdate();
  }}
                    ></sp-textfield>
                  </div>
                </div>
                <sp-action-button variant="negative" @click=${() => this.removeOptionRow(index)}>
                  ${getIcon('delete-wire-round')}
                </sp-action-button>
              </div>
            `)}
            <sp-button
              variant="secondary"
              size="m"
              @click=${() => this.addOptionRow()}
            >Add Option</sp-button>
          </div>
        </div>

        <div class="button-container">
          <sp-button
            variant="secondary"
            slot="button"
            @click=${() => {
    this.isDialogOpen = false;
    this.dialogContent = null;
    this.tempOptionList = [];
    this.requestUpdate();
  }}
          >Cancel</sp-button>
          <sp-button
            variant="primary"
            slot="button"
            @click=${() => {
    const dialog = this.shadowRoot.querySelector('sp-dialog');
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
        newField.values = this.tempOptionList.map((option, index) => ({
          value: option.value,
          label: option.label,
          ordinal: index,
        }));
      }

      this.fields = [...this.fields, newField];
      this.originalFields.set(newField.id, { ...newField });
      this.changedFields.add(newField.id);
      this.isDialogOpen = false;
      this.dialogContent = null;
      this.tempOptionList = [];
      this.requestUpdate();
    }
  }}
          >Add Field</sp-button>
        </div>
      </div>
    `;
    this.requestUpdate();
  }

  updateDialogContent() {
    if (!this.isDialogOpen) return;

    const field = this.fields.find((f) => f.id === this.currentFieldId);
    if (!field) return;

    this.dialogContent = html`
      <div class="form-container in-dialog">
        <div class="field-container">
          <sp-field-label size="l" class="field-header">Field Name</sp-field-label>
          <sp-textfield
            value=${field.name}
            style="width: 100%"
            required
          ></sp-textfield>
        </div>

        <div class="field-container">
          <sp-field-label size="l" class="field-header">Field Type</sp-field-label>
          <sp-textfield
            value=${field.type}
            style="width: 100%"
            disabled
          ></sp-textfield>
        </div>

        <div class="field-container inline">
          <sp-field-label size="l" class="field-header">Mandatory Field (Must be included in RSVP forms using this template)</sp-field-label>
          <sp-switch ?checked=${field.mandatory}></sp-switch>
        </div>

        <div class="field-container">
          <sp-field-label size="l" class="field-header">Placeholder Text</sp-field-label>
          <sp-textfield
            value=${field.placeholder || ''}
            style="width: 100%"
          ></sp-textfield>
        </div>

        ${field.type === 'list' ? html`
          <div class="field-container list-options">
            <sp-field-label size="l" class="field-header">List Options</sp-field-label>
            ${this.tempOptionList.map((option, index) => html`
              <div class="option-row">
                <div class="option-row-container">
                  <div class="option-row-container-item">
                    <sp-field-label size="l">Option Value</sp-field-label>
                    <sp-textfield
                      value=${option.value}
                      placeholder="Option value"
                      @input=${(e) => {
    this.tempOptionList[index].value = e.target.value;
    this.updateDialogContent();
  }}
                    ></sp-textfield>
                  </div>
                  <div class="option-row-container-item">
                    <sp-field-label size="l">Option Label</sp-field-label>
                    <sp-textfield
                      value=${option.label}
                      placeholder="Option label"
                      @input=${(e) => {
    this.tempOptionList[index].label = e.target.value;
    this.updateDialogContent();
  }}
                    ></sp-textfield>
                  </div>
                </div>
                <sp-action-button variant="negative" @click=${() => this.removeOptionRow(index)}>
                  ${getIcon('delete-wire-round')}
                </sp-action-button>
              </div>
            `)}
            <sp-button
              variant="secondary"
              size="m"
              @click=${() => this.addOptionRow()}
            >Add Option</sp-button>
          </div>
        ` : ''}

        <div class="button-container">
          <sp-button variant="secondary" slot="button" @click=${() => {
    this.isDialogOpen = false;
    this.dialogContent = null;
    this.tempOptionList = [];
    this.currentFieldId = null;
    this.requestUpdate();
  }}>Cancel</sp-button>
          <sp-button variant="primary" slot="button" @click=${() => {
    // Store original state before making changes
    if (!this.originalFields.has(field.id)) {
      this.originalFields.set(field.id, { ...field });
    }

    const dialog = this.shadowRoot.querySelector('sp-dialog');
    // Update field properties
    field.name = dialog.querySelector('sp-textfield').value;
    field.mandatory = dialog.querySelector('sp-switch').checked;
    field.placeholder = dialog.querySelectorAll('sp-textfield')[2].value;

    if (field.type === 'list') {
      field.values = this.tempOptionList.map((option, index) => ({
        value: option.value,
        label: option.label,
        ordinal: index,
      }));
    }

    this.toggleFieldChange(field);
    this.isDialogOpen = false;
    this.dialogContent = null;
    this.tempOptionList = [];
    this.currentFieldId = null;
    this.requestUpdate();
  }}>Save Changes</sp-button>
        </div>
      </div>
    `;
    this.requestUpdate();
  }

  handleFieldEdit(field) {
    // Store the current field ID for updates
    this.currentFieldId = field.id;

    // Initialize temp option list with existing values
    this.tempOptionList = (field.values || []).map((option, index) => ({
      ...option,
      ordinal: index,
      isNew: false,
    }));

    this.dialogTitle = 'Edit Field';
    this.isDialogOpen = true;
    this.updateDialogContent();
  }

  handleFieldDelete(field) {
    this.dialogTitle = 'Delete Field';
    this.isDialogOpen = true;
    this.dialogContent = html`
      <p>Are you sure you want to delete "${field.name}"? This cannot be undone.</p>
      <div class="button-container">
        <sp-button variant="secondary" slot="button" @click=${() => {
    this.isDialogOpen = false;
    this.dialogContent = null;
    this.tempOptionList = [];
  }}>Cancel</sp-button>
        <sp-button variant="negative" slot="button" @click=${() => {
    // Store original state before deletion
    if (!this.originalFields.has(field.id)) {
      this.originalFields.set(field.id, { ...field });
    }
    this.fields = this.fields.filter((f) => f.id !== field.id);
    this.changedFields.delete(field.id);
    this.isDialogOpen = false;
    this.dialogContent = null;
    this.tempOptionList = [];
    this.requestUpdate();
  }}>Delete</sp-button>
      </div>
    `;
    this.requestUpdate();
  }

  handleFieldAdd() {
    // Initialize empty temp option list
    this.tempOptionList = [];

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
    const listOptionsContainer = this.shadowRoot.querySelector('.list-options-container');
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
            ${this.tempOptionList.map((option, index) => html`
              <div class="option-row">
                <div class="option-row-container">
                  <div class="option-row-container-item">
                    <sp-field-label size="l">Option Value</sp-field-label>
                    <sp-textfield
                      placeholder="Option value"
                      @input=${(e) => {
    this.tempOptionList[index].value = e.target.value;
    this.requestUpdate();
  }}
                    ></sp-textfield>
                  </div>
                  <div class="option-row-container-item">
                    <sp-field-label size="l">Option Label</sp-field-label>
                    <sp-textfield
                      placeholder="Option label"
                      @input=${(e) => {
    this.tempOptionList[index].label = e.target.value;
    this.requestUpdate();
  }}
                    ></sp-textfield>
                  </div>
                </div>
                <sp-action-button variant="negative" @click=${() => this.removeOptionRow(index)}>
                  ${getIcon('delete-wire-round')}
                </sp-action-button>
              </div>
            `)}
            <sp-button
              variant="secondary"
              size="m"
              @click=${() => this.addOptionRow()}
            >Add Option</sp-button>
          </div>
        </div>

        <div class="button-container">
          <sp-button
            variant="secondary"
            slot="button"
            @click=${() => {
    this.isDialogOpen = false;
    this.dialogContent = null;
    this.tempOptionList = [];
  }}
          >Cancel</sp-button>
          <sp-button
            variant="primary"
            slot="button"
            @click=${() => {
    const dialog = this.shadowRoot.querySelector('sp-dialog');
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
        newField.values = this.tempOptionList.map((option, index) => ({
          value: option.value,
          label: option.label,
          ordinal: index,
        }));
      }

      this.fields = [...this.fields, newField];
      this.originalFields.set(newField.id, { ...newField });
      this.changedFields.add(newField.id);
      this.isDialogOpen = false;
      this.dialogContent = null;
      this.tempOptionList = [];
      this.requestUpdate();
    }
  }}
          >Add Field</sp-button>
        </div>
      </div>
    `;
    this.requestUpdate();
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
    const toastContent = html`
      <sp-toast
        variant=${variant}
        size="m"
        timeout="6000"
        open
        @close=${(e) => e.target.remove()}
      >${message}</sp-toast>
    `;

    // Create a container for the toast if it doesn't exist
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.shadowRoot.appendChild(this.toastContainer);
    }
    render(toastContent, this.toastContainer);
  }

  async saveAs() {
    this.dialogTitle = 'Save as New Template';
    this.isDialogOpen = true;
    this.dialogContent = html`
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
    this.isDialogOpen = false;
    this.dialogContent = null;
    this.requestUpdate();
  }}
        >Cancel</sp-button>
        <sp-button
          variant="primary"
          slot="button"
          @click=${() => {
    const dialog = this.shadowRoot.querySelector('sp-dialog');
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
        // Don't change selectedTemplate - keep current selection
        this.requestUpdate();

        this.showToast('New template created successfully');
        this.isDialogOpen = false;
        this.dialogContent = null;
        this.requestUpdate();
      }
    }
  }}
        >Save As New Template</sp-button>
      </div>
    `;
    this.requestUpdate();
  }

  async save() {
    if (!this.selectedTemplate) {
      // Show dialog to get template name for new template
      this.dialogTitle = 'Save as New Template';
      this.isDialogOpen = true;
      this.dialogContent = html`
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
    this.isDialogOpen = false;
    this.dialogContent = null;
    this.requestUpdate();
  }}
          >Cancel</sp-button>
          <sp-button
            variant="primary"
            slot="button"
            @click=${() => {
    const dialog = this.shadowRoot.querySelector('sp-dialog');
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
        this.isDialogOpen = false;
        this.dialogContent = null;
        this.requestUpdate();
      }
    }
  }}
          >Save</sp-button>
        </div>
      `;
      this.requestUpdate();
      return;
    }

    // Show confirmation dialog for updating existing template
    this.dialogTitle = 'Save Changes to Template';
    this.isDialogOpen = true;
    this.dialogContent = html`
      <p>Are you sure you want to save changes to "${this.selectedTemplate.name}"?</p>
      <div class="button-container">
        <sp-button
          variant="secondary"
          slot="button"
          @click=${() => {
    this.isDialogOpen = false;
    this.dialogContent = null;
    this.requestUpdate();
  }}
        >Cancel</sp-button>
        <sp-button
          variant="primary"
          slot="button"
          @click=${() => {
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
      this.isDialogOpen = false;
      this.dialogContent = null;
      this.requestUpdate();
    } catch (error) {
      window.lana?.log(`Error saving template: ${JSON.stringify(error)}`);
      this.showToast('Error saving changes', 'negative');
      this.isDialogOpen = false;
      this.dialogContent = null;
      this.requestUpdate();
    }
  }}
        >Save Changes</sp-button>
      </div>
    `;
    this.requestUpdate();
  }

  resetForm() {
    this.loadFields();
    this.changedFields.clear();
  }

  unselectTemplate() {
    this.selectedTemplate = null;
    this.loadFields(); // Reset to default fields
    this.changedFields.clear();
    this.requestUpdate();
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
                  Save
                </sp-button>
                <sp-button 
                  variant="secondary" 
                  size="m" 
                  ?disabled=${this.changedFields.size === 0} 
                  @click=${this.saveAs}
                >
                  Save As
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
        <sp-underlay ?open=${this.isDialogOpen}></sp-underlay>
        <sp-dialog>
          <h1 slot="heading">${this.dialogTitle}</h1>
          ${this.dialogContent}
        </sp-dialog>
      </div>
    `;
  }
}
